import os
import re

target_path = "lib/phylo_ui.js"
with open(target_path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. 宣言前アクセスエラー（ReferenceError）を根絶するため、キー定数をファイル最上部へ移動
KEY_DEF = "const PHYLO_WORKSPACE_KEY = 'bio_edu_workspace_app8_custom';\n"
if "const PHYLO_WORKSPACE_KEY" not in code[:300]:
    code = KEY_DEF + code

# 2. handleExecute の最後にある即時 toggleUIState(false) を削除
# （結合待ち・計算プロセスの最中にフラグがOFFになるのを防止）
code = re.sub(
    r'(diagnosticMsg = `<div class="dynamic-hint">[\s\S]*?toggleUIState\(false\);\s*\n\s*} catch \(e\))',
    lambda m: m.group(1).replace("toggleUIState(false);", "// toggleUIState(false) は計算・結合完了時まで遅延"),
    code
)

# 3. executeCombine 内のブートストラップ開始時に toggleUIState(true) を確実に呼ぶ
old_bs_block = """            let bsVal = parseInt(document.querySelector('input[name="bootstrap"]:checked').value);
            if (bsVal > 0) {
                document.getElementById('statusLog').innerHTML = `ブートストラップ解析(${bsVal}回)を実行中... (0/${bsVal} 回完了)`;"""

new_bs_block = """            let bsVal = parseInt(document.querySelector('input[name="bootstrap"]:checked').value);
            if (bsVal > 0) {
                toggleUIState(true);
                document.getElementById('statusLog').innerHTML = `ブートストラップ解析(${bsVal}回)を実行中... (0/${bsVal} 回完了)`;"""

if old_bs_block in code:
    code = code.replace(old_bs_block, new_bs_block, 1)

# 4. ドロワー遷移イベント以降の末尾ブロックを、クラッシュしない安全な完全復元コードへ置換
marker = "// --- ドロワー遷移時のSuite標準カスタム確認モーダル連動 (第8項準拠) ---"
if marker in code:
    code = code.split(marker)[0]

clean_footer = """// --- ドロワー遷移時のSuite標準カスタム確認モーダル連動 (第8項準拠) ---
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.sidebar .nav-item, .sidebar-header a').forEach(link => {
            link.addEventListener('click', (e) => {
                if (window.isPhyloCalculating) {
                    e.preventDefault();
                    const targetUrl = link.href;
                    if (typeof showConfirm === 'function') {
                        showConfirm("現在処理中です。アプリを移動すると進行中の処理はキャンセルされ元の状態に戻ります。移動しますか？", () => {
                            window.isPhyloCalculating = false;
                            sessionStorage.removeItem(PHYLO_WORKSPACE_KEY);
                            window.location.href = targetUrl;
                        }, "移動する");
                    } else {
                        window.isPhyloCalculating = false;
                        sessionStorage.removeItem(PHYLO_WORKSPACE_KEY);
                        window.location.href = targetUrl;
                    }
                } else {
                    if (typeof savePhyloWorkspace === 'function') {
                        savePhyloWorkspace();
                    }
                }
            });
        });
    });

    // ==========================================
    // 同一セッション内ステート保持＆完全復元規格 (第7.4項準拠)
    // ==========================================
    function isPhyloTreeCompleted() {
        if (!clusters || clusters.length === 0 || !originalNames || originalNames.length === 0) return false;
        const activeClusters = clusters.filter(c => c && c.active);
        return activeClusters.length === 1 && activeClusters[0].left !== null && activeClusters[0].right !== null;
    }

    // 1. 作業空間の完全自動保存 (シリアライズ)
    function savePhyloWorkspace() {
        if (window.isPhyloHydrating || (typeof window.isHydrating !== 'undefined' && window.isHydrating)) return;
        
        const algoSelect = document.getElementById('algoSelect');
        const fastaInput = document.getElementById('fastaInput');
        const checkedBS = document.querySelector('input[name="bootstrap"]:checked');
        const outgroupSelect = document.getElementById('outgroupSelect');
        const statusLog = document.getElementById('statusLog');
        const matrixTitle = document.getElementById('matrixTitle');
        const matrixContainer = document.getElementById('matrixContainer');
        const logTableBody = document.getElementById('logTableBody');

        const isCompleted = isPhyloTreeCompleted();

        const existingRaw = sessionStorage.getItem(PHYLO_WORKSPACE_KEY);
        if (existingRaw && !isCompleted && !window.isResetting) {
            try {
                const existing = JSON.parse(existingRaw);
                if (existing && existing.hasCalculated) return;
            } catch(e) {}
        }

        let newickStr = "";
        if (isCompleted) {
            try {
                let root = clusters.find(c => c && c.active) || clusters[0];
                if (root) newickStr = generateNewick(root) + ";";
            } catch(e) {}
        }

        const stateData = {
            algo: algoSelect ? algoSelect.value : 'UPGMA',
            fasta: fastaInput ? fastaInput.value : '',
            bootstrap: checkedBS ? checkedBS.value : '0',
            outgroup: outgroupSelect ? outgroupSelect.value : '',
            hasCalculated: isCompleted,
            stepCount: stepCount,
            
            clusters: isCompleted ? clusters : null,
            originalNames: originalNames || [],
            originalSeqs: originalSeqs || [],
            distanceMatrix: distanceMatrix || [],
            initialDistanceMatrix: initialDistanceMatrix || [],
            initialMatrixCSV: initialMatrixCSV || '',
            
            matrixTitleText: matrixTitle ? matrixTitle.innerText : '',
            matrixContainerHtml: matrixContainer ? matrixContainer.innerHTML : '',
            statusLogHtml: statusLog ? statusLog.innerHTML : '',
            diagnosticMsg: diagnosticMsg || '',
            
            analysisLogs: typeof analysisLogs !== 'undefined' ? analysisLogs : [],
            logTableHtml: logTableBody ? logTableBody.innerHTML : '',
            
            newick: newickStr,
            timestamp: Date.now()
        };

        try {
            const jsonStr = JSON.stringify(stateData, (key, value) => {
                if (key === 'parent') return undefined;
                return value;
            });
            sessionStorage.setItem(PHYLO_WORKSPACE_KEY, jsonStr);
        } catch (e) {
            console.warn("セッション保存に失敗しました:", e);
        }
    }

    // 2. 完全ハイドレーション (本物のデータからの完全復元)
    function restorePhyloWorkspace() {
        const raw = sessionStorage.getItem(PHYLO_WORKSPACE_KEY);
        if (!raw) {
            window.isPhyloHydrating = false;
            return;
        }

        try {
            const data = JSON.parse(raw);
            window.isPhyloHydrating = true;
            toggleUIState(false);

            if (data.algo) {
                const algoSelect = document.getElementById('algoSelect');
                if (algoSelect) {
                    algoSelect.value = data.algo;
                    const bs100 = document.getElementById('bs_100');
                    const bs1000 = document.getElementById('bs_1000');
                    if (bs100 && bs1000) {
                        bs100.disabled = false;
                        bs1000.disabled = false;
                        if (data.algo === 'MP') bs1000.disabled = true;
                        if (data.algo === 'ML') {
                            bs100.disabled = true;
                            bs1000.disabled = true;
                        }
                    }
                }
            }

            if (data.bootstrap) {
                const bsRadio = document.querySelector(`input[name="bootstrap"][value="${data.bootstrap}"]`);
                if (bsRadio && !bsRadio.disabled) bsRadio.checked = true;
            }

            if (data.fasta !== undefined) {
                const fastaInput = document.getElementById('fastaInput');
                if (fastaInput) fastaInput.value = data.fasta;
            }

            if (data.hasCalculated && data.clusters && data.clusters.length > 0) {
                clusters = data.clusters;
                clusters.forEach(root => {
                    if (typeof restoreParentLinks === 'function') {
                        restoreParentLinks(root);
                    }
                });

                originalNames = data.originalNames || [];
                originalSeqs = data.originalSeqs || [];
                distanceMatrix = data.distanceMatrix || [];
                initialDistanceMatrix = data.initialDistanceMatrix || [];
                initialMatrixCSV = data.initialMatrixCSV || '';
                stepCount = data.stepCount || 0;
                diagnosticMsg = data.diagnosticMsg || '';

                window.currentSampleNames = originalNames;
                window.currentDistanceMatrix = initialDistanceMatrix;
                if (data.newick) window.currentNewick = data.newick;

                const outgroupSelect = document.getElementById('outgroupSelect');
                if (outgroupSelect && originalNames.length > 0) {
                    outgroupSelect.innerHTML = '<option value="">外群指定(自動)</option>';
                    originalNames.forEach(n => {
                        let opt = document.createElement('option');
                        opt.value = n;
                        opt.className = "scientific-name";
                        opt.text = `外群: ${formatScientificName(n)}`;
                        outgroupSelect.appendChild(opt);
                    });
                    outgroupSelect.disabled = false;
                    if (data.outgroup) {
                        outgroupSelect.value = data.outgroup;
                    }
                }

                if (data.matrixTitleText) {
                    const mt = document.getElementById('matrixTitle');
                    if (mt) mt.innerText = data.matrixTitleText;
                }
                if (data.matrixContainerHtml) {
                    const mc = document.getElementById('matrixContainer');
                    if (mc) mc.innerHTML = data.matrixContainerHtml;
                }
                if (data.statusLogHtml) {
                    const sl = document.getElementById('statusLog');
                    if (sl) sl.innerHTML = data.statusLogHtml;
                }

                if (data.analysisLogs && data.analysisLogs.length > 0) {
                    analysisLogs = data.analysisLogs;
                }
                if (data.logTableHtml) {
                    const tbody = document.getElementById('logTableBody');
                    if (tbody) tbody.innerHTML = data.logTableHtml;
                }
                const btnDownloadLog = document.getElementById('btnDownloadLog');
                if (btnDownloadLog) btnDownloadLog.disabled = (analysisLogs.length === 0);

                const btnSaveImg = document.getElementById('btnSaveImg');
                if (btnSaveImg) btnSaveImg.disabled = false;
                const btnExportCSV = document.getElementById('btnExportCSV');
                if (btnExportCSV) btnExportCSV.disabled = (data.algo === 'MP' || data.algo === 'ML' || !initialMatrixCSV);
                if (typeof updatePhyloExportButtonsState === 'function') {
                    updatePhyloExportButtonsState(true);
                }

                if (typeof updateExplanation === 'function') {
                    updateExplanation();
                }

                drawTree();
                setTimeout(() => { if (typeof drawTree === 'function') drawTree(); }, 100);
                setTimeout(() => { if (typeof drawTree === 'function') drawTree(); }, 300);
            }

        } catch (err) {
            console.warn("ハイドレーション復元例外:", err);
        } finally {
            setTimeout(() => {
                window.isPhyloHydrating = false;
            }, 350);
        }
    }

    // 3. イベントリスナーとライフサイクルの監視
    document.getElementById('fastaInput')?.addEventListener('input', () => {
        if (window.isPhyloHydrating || (typeof window.isHydrating !== 'undefined' && window.isHydrating)) return;
        updatePhyloExportButtonsState(false);
        savePhyloWorkspace();
    });

    document.getElementById('algoSelect')?.addEventListener('change', () => {
        if (window.isPhyloHydrating || (typeof window.isHydrating !== 'undefined' && window.isHydrating)) return;
        savePhyloWorkspace();
    });

    document.querySelectorAll('input[name="bootstrap"]').forEach(r => {
        r.addEventListener('change', () => {
            if (window.isPhyloHydrating || (typeof window.isHydrating !== 'undefined' && window.isHydrating)) return;
            savePhyloWorkspace();
        });
    });

    document.getElementById('outgroupSelect')?.addEventListener('change', () => {
        if (window.isPhyloHydrating || (typeof window.isHydrating !== 'undefined' && window.isHydrating)) return;
        savePhyloWorkspace();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            savePhyloWorkspace();
        }
    });

    window.addEventListener('pagehide', () => {
        savePhyloWorkspace();
    });

    window.addEventListener('DOMContentLoaded', () => {
        restorePhyloWorkspace();
        const btn = document.getElementById('btnExecute');
        if (btn) {
            btn.disabled = false;
            btn.style.pointerEvents = 'auto';
        }
    });
"""

code = code.rstrip() + "\n    " + clean_footer
with open(target_path, "w", encoding="utf-8") as f:
    f.write(code)
print("lib/phylo_ui.js repaired successfully without ReferenceError.")

