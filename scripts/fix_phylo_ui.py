import os

def main():
    """
    lib/phylo_ui.js の末尾にある重複したセッション管理コードを削除し、
    単一の正しいコードブロックに置き換えるスクリプト。
    """
    try:
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        target_file_path = os.path.join(project_root, 'lib', 'phylo_ui.js')
        marker = "// --- ドロワー遷移時のSuite標準カスタム確認モーダル連動 (第8項準拠) ---"

        part1 = r"""
    // --- ドロワー遷移時のSuite標準カスタム確認モーダル連動 (第8項準拠) ---
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
    // 同一セッション内ステート保持＆完全復元規格 (第7.4項準拠・完全決定版)
    // ==========================================
    const PHYLO_WORKSPACE_KEY = 'bio_edu_workspace_app8_custom';

    function isPhyloTreeCompleted() {
        if (!clusters || clusters.length === 0 || !originalNames || originalNames.length === 0) return false;
        const activeClusters = clusters.filter(c => c && c.active);
        return activeClusters.length === 1 && activeClusters[0].left !== null && activeClusters[0].right !== null;
    }
"""
        part2 = r"""
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
        let canvasDataUrl = "";
        if (isCompleted) {
            try {
                let root = clusters.find(c => c && c.active) || clusters[0];
                if (root) newickStr = generateNewick(root) + ";";
            } catch(e) {}
            try {
                const treeCanvas = document.getElementById('treeCanvas');
                if (treeCanvas) canvasDataUrl = treeCanvas.toDataURL("image/png");
            } catch(e) {}
        }

        const stateData = {
            algo: algoSelect ? algoSelect.value : 'UPGMA',
            fasta: fastaInput ? fastaInput.value : '',
            bootstrap: checkedBS ? checkedBS.value : '0',
            outgroup: outgroupSelect ? outgroupSelect.value : '',
            hasCalculated: isCompleted,
            stepCount: stepCount,
            
            originalNames: originalNames || [],
            originalSeqs: originalSeqs || [],
            distanceMatrix: distanceMatrix || [],
            initialDistanceMatrix: initialDistanceMatrix || [],
            initialMatrixCSV: initialMatrixCSV || '',
            
            treeCanvasDataUrl: canvasDataUrl,
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
            sessionStorage.setItem(PHYLO_WORKSPACE_KEY, JSON.stringify(stateData));
        } catch (e) {
            console.warn("セッション保存に失敗しました:", e);
        }
    }
"""

        part3 = r"""
    // 2. 完全ハイドレーション (スナップショット復元)
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

            if (data.hasCalculated) {
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

                if (data.analysisLogs) {
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

                if (data.treeCanvasDataUrl) {
                    const canvas = document.getElementById('treeCanvas');
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        const img = new Image();
                        img.onload = () => {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            ctx.drawImage(img, 0, 0);
                        };
                        img.src = data.treeCanvasDataUrl;
                    }
                }
            }

        } catch (err) {
            console.warn("ハイドレーション復元中に軽微な警告が発生しました:", err);
        } finally {
            setTimeout(() => {
                window.isPhyloHydrating = false;
            }, 350);
        }
    }
"""

    except Exception as e:
        part4 = r"""
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

        new_code_block = part1 + part2 + part3 + part4
        
        with open(target_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        marker_pos = content.find(marker)
        if marker_pos == -1:
            # If marker is not found in the current (partially written) file,
            # it should be in the original file. Let's re-read the original.
             with open(os.path.join(project_root, 'lib', 'phylo_ui.js'), 'r', encoding='utf-8') as f_orig:
                 original_content = f_orig.read()
             marker_pos = original_content.find(marker)
             if marker_pos == -1:
                 print(f"エラー: マーカー '{marker}' が '{target_file_path}' に見つかりませんでした。")
                 return
             content = original_content

        new_content = content[:marker_pos] + new_code_block.lstrip()
        
        with open(target_file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
        print(f"'{target_file_path}' の更新が完了しました。")

        print(f"エラーが発生しました: {e}")

if __name__ == '__main__':
    main()
