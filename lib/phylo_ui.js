// --- ツールチップ機能 (ガイドライン第6項④ 準拠) ---
    function initTooltips() { 
        const tooltip = document.createElement('div'); 
        tooltip.className = 'custom-tooltip'; 
        document.body.appendChild(tooltip); 

        document.body.addEventListener('mouseover', (e) => { 
            const target = e.target.closest('[data-tooltip]'); 
            if (target && !target.classList.contains('rationale-btn')) { 
                tooltip.innerHTML = target.getAttribute('data-tooltip'); 
                tooltip.style.display = 'block'; 
                const rect = target.getBoundingClientRect(); 
                const ttRect = tooltip.getBoundingClientRect(); 
                let topPos = rect.top - ttRect.height - 8; 
                let leftPos = rect.left + (rect.width / 2); 
                let arrowClass = 'show-top'; 
                if (topPos < 0) { topPos = rect.bottom + 8; arrowClass = 'show-bottom'; } 
                if (leftPos - ttRect.width / 2 < 5) leftPos = 5 + ttRect.width / 2; 
                else if (leftPos + ttRect.width / 2 > window.innerWidth - 5) leftPos = window.innerWidth - ttRect.width / 2 - 5; 
                tooltip.className = `custom-tooltip ${arrowClass}`; 
                tooltip.style.top = topPos + 'px'; 
                tooltip.style.left = leftPos + 'px'; 
                tooltip.style.transform = 'translateX(-50%)'; 
                tooltip.style.opacity = '1'; 
            } 
        }); 
        document.body.addEventListener('mouseout', (e) => { 
            if (e.target.closest('[data-tooltip]')) { 
                tooltip.style.opacity = '0'; 
                setTimeout(() => { if (tooltip.style.opacity === '0') tooltip.style.display = 'none'; }, 200); 
            } 
        }); 
    }
    initTooltips();

    // --- ポップオーバー解説パネル (ガイドライン第6項① 準拠) ---
    function toggleRationale(event, id) { 
        event.stopPropagation(); 
        const el = document.getElementById(id); 
        const btn = event.currentTarget; 
        const isShown = el.classList.contains('show'); 

        document.querySelectorAll('.rationale-text').forEach(e => { 
            e.classList.remove('show', 'arrow-top', 'arrow-bottom'); 
        }); 

        if(!isShown) { 
            if (el.parentNode !== document.body) document.body.appendChild(el); 
            el.style.top = '0px'; el.style.left = '0px'; 
            el.classList.add('show'); 

            const elHeight = el.offsetHeight; 
            const elWidth = el.offsetWidth; 
            const rect = btn.getBoundingClientRect(); 

            let topPos = rect.bottom + 12; 
            let arrowClass = 'arrow-top'; 

            if (rect.bottom + elHeight + 20 > window.innerHeight) { 
                topPos = rect.top - elHeight - 12; 
                arrowClass = 'arrow-bottom'; 
            } 
            el.classList.add(arrowClass); 
            el.style.top = topPos + 'px'; 

            let leftPos = rect.left - (elWidth / 2) + (rect.width / 2); 
            if (leftPos + elWidth > window.innerWidth) leftPos = window.innerWidth - elWidth - 10; 
            if (leftPos < 10) leftPos = 10; 
            el.style.left = leftPos + 'px'; 

            const arrowOffset = rect.left - leftPos + (rect.width / 2) - 6; 
            el.style.setProperty('--arrow-left', arrowOffset + 'px'); 
        } 
    } 

    document.addEventListener('click', (e) => { 
        if (!e.target.closest('.rationale-text') && !e.target.closest('.rationale-btn')) { 
            document.querySelectorAll('.rationale-text').forEach(el => { 
                el.classList.remove('show', 'arrow-top', 'arrow-bottom'); 
            }); 
        } 
    }); 

    document.addEventListener('scroll', () => { 
        document.querySelectorAll('.rationale-text').forEach(el => { 
            el.classList.remove('show', 'arrow-top', 'arrow-bottom'); 
        }); 
    }, true); 

    let originalSeqs = []; 
    let originalNames = [], clusters = [], distanceMatrix = [], stepCount = 0, nextNodeId = 0;
    let initialDistanceMatrix = [];
    let selectedPair = null; 
    let initialMatrixCSV = ""; 
    let diagnosticMsg = "";

    // MP法用
    let mpNames = [];
    let mpScores = [0, 0, 0];
    let mpMinScore = 0;
    let step3Order = [1, 2, 3]; 

    // ML法用 (v32.2 計算エンジン実装版)
    let mlNames = [];
    let mlSeqs = [];
    let mlVarSites = []; 
    let mlSelectedSiteInfo = null; 
    let mlSelectedTreeType = 0; 
    let mlOptimalBranch = 0.1;
    let mlLnLData = []; // 事前計算した尤度曲線データ
    let mlMaxLnL = -Infinity;
    let mlMinLnL = Infinity;
    
    // ML法 追加ロジック
    let mlFoundTransitions = [];
    let mlFoundTransversions = [];

    let analysisLogs = [];
    let isMasked = false; // トグルボタン用状態変数
    let isMLMasked = false; // ML法マスク用

    // --- トースト通知 (ガイドライン第6項⑤ 準拠) ---
    function showToast(msg, type = "") {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.innerText = msg;
        let className = "show";
        if (type === "error") className += " error";
        else if (type === "warning") className += " warning";
        else if (type === "info") className += " info";
        toast.className = "";
        void toast.offsetWidth; 
        toast.className = className;
        setTimeout(() => { toast.classList.remove("show"); }, 3000);
    }

    function switchAlgo() {
        clusters = [];
        distanceMatrix = [];
        stepCount = 0;
        selectedPair = null;
        document.getElementById('matrixContainer').innerHTML = '<div style="text-align:center; padding:15px; color:#7f8c8d; font-size:10px;">上の「▶ 実行」ボタンを押して行列を作成してください。</div>';
        document.getElementById('statusLog').innerHTML = '[SYSTEM] アルゴリズムを変更しました。「▶ 実行」から再計算してください。';
        document.getElementById('btnNextStep').style.display = 'none';
        document.getElementById('btnExportCSV').disabled = true;
        document.getElementById('btnSaveImg').disabled = true;
        document.getElementById('treeExplanation').style.display = 'none';
        document.getElementById('autoDiagPanel').style.display = 'none';
        
        const btnCopyNewick = document.getElementById('btnCopyNewick');
        if (btnCopyNewick) btnCopyNewick.disabled = true;
        if (typeof updatePhyloExportButtonsState === 'function') updatePhyloExportButtonsState(false);
        
        const canvas = document.getElementById('treeCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let outgroupSelect = document.getElementById('outgroupSelect');
        outgroupSelect.innerHTML = '<option value="">外群指定(自動)</option>';
        outgroupSelect.disabled = true;

        // --- ブートストラップ上限の動的制御 ---
        const algo = document.getElementById('algoSelect').value;
        const bs100 = document.getElementById('bs_100');
        const bs1000 = document.getElementById('bs_1000');
        const bsNone = document.getElementById('bs_none');
        
        if (algo === 'UPGMA' || algo === 'NJ') {
            bs100.disabled = false;
            bs1000.disabled = false;
        } else if (algo === 'MP') {
            bs100.disabled = false;
            bs1000.disabled = true;
            if (bs1000.checked) {
                bsNone.checked = true;
            }
            showToast("※最大節約法(MP法)は計算負荷が高いため、ブートストラップは最大100回までです", "info");
        } else if (algo === 'ML') {
            bs100.disabled = true;
            bs1000.disabled = true;
            if (bs100.checked || bs1000.checked) {
                bsNone.checked = true;
            }
            showToast("※最尤法(ML法)は計算量が非常に重いため、ブートストラップは最大10回までです", "warning");
        }

        // --- 解説UIの動的切り替え ---
        const ratMatrix = document.getElementById('rat_matrix');
        const ratUpgma = document.getElementById('rat_upgma');
        const manualCombineTip = document.getElementById('manualCombineTip');

        if (algo === 'UPGMA' || algo === 'NJ') {
            if (ratMatrix) ratMatrix.innerHTML = '<strong>【根拠：距離行列とは？】</strong><br>解析ソフトは、まず「AとBは何文字違うか？」という総当たりで比較を行い、塩基配列やアミノ酸配列の違いの割合を表にした<strong>「距離行列」</strong>を作ります。共通祖先から分岐してからの時間が長いほど、配列の違い（距離）は大きくなるという前提です。';
            if (ratUpgma) ratUpgma.innerHTML = '<strong>【根拠：結合アルゴリズムの違い】</strong><br>・<strong>平均距離法 (UPGMA法):</strong> 塩基置換速度が一定であると仮定し、単純な平均距離で更新します。共通祖先からの距離が全て揃います。<br>・<strong>近隣結合法 (NJ法):</strong> 「Q行列」という補正を行い、系統ごとに異なる塩基置換速度を考慮して計算します。<br>・実際の紙での計算と同じように、計算済みのペアは斜線で消し、新しいグループをまとめて行列を更新していきます。';
            if (manualCombineTip) manualCombineTip.style.display = 'block';
        } else if (algo === 'MP' || algo === 'ML') {
            if (ratMatrix) ratMatrix.innerHTML = '<strong>【根拠：全探索（Exhaustive Search）とは？】</strong><br>MP法やML法は距離行列を作らず、考えうるすべての系統樹の枝分かれパターン（トポロジー）をコンピュータ内で生成し、実際の塩基配列と最も辻褄が合うものを一つ一つ検証して選び出します。';
            if (ratUpgma) ratUpgma.innerHTML = '<strong>【根拠：評価基準の違い】</strong><br>・<strong>最大節約法 (MP法):</strong> 「突然変異の回数が最も少なくなる樹形」を最適解として選びます。<br>・<strong>最尤法 (ML法):</strong> 「確率モデルに照らし合わせて、現在の配列になる確率（尤度）が最も高くなる樹形」を最適解として選びます。';
            if (manualCombineTip) manualCombineTip.style.display = 'none';
        }
    }

    function updateExplanation() {
        const algo = document.getElementById('algoSelect').value;
        const panel = document.getElementById('treeExplanation');
        const text = document.getElementById('explanationText');
        
        if (clusters.length === 0) {
            panel.style.display = 'none';
            return;
        }
        
        panel.style.display = 'block';
        if (algo === 'UPGMA') {
            text.innerHTML = `<strong>平均距離法 (UPGMA法):</strong> すべての分類群が「同じ速度で進化した」と仮定しています。そのため、分岐点（共通祖先）から現在の生物（葉）までの<strong>枝の長さ（横方向の距離）がすべて同じ</strong>になります。左下のスケールバー（10 Mismatch = 10%の塩基・アミノ酸の違い）と横幅を比較することで、分岐したのがどれくらい昔かを直感的に読み取れます。`;
        } else if (algo === 'NJ') {
            text.innerHTML = `<strong>近隣結合法 (NJ法):</strong> 分類群ごとに「塩基置換速度が異なる」ことを考慮して計算しています。そのため、UPGMA法とは異なり、<strong>現在の生物（葉）の右端が揃わず、枝の長さがバラバラ</strong>になります。横に長く伸びている枝ほど、その系統で多くの突然変異（またはアミノ酸置換）が蓄積したことを示しています。`;
        } else if (algo === 'MP') {
            text.innerHTML = `<strong>最大節約法 (MP法):</strong> 分類群間の全体的な距離（数値）ではなく、「1つ1つの塩基の違い」を直接評価しています。<strong>枝の長さは「その系統で起こった突然変異（塩基置換）の回数（ステップ数）」</strong>を表します。計算上、最も突然変異が少なくなる（無駄がない）樹形が選ばれています。`;
        } else if (algo === 'ML') {
            text.innerHTML = `<strong>最尤法 (ML法):</strong> 進化モデル（今回はJC69モデル）を仮定し、「この系統樹と枝の長さだった場合、現在の塩基配列が得られる確率（尤度）」が最大になるものを探索しています。枝の長さは<strong>「1サイトあたりの平均塩基置換数（Substitutions/Site）」</strong>を表します。`;
        }
    }

    const dropZone = document.getElementById('dropZone');
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(name => dropZone.addEventListener(name, e => {e.preventDefault(); e.stopPropagation();}));
    dropZone.addEventListener('dragover', () => dropZone.classList.add('dragover'));
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
        dropZone.classList.remove('dragover');
        const reader = new FileReader();
        reader.onload = ev => { document.getElementById('fastaInput').value = ev.target.result; };
        reader.readAsText(e.dataTransfer.files[0]);
    });

    function handleFiles(e) {
        const reader = new FileReader();
        reader.onload = ev => { document.getElementById('fastaInput').value = ev.target.result; };
        reader.readAsText(e.target.files[0]);
    }

    function formatScientificName(name) {
        let originalName = name.trim();
        
        const ncbiPattern = /[A-Z]{1,2}_?\d{4,}/i;
        const scientificNamePattern = /^[A-Z][a-z]+\s+[a-z]+/;
        
        if (ncbiPattern.test(originalName) || scientificNamePattern.test(originalName)) {
            let clean = originalName.replace(/[A-Z]{1,2}_?\d{4,}/ig, '').replace(/_/g, ' ').trim();
            let parts = clean.split(/\s+/).filter(p => p.length > 0);
            
            if (parts.length >= 2) {
                let genus = parts[0].charAt(0).toUpperCase();
                let species = parts[1].replace(/[^a-zA-Z]/g, '').toLowerCase(); 
                if (species.length > 0) {
                    return `${genus}. ${species}`; 
                }
            }
            return clean.length > 0 ? clean : originalName;
        }

        return originalName;
    }

    // --- 実行中のUI完全ロック機構 (v33.0 UIガードレール準拠) ---
    function toggleUIState(isProcessing) {
        const algoSelect = document.getElementById('algoSelect');
        const fastaInput = document.getElementById('fastaInput');
        const bsRadios = document.querySelectorAll('input[name="bootstrap"]');
        const dropZone = document.getElementById('dropZone');
        const btnExecute = document.getElementById('btnExecute');

        if (isProcessing) {
            if (algoSelect) algoSelect.disabled = true;
            if (fastaInput) fastaInput.disabled = true;
            if (bsRadios) bsRadios.forEach(r => r.disabled = true);
            if (dropZone) dropZone.style.pointerEvents = 'none';
            if (btnExecute) {
                btnExecute.disabled = true;
                btnExecute.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> 実行中...';
            }
        } else {
            if (algoSelect) algoSelect.disabled = false;
            if (fastaInput) fastaInput.disabled = false;
            if (dropZone) dropZone.style.pointerEvents = 'auto';
            if (btnExecute) {
                btnExecute.disabled = false;
                btnExecute.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> 実行';
            }
            
            // --- ブートストラップラジオボタンの動的復元 (アルゴリズム依存) ---
            const algo = algoSelect ? algoSelect.value : '';
            const bs100 = document.getElementById('bs_100');
            const bs1000 = document.getElementById('bs_1000');
            
            if (bsRadios) bsRadios.forEach(r => r.disabled = false); // 一旦すべて解除
            if (algo === 'MP') {
                if (bs1000) bs1000.disabled = true; // MP法は1000回を禁止
            } else if (algo === 'ML') {
                if (bs100) bs100.disabled = true; // ML法は100回を禁止
                if (bs1000) bs1000.disabled = true; // ML法は1000回を禁止
            }
        }
    }

    function handleExecute() {
        toggleUIState(true);
        
        const algo = document.getElementById('algoSelect').value;
        const fastaText = document.getElementById('fastaInput').value;
        
        try {
            const result = PhyloEngine.parseAndCalculateMatrix(fastaText);
            if (!result.success) {
                if (result.error === 'LENGTH_MISMATCH') {
                    document.getElementById('errorSuggestModal').style.display = 'flex';
                } else {
                    showToast(result.message, "warning");
                }
                toggleUIState(false);
                return;
            }

            if (algo === 'MP') {
                executeMP(fastaText, result);
                return;
            }
            if (algo === 'ML') {
                executeML(fastaText, result);
                return;
            }
            
            originalSeqs = result.seqs;
            originalNames = result.names;
            distanceMatrix = result.distanceMatrix;
            initialDistanceMatrix = result.distanceMatrix ? result.distanceMatrix.map(row => [...row]) : [];
            window.currentSampleNames = originalNames;
            window.currentDistanceMatrix = initialDistanceMatrix;
            
            let totalChars = 0;
            let gapChars = 0;
            originalSeqs.forEach(s => {
                totalChars += s.seq.length;
                let gaps = s.seq.match(/[-N?]/g);
                if(gaps) gapChars += gaps.length;
            });
            let gapRatio = (gapChars / totalChars * 100).toFixed(1);
            let algoNameDisplay = algo === "UPGMA" ? "UPGMA法" : "NJ法";
            
            diagnosticMsg = `<div class="dynamic-hint">`;
            diagnosticMsg += `診断レポート<br>`;
            diagnosticMsg += `・入力データに含まれるギャップ(欠失)や未確定塩基(N)の割合は ${gapRatio}% です。<br>`;
            if(gapRatio > 10) diagnosticMsg += `ノイズが多い可能性があります。配列の端を揃える（トリミング）などの処理を検討してください。<br>`;
            diagnosticMsg += `・現在 ${algoNameDisplay} で計算しています。結果が直感と異なる場合、もう一方のアルゴリズムを試して進化速度の違いを考察してみましょう。</div>`;
            
            document.getElementById('autoDiagPanel').style.display = 'none';

            let outgroupSelect = document.getElementById('outgroupSelect');
            outgroupSelect.innerHTML = '<option value="">外群指定(自動)</option>';
            originalNames.forEach(n => {
                let opt = document.createElement('option');
                opt.value = n;
                opt.className = "scientific-name"; 
                opt.text = `外群: ${formatScientificName(n)}`;
                outgroupSelect.appendChild(opt);
            });
            outgroupSelect.disabled = false;
            
            clusters = originalSeqs.map((s, i) => ({ 
                name: s.name, id: i, size: 1, maxDepth: 0, edge: 0, left: null, right: null, active: true, minLeafIndex: i 
            }));
            nextNodeId = originalSeqs.length;
            
            stepCount = 1; selectedPair = null;
            document.getElementById('btnNextStep').style.display = 'none'; 
            document.getElementById('btnExportCSV').disabled = false;
            document.getElementById('btnSaveImg').disabled = false;
            const btnCopyNewick = document.getElementById('btnCopyNewick');
            if (btnCopyNewick) btnCopyNewick.disabled = true;
            updatePhyloExportButtonsState(false);
            
            if(algo === "NJ") {
                document.getElementById('matrixTitle').innerText = "2. 現在の NJ Q行列 (枝の長さ補正後)";
            } else {
                document.getElementById('matrixTitle').innerText = "2. 現在の距離行列 (不一致率 %)";
            }

            document.getElementById('statusLog').innerHTML = `[STEP 1] 行列を作成しました。<br>表のセルをクリックして、<b>一番数字が小さい（距離が近い）ペア</b>を探し出してください！`;
            
            createCSV();
            renderMatrix(); 
            updateExplanation();
            drawTree(); 
            
            if (result.hasDuplicate) {
                setTimeout(() => {
                    showToast("距離が0.0のペアがあります。同種または重複データの可能性があります。", "warning");
                }, 500);
            }
            
            toggleUIState(false);
            
        } catch (e) {
            showToast("エラーが発生しました: " + e.message, "error");
            toggleUIState(false);
        }
    }

    function executeMP(fastaText, result) {
        if (result.seqs.length > 7) {
            showToast("【計算リミッター】最大節約法(MP法)の全探索は、計算の爆発を防ぐため配列数7個までとしています。配列数を減らしてください。", "error");
            toggleUIState(false);
            return;
        }

        document.getElementById('matrixTitle').innerText = "2. 解析実行パネル (MP法)";
        document.getElementById('matrixContainer').innerHTML = `
            <div style="padding:20px; text-align:center;">
                <div style="font-size:14px; font-weight:bold; color:var(--text-main); margin-bottom:10px;">
                    最大節約法 (MP法) の全樹形探索を実行中...
                </div>
                <div style="font-size:12px; color:var(--text-muted);">
                    考えうるすべての系統樹パターンを生成し、フィッチのアルゴリズムで最小突然変異数を評価しています。
                </div>
                <div style="margin-top:15px; width:100%; max-width: 400px; margin-left: auto; margin-right: auto; background:#ecf0f1; height:8px; border-radius:4px; overflow:hidden; position:relative;">
                    <div style="position:absolute; top:0; left:0; height:100%; width:30%; background:#3498db; animation: loading-mp 1.5s infinite ease-in-out;"></div>
                </div>
            </div>
            <style>
                @keyframes loading-mp {
                    0% { left: -30%; }
                    100% { left: 100%; }
                }
            </style>
        `;

        document.getElementById('statusLog').innerHTML = `[SYSTEM] 最大節約法（総当たり探索）を実行中...`;
        
        document.getElementById('btnNextStep').style.display = 'none';
        document.getElementById('btnExportCSV').disabled = true;

        const worker = new Worker('lib/phylo_worker.js');
        worker.postMessage({ type: 'CALC_MP', seqs: result.seqs });

        worker.onmessage = function(e) {
            if (e.data.type === 'PROGRESS_EVAL') {
                const el = document.getElementById('evalProgress');
                if(el) {
                    el.innerText = `${e.data.completed} / ${e.data.total}`;
                } else {
                    document.getElementById('statusLog').innerHTML = `[SYSTEM] 最大節約法（総当たり探索）を実行中... (<span id="evalProgress" style="color:#e67e22; font-weight:bold;">${e.data.completed} / ${e.data.total}</span> パターン評価済み)`;
                }
            } else if (e.data.type === 'SUCCESS') {
                const rootNode = e.data.tree;
                restoreParentLinks(rootNode);
                clusters = [rootNode];
                originalNames = result.names;
                initialDistanceMatrix = result.distanceMatrix ? result.distanceMatrix.map(row => [...row]) : [];
                window.currentSampleNames = originalNames;
                window.currentDistanceMatrix = initialDistanceMatrix;
                
                let outgroupSelect = document.getElementById('outgroupSelect');
                outgroupSelect.innerHTML = '<option value="">外群指定(自動)</option>';
                originalNames.forEach(n => {
                    let opt = document.createElement('option');
                    opt.value = n;
                    opt.className = "scientific-name"; 
                    opt.text = `外群: ${formatScientificName(n)}`;
                    outgroupSelect.appendChild(opt);
                });
                outgroupSelect.disabled = false;

                document.getElementById('matrixContainer').innerHTML = `
                    <div style="padding:20px; text-align:center;">
                        <div style="font-size:14px; font-weight:bold; color:var(--success);">解析完了</div>
                        <div style="font-size:12px; color:var(--text-main); margin-top:5px;">
                            評価済み樹形数: ${e.data.treesEvaluated} パターン<br>
                            最小突然変異数 (最節約ステップ): <span style="font-size:14px; color:#e67e22; font-weight:bold;">${e.data.minScore}</span> 回
                        </div>
                    </div>
                `;

                let bsVal = parseInt(document.querySelector('input[name="bootstrap"]:checked').value);
                if (bsVal > 0) {
                    document.getElementById('statusLog').innerHTML = `ブートストラップ解析(${bsVal}回)を実行中... (0/${bsVal} 回完了)`;
                    document.getElementById('btnSaveImg').disabled = true;
                    const btnCopyNewick = document.getElementById('btnCopyNewick');
                    if (btnCopyNewick) btnCopyNewick.disabled = true;
                    updatePhyloExportButtonsState(false);
                    
                    const bsWorker = new Worker('lib/phylo_worker.js');
                    bsWorker.postMessage({ type: 'CALC_BOOTSTRAP', seqs: result.seqs, algo: 'MP', iterations: bsVal });

                    bsWorker.onmessage = function(bsEvent) {
                        if (bsEvent.data.type === 'PROGRESS') {
                            document.getElementById('statusLog').innerHTML = `ブートストラップ解析(${bsVal}回)を実行中... (<span style="color:#e67e22; font-weight:bold;">${bsEvent.data.completed}</span>/${bsVal} 回完了)`;
                        } else if (bsEvent.data.type === 'SUCCESS_BOOTSTRAP') {
                            assignBootstrapValues(clusters[0], bsEvent.data.cladeCounts, bsVal);
                            
                            document.getElementById('statusLog').innerHTML = `<b>系統樹完成！</b> 最大節約法 (MP法) とブートストラップ解析が完了しました。<br><span style="color:#f1c40f;">※分岐点に表示されている数値（%）がブートストラップ値（分岐の信頼性）です。</span>`;
                            
                            document.getElementById('btnSaveImg').disabled = false;
                            const btnCopyNewick = document.getElementById('btnCopyNewick');
                            if (btnCopyNewick) btnCopyNewick.disabled = false;
                            updatePhyloExportButtonsState(true);

                            updateExplanation();
                            drawTree();
                            
                            let finalRoot = clusters[0];
                            let outgroupName = document.getElementById('outgroupSelect').value;
                            if (outgroupName) finalRoot = getRoutedTree(finalRoot, outgroupName);
                            addLogEntry('MP', bsVal, finalRoot);
                            
                            toggleUIState(false);
                        } else if (bsEvent.data.type === 'ERROR') {
                            showToast(bsEvent.data.message, "error");
                            document.getElementById('statusLog').innerHTML = `[エラー] ブートストラップ解析に失敗しました。`;
                            toggleUIState(false);
                        }
                    };
                } else {
                    document.getElementById('statusLog').innerHTML = `<b>系統樹完成！</b> 最大節約法 (MP法) による全探索が完了し、最も進化の無駄が少ない（最節約的な）樹形が得られました。`;
                    
                    document.getElementById('btnSaveImg').disabled = false;
                    const btnCopyNewick = document.getElementById('btnCopyNewick');
                    if (btnCopyNewick) btnCopyNewick.disabled = false;
                    updatePhyloExportButtonsState(true);

                    updateExplanation();
                    drawTree();
                    
                    let finalRoot = clusters[0];
                    let outgroupName = document.getElementById('outgroupSelect').value;
                    if (outgroupName) finalRoot = getRoutedTree(finalRoot, outgroupName);
                    addLogEntry('MP', 0, finalRoot);
                    
                    toggleUIState(false);
                }

            } else if (e.data.type === 'ERROR') {
                showToast(e.data.message, "error");
                document.getElementById('statusLog').innerHTML = `[エラー] 解析に失敗しました。`;
                document.getElementById('matrixContainer').innerHTML = `<div style="text-align:center; padding:15px; color:#e74c3c; font-size:12px; font-weight:bold;">${e.data.message}</div>`;
                toggleUIState(false);
            }
        };
    }

    function executeML(fastaText, result) {
        if (result.seqs.length > 7) {
            showToast("【計算リミッター】最尤法(ML法)の全探索は、計算の爆発を防ぐため配列数7個までとしています。配列数を減らしてください。", "error");
            toggleUIState(false);
            return;
        }

        document.getElementById('matrixTitle').innerText = "2. 解析実行パネル (ML法)";
        document.getElementById('matrixContainer').innerHTML = `
            <div style="padding:20px; text-align:center;">
                <div style="font-size:14px; font-weight:bold; color:var(--text-main); margin-bottom:10px;">
                    最尤法 (ML法) の全樹形探索を実行中...
                </div>
                <div style="font-size:12px; color:var(--text-muted);">
                    考えうるすべての系統樹パターンを生成し、JC69モデルを用いたフェルゼンスタインの剪定アルゴリズムで最大尤度を探索しています。
                </div>
                <div style="margin-top:15px; width:100%; max-width: 400px; margin-left: auto; margin-right: auto; background:#ecf0f1; height:8px; border-radius:4px; overflow:hidden; position:relative;">
                    <div style="position:absolute; top:0; left:0; height:100%; width:30%; background:#3498db; animation: loading-mp 1.5s infinite ease-in-out;"></div>
                </div>
            </div>
            <style>
                @keyframes loading-mp {
                    0% { left: -30%; }
                    100% { left: 100%; }
                }
            </style>
        `;

        document.getElementById('statusLog').innerHTML = `[SYSTEM] 最尤法（総当たり探索）を実行中...`;
        
        document.getElementById('btnNextStep').style.display = 'none';
        document.getElementById('btnExportCSV').disabled = true;

        const worker = new Worker('lib/phylo_worker.js');
        worker.postMessage({ type: 'CALC_ML', seqs: result.seqs });

        worker.onmessage = function(e) {
            if (e.data.type === 'PROGRESS_EVAL') {
                const el = document.getElementById('evalProgress');
                if(el) {
                    el.innerText = `${e.data.completed} / ${e.data.total}`;
                } else {
                    document.getElementById('statusLog').innerHTML = `[SYSTEM] 最尤法（総当たり探索）を実行中... (<span id="evalProgress" style="color:#e67e22; font-weight:bold;">${e.data.completed} / ${e.data.total}</span> パターン評価済み)`;
                }
            } else if (e.data.type === 'SUCCESS') {
                const rootNode = e.data.tree;
                restoreParentLinks(rootNode);
                clusters = [rootNode];
                originalNames = result.names;
                initialDistanceMatrix = result.distanceMatrix ? result.distanceMatrix.map(row => [...row]) : [];
                window.currentSampleNames = originalNames;
                window.currentDistanceMatrix = initialDistanceMatrix;
                
                let outgroupSelect = document.getElementById('outgroupSelect');
                outgroupSelect.innerHTML = '<option value="">外群指定(自動)</option>';
                originalNames.forEach(n => {
                    let opt = document.createElement('option');
                    opt.value = n;
                    opt.className = "scientific-name"; 
                    opt.text = `外群: ${formatScientificName(n)}`;
                    outgroupSelect.appendChild(opt);
                });
                outgroupSelect.disabled = false;

                let lnL = e.data.maxLogLikelihood.toFixed(4);

                document.getElementById('matrixContainer').innerHTML = `
                    <div style="padding:20px; text-align:center;">
                        <div style="font-size:14px; font-weight:bold; color:var(--success);">解析完了</div>
                        <div style="font-size:12px; color:var(--text-main); margin-top:5px;">
                            評価済み樹形数: ${e.data.treesEvaluated} パターン<br>
                            最大対数尤度 (ln L): <span style="font-size:14px; color:#e67e22; font-weight:bold;">${lnL}</span>
                        </div>
                    </div>
                `;
                
                let bsVal = parseInt(document.querySelector('input[name="bootstrap"]:checked').value);
                
                if (bsVal > 0) {
                    document.getElementById('statusLog').innerHTML = `ブートストラップ解析(${bsVal}回)を実行中... (0/${bsVal} 回完了)`;
                    document.getElementById('btnSaveImg').disabled = true;
                    const btnCopyNewick = document.getElementById('btnCopyNewick');
                    if (btnCopyNewick) btnCopyNewick.disabled = true;
                    updatePhyloExportButtonsState(false);
                    
                    const bsWorker = new Worker('lib/phylo_worker.js');
                    bsWorker.postMessage({ type: 'CALC_BOOTSTRAP', seqs: result.seqs, algo: 'ML', iterations: bsVal });

                    bsWorker.onmessage = function(bsEvent) {
                        if (bsEvent.data.type === 'PROGRESS') {
                            document.getElementById('statusLog').innerHTML = `ブートストラップ解析(${bsVal}回)を実行中... (<span style="color:#e67e22; font-weight:bold;">${bsEvent.data.completed}</span>/${bsVal} 回完了)`;
                        } else if (bsEvent.data.type === 'SUCCESS_BOOTSTRAP') {
                            assignBootstrapValues(clusters[0], bsEvent.data.cladeCounts, bsVal);
                            
                            document.getElementById('statusLog').innerHTML = `<b>系統樹完成！</b> 最尤法 (ML法) とブートストラップ解析が完了しました。<br><span style="color:#f1c40f;">※分岐点に表示されている数値（%）がブートストラップ値（分岐の信頼性）です。</span>`;
                            
                            document.getElementById('btnSaveImg').disabled = false;
                            const btnCopyNewick = document.getElementById('btnCopyNewick');
                            if (btnCopyNewick) btnCopyNewick.disabled = false;
                            updatePhyloExportButtonsState(true);

                            updateExplanation();
                            drawTree();
                            
                            let finalRoot = clusters[0];
                            let outgroupName = document.getElementById('outgroupSelect').value;
                            if (outgroupName) finalRoot = getRoutedTree(finalRoot, outgroupName);
                            addLogEntry('ML', bsVal, finalRoot);
                            
                            toggleUIState(false);
                        } else if (bsEvent.data.type === 'ERROR') {
                            showToast(bsEvent.data.message, "error");
                            document.getElementById('statusLog').innerHTML = `[エラー] ブートストラップ解析に失敗しました。`;
                            toggleUIState(false);
                        }
                    };
                } else {
                    document.getElementById('statusLog').innerHTML = `<b>系統樹完成！</b> 最尤法 (ML法) による全探索が完了し、最も尤もらしい（尤度が高い）樹形が得られました。`;
                    
                    document.getElementById('btnSaveImg').disabled = false;
                    const btnCopyNewick = document.getElementById('btnCopyNewick');
                    if (btnCopyNewick) btnCopyNewick.disabled = false;
                    updatePhyloExportButtonsState(true);

                    updateExplanation();
                    drawTree();
                    
                    let finalRoot = clusters[0];
                    let outgroupName = document.getElementById('outgroupSelect').value;
                    if (outgroupName) finalRoot = getRoutedTree(finalRoot, outgroupName);
                    addLogEntry('ML', 0, finalRoot);
                    
                    toggleUIState(false);
                }

            } else if (e.data.type === 'ERROR') {
                showToast(e.data.message, "error");
                document.getElementById('statusLog').innerHTML = `[エラー] 解析に失敗しました。`;
                document.getElementById('matrixContainer').innerHTML = `<div style="text-align:center; padding:15px; color:#e74c3c; font-size:12px; font-weight:bold;">${e.data.message}</div>`;
                toggleUIState(false);
            }
        };
    }

    function restoreParentLinks(node, parent = null) {
        if (!node) return;
        node.parent = parent;
        if (node.left) restoreParentLinks(node.left, node);
        if (node.right) restoreParentLinks(node.right, node);
    }

    function createCSV() {
        let csv = "塩基配列/アミノ酸配列," + originalNames.join(",") + "\n";
        for(let i=0; i<originalNames.length; i++) {
            csv += originalNames[i] + ",";
            let rowVals = [];
            for(let j=0; j<originalNames.length; j++) {
                rowVals.push(i === j ? "0.0" : distanceMatrix[i][j].toFixed(2));
            }
            csv += rowVals.join(",") + "\n";
        }
        initialMatrixCSV = csv;
    }

    function exportMatrixCSV() {
        if(!initialMatrixCSV) return;
        const a = document.createElement('a'); 
        a.href = URL.createObjectURL(new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), initialMatrixCSV], { type: 'text/csv;charset=utf-8;' }));
        a.download = "distance_matrix.csv"; 
        a.click();
    }

    function saveTreeImage() {
        const canvas = document.getElementById('treeCanvas');
        const a = document.createElement('a');
        a.href = canvas.toDataURL("image/png");
        a.download = "phylogenetic_tree.png";
        a.click();
    }

    function getCladeId(node) {
        if (!node) return "";
        if (!node.left && !node.right) return node.name;
        let leaves = [];
        function collectLeaves(n) {
            if (!n) return;
            if (!n.left && !n.right) leaves.push(n.name);
            collectLeaves(n.left);
            collectLeaves(n.right);
        }
        collectLeaves(node);
        return leaves.sort().join(',');
    }

    function extractCladeLogs(node) {
        let results = [];
        function traverse(n) {
            if (!n || (!n.left && !n.right)) return;
            let leaves = getCladeId(n).split(',');
            if (leaves.length < originalNames.length && leaves.length > 1) { 
                let bs = n.bootstrap !== undefined ? `${n.bootstrap}%` : '-';
                let formattedLeaves = leaves.map(l => formatScientificName(l)).join(', ');
                results.push(`(${formattedLeaves}): ${bs}`);
            }
            traverse(n.left);
            traverse(n.right);
        }
        traverse(node);
        return results.join('<br>');
    }

    function extractCladeLogsCSV(node) {
        let results = [];
        function traverse(n) {
            if (!n || (!n.left && !n.right)) return;
            let leaves = getCladeId(n).split(',');
            if (leaves.length < originalNames.length && leaves.length > 1) {
                let bs = n.bootstrap !== undefined ? `${n.bootstrap}%` : '-';
                let formattedLeaves = leaves.map(l => formatScientificName(l)).join(', ');
                results.push(`(${formattedLeaves}): ${bs}`);
            }
            traverse(n.left);
            traverse(n.right);
        }
        traverse(node);
        return results.join(' | ');
    }

    function addLogEntry(algo, bsVal, rootNode) {
        let runId = analysisLogs.length + 1;
        let bsStr = bsVal > 0 ? `${bsVal}回` : 'なし';
        let cladeHtml = extractCladeLogs(rootNode) || '-';
        let cladeCsv = extractCladeLogsCSV(rootNode) || '-';
        
        analysisLogs.push({ id: runId, algo: algo, bs: bsStr, clades: cladeCsv });
        
        let tbody = document.getElementById('logTableBody');
        if (runId === 1) tbody.innerHTML = ''; 

        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="white-space: nowrap;">${runId}</td>
            <td style="white-space: nowrap;">${algo}</td>
            <td style="white-space: nowrap;">${bsStr}</td>
            <td>${cladeHtml}</td>
        `;
        tbody.appendChild(tr);
        tbody.parentElement.parentElement.scrollTop = tbody.parentElement.parentElement.scrollHeight;
        
        document.getElementById('btnDownloadLog').disabled = false;
    }

    function downloadLogCSV() {
        if (analysisLogs.length === 0) return;
        let csv = "実行回,手法,ブートストラップ,分岐グループと支持率\n";
        analysisLogs.forEach(log => {
            let cladesEscaped = `"${log.clades.replace(/"/g, '""')}"`;
            csv += `${log.id},${log.algo},${log.bs},${cladesEscaped}\n`;
        });
        const a = document.createElement('a'); 
        a.href = URL.createObjectURL(new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' }));
        let lastLog = analysisLogs[analysisLogs.length - 1];
        let bsPart = lastLog.bs === 'なし' ? '0' : parseInt(lastLog.bs);
        a.download = `${lastLog.algo}_Bootstrap_${bsPart}_Result.csv`; 
        a.click();
    }
    
    function generateNewick(node) {
        if (!node) return "";
        if (!node.left && !node.right) {
            return formatScientificName(node.name).replace(/\s+/g, '_') + (node.edge !== undefined ? ":" + node.edge.toFixed(5) : "");
        }
        let leftStr = generateNewick(node.left);
        let rightStr = generateNewick(node.right);
        
        let bsStr = (node.bootstrap !== undefined) ? node.bootstrap : "";
        let edgeStr = (node.edge !== undefined) ? ":" + node.edge.toFixed(5) : "";
        
        return "(" + leftStr + "," + rightStr + ")" + bsStr + edgeStr;
    }

    function copyNewick() {
        let outgroupName = document.getElementById('outgroupSelect').value;
        let root = clusters.find(c => c.active);
        if (outgroupName) root = getRoutedTree(root, outgroupName);
        
        if (!root) {
            showToast("コピーする系統樹がありません", "error");
            return;
        }
        
        let newick = generateNewick(root) + ";";
        
        navigator.clipboard.writeText(newick).then(() => {
            showToast("系統樹(Newick形式)をクリップボードにコピーしました", "success");
        }).catch(err => {
            showToast("コピーに失敗しました", "error");
        });
    }

    function copyNewickTree() {
        copyNewick();
    }
    window.copyNewickTree = copyNewickTree;

    // 解析ステータス連動（一括活性化）ロジック (ガイドライン第9項②準拠)
    function updatePhyloExportButtonsState(hasValidData) {
        const btn10 = document.getElementById('btnCopyForApp10');
        const btn11 = document.getElementById('btnCopyForApp11');
        const btnLegacy = document.getElementById('btnCopyNewick');
        if (btn10) btn10.disabled = !hasValidData;
        if (btn11) btn11.disabled = !hasValidData;
        if (btnLegacy) btnLegacy.disabled = !hasValidData;
    }
    window.updatePhyloExportButtonsState = updatePhyloExportButtonsState;

    // メタデータ刻印付きTSVコピー関数 (ガイドライン第1項・第7項④準拠)
    window.copyMutationDataForApp11 = function() {
        // 既存の距離マトリクスまたはサンプルデータの確認
        // ※アプリ⑧で管理されているサンプル名リストと距離行列変数を取得
        const sampleNames = window.currentSampleNames || (typeof originalNames !== 'undefined' && originalNames.length > 0 ? originalNames : (typeof currentSamples !== 'undefined' ? currentSamples.map(s => s.name || s.id) : null));
        const distMat = window.currentDistanceMatrix || (typeof initialDistanceMatrix !== 'undefined' && initialDistanceMatrix.length > 0 ? initialDistanceMatrix : (typeof distanceMatrix !== 'undefined' && distanceMatrix.length > 0 ? distanceMatrix : null));

        if (!sampleNames || sampleNames.length < 2 || !distMat) {
            showToast("系統樹を構築してからコピーしてください", "warning");
            return;
        }

        const timestamp = new Date().toISOString();
        let lines = [`# source: App_8_Phylogenetic_Tree_Builder | type: mutation | timestamp: ${timestamp}`];

        // 距離行列から各サンプルの2次元遺伝的特徴量（突然変異座標）を算出
        // bio_math_engine.js の nipalsPCA があれば適用、なければ代表距離2軸を使用
        let scores = [];
        if (typeof nipalsPCA === 'function' && distMat.length >= 2 && distMat[0].length >= 2) {
            try {
                const pcaRes = nipalsPCA(distMat, 2);
                scores = pcaRes.scores;
            } catch (e) {
                console.warn("PCA calculation fallback:", e);
            }
        }

        sampleNames.forEach((name, i) => {
            let x = 0, y = 0;
            if (scores.length > i && scores[i].length >= 2) {
                x = scores[i][0].toFixed(4);
                y = scores[i][1].toFixed(4);
            } else {
                // フォールバック: 他サンプルとの距離の集計値
                x = (distMat[i][0] || 0).toFixed(4);
                y = (distMat[i][1] !== undefined ? distMat[i][1] : (distMat[i][0] || 0)).toFixed(4);
            }
            lines.push(`${name}\t${x}\t${y}`);
        });

        const tsvText = lines.join('\n');
        navigator.clipboard.writeText(tsvText).then(() => {
            showToast("⑪用 突然変異データをクリップボードにコピーしました", "success");
        }).catch(err => {
            console.error("Clipboard copy failed:", err);
            showToast("データのコピーに失敗しました", "error");
        });
    };

    // ====== 最節約法 (MP法) ステップ・シミュレーション用ロジック ======
    let allInformativeSites = []; 
    let allVariableSites = []; 
    let userFoundSites = []; 
    let TARGET_FIND_COUNT = 0; 

    let activeMPInteractiveSiteIndex = 0; 
    let activePlacedMutations = [[], [], []];
    
    const SITE_COLORS = ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];

    function isInformativeSite(bases) {
        let counts = {};
        for (let b of bases) {
            if (b === '-' || b === 'N') continue; 
            counts[b] = (counts[b] || 0) + 1;
        }
        let sharedBasesCount = 0;
        for (let b in counts) {
            if (counts[b] >= 2) sharedBasesCount++;
        }
        return sharedBasesCount >= 2;
    }
    
    function calcFitchCost(c1, c2, c3, c4) {
        let sX = c1 === c2 ? [c1] : [c1, c2];
        let costX = c1 === c2 ? 0 : 1;
        
        let sY = c3 === c4 ? [c3] : [c3, c4];
        let costY = c3 === c4 ? 0 : 1;
        
        let intersect = sX.filter(val => sY.includes(val));
        if (intersect.length > 0) {
            return costX + costY;
        } else {
            return costX + costY + 1;
        }
    }

    function startMPSimulation() {
        const lines = document.getElementById('fastaInput').value.split('\n');
        let seqs = []; let name = "", seq = "";
        lines.forEach(l => {
            if(l.startsWith('>')) { if(name) seqs.push({name, seq}); name = l.substring(1).trim(); seq = ""; }
            else seq += l.toUpperCase().replace(/[^A-Z-]/g, '');
        });
        if(name) seqs.push({name, seq});

        if(seqs.length < 4) { 
            showToast("最大節約法 (MP法) のシミュレーションには4つ以上の塩基配列/アミノ酸配列が必要です。", "warning"); 
            return; 
        }
        let len = seqs[0].seq.length;
        if(!seqs.every(s => s.seq.length === len)) { 
            document.getElementById('errorSuggestModal').style.display = 'flex';
            return; 
        }

        let targetSeqs = seqs.slice(0, 4);
        mpNames = targetSeqs.map(s => formatScientificName(s.name)); 

        userFoundSites = [];
        allInformativeSites = [];
        allVariableSites = [];
        let localScores = [0, 0, 0];
        
        for (let k = 0; k < len; k++) {
            let a = targetSeqs[0].seq[k];
            let b = targetSeqs[1].seq[k];
            let c = targetSeqs[2].seq[k];
            let d = targetSeqs[3].seq[k];
            
            let isVar = !(a === b && b === c && c === d);
            let c1 = calcFitchCost(a, b, c, d);
            let c2 = calcFitchCost(a, c, b, d);
            let c3 = calcFitchCost(a, d, b, c);
            
            localScores[0] += c1; 
            localScores[1] += c2; 
            localScores[2] += c3;
            
            if (isVar) {
                let siteInfo = { pos: k + 1, idx: k, bases: [a, b, c, d], costs: [c1, c2, c3], optimalPlacements: [] };
                allVariableSites.push(siteInfo);
                if (isInformativeSite([a, b, c, d])) {
                    siteInfo.color = SITE_COLORS[allInformativeSites.length % SITE_COLORS.length];
                    
                    for (let t = 1; t <= 3; t++) {
                        let leaves = [];
                        if (t === 1) leaves = [a, b, c, d]; 
                        else if (t === 2) leaves = [a, c, b, d]; 
                        else leaves = [a, d, b, c]; 

                        let minScore = siteInfo.costs[t - 1];
                        let foundCombination = null;
                        for (let m = 0; m < 32; m++) {
                            let p = [(m & 1) !== 0, (m & 2) !== 0, (m & 4) !== 0, (m & 8) !== 0, (m & 16) !== 0];
                            if (p.filter(Boolean).length === minScore && checkLogicalFeasibility(leaves, p)) {
                                foundCombination = p;
                                break;
                            }
                        }
                        siteInfo.optimalPlacements.push(foundCombination || [false, false, false, false, false]);
                    }
                    allInformativeSites.push(siteInfo);
                }
            }
        }

        mpScores = localScores;
        mpMinScore = Math.min(...localScores);

        if (allVariableSites.length === 0) {
            showToast("解析対象の最初の4種に突然変異が全く見つかりません。", "warning");
            return;
        }

        if (allInformativeSites.length === 0) {
            allInformativeSites = allVariableSites;
        }
        
        TARGET_FIND_COUNT = allInformativeSites.length;

        let tableHtml = '<table style="table-layout: fixed; width: max-content; min-width: 100%; border-collapse: separate; border-spacing: 0;">';
        tableHtml += '<tr><th style="background:#eaeded; color:var(--text-main); position: sticky; left:0; z-index:10; border-right:2px solid var(--border-color); border-bottom:1px solid var(--border-color); width: 80px; min-width: 80px;">座位</th>';
        for (let k = 0; k < len; k++) {
            tableHtml += `<th class="align-col-header" onclick="clickAlignmentCol(${k})" data-tooltip="座位 ${k + 1} を選択" style="width: 36px; min-width: 36px; max-width: 36px;">${k + 1}</th>`;
        }
        tableHtml += '</tr>';
        
        for (let i = 0; i < 4; i++) {
            tableHtml += `<tr><th style="background:#eaeded; font-size:11px; text-align:left; position: sticky; left:0; z-index:10; border-right:2px solid var(--border-color); border-bottom:1px solid var(--border-color);" class="scientific-name">${mpNames[i]}</th>`;
            for (let k = 0; k < len; k++) {
                let char = targetSeqs[i].seq[k];
                let isConserved = targetSeqs.every(s => s.seq[k] === char && char !== '-');
                let cellClass = isConserved ? "align-cell conserved-cell" : "align-cell";
                tableHtml += `<td id="align_cell_${i}_${k}" class="${cellClass}" style="border-bottom:1px solid var(--border-color); border-right:1px solid var(--border-color); width: 36px; min-width: 36px; max-width: 36px;" onclick="clickAlignmentCol(${k})">${char}</td>`;
            }
            tableHtml += '</tr>';
        }
        tableHtml += '</table>';
        
        document.getElementById('mpAlignmentContainer').innerHTML = tableHtml;
        
        let countEl = document.getElementById('mpFoundCount');
        if (countEl) countEl.innerText = `0`;
        let targetEl = document.getElementById('mpTargetCount');
        if (targetEl) targetEl.innerText = TARGET_FIND_COUNT;
        
        const btn2 = document.getElementById('btnProceedToStep2');
        if (btn2) {
            btn2.disabled = true;
            btn2.style.background = '#bdc3c7';
            btn2.style.borderColor = '#bdc3c7';
            btn2.style.cursor = 'not-allowed';
            btn2.classList.remove('pulse-anim');
        }

        isMasked = false;
        const btnMask = document.getElementById('btnMaskConserved');
        if (btnMask) {
            btnMask.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5V15h8v-2.5A6 6 0 0 0 12 2z"/></svg> マスク';
            btnMask.style.background = '#fdfefe';
            btnMask.style.color = 'var(--text-main)';
            btnMask.style.border = '1px solid var(--border-color)';
        }

        document.getElementById('mpModal').style.display = 'flex';
        document.getElementById('mpStep1').style.display = 'block';
        document.getElementById('mpStep2').style.display = 'none';
        document.getElementById('mpStep3').style.display = 'none';
    }

    function toggleMaskConservedSites() {
        isMasked = !isMasked;
        const btn = document.getElementById('btnMaskConserved');
        const conservedCells = document.querySelectorAll('.conserved-cell');
        
        if (isMasked) {
            conservedCells.forEach(c => c.classList.add('align-cell-conserved'));
            btn.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5V15h8v-2.5A6 6 0 0 0 12 2z"/></svg> マスク解除';
            btn.style.background = '#eaf2f8';
            btn.style.color = '#2980b9';
            btn.style.border = '1px solid #3498db';
            showToast("ヒント：突然変異のない保存領域を薄くしました。");
        } else {
            conservedCells.forEach(c => c.classList.remove('align-cell-conserved'));
            btn.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5V15h8v-2.5A6 6 0 0 0 12 2z"/></svg> マスク';
            btn.style.background = '#fdfefe';
            btn.style.color = 'var(--text-main)';
            btn.style.border = '1px solid var(--border-color)';
            showToast("マスクを解除しました。");
        }
    }

    function clickAlignmentCol(k) {
        let cells = [];
        for (let i = 0; i < 4; i++) {
            let cell = document.getElementById(`align_cell_${i}_${k}`);
            if(cell) cells.push(cell);
        }

        let isInformative = allInformativeSites.some(site => site.idx === k);
        let isJustVariable = allVariableSites.some(site => site.idx === k);

        if (isInformative) {
            if (userFoundSites.includes(k)) {
                showToast(`座位 ${k + 1} はすでに発見しています。`);
                return;
            }
            userFoundSites.push(k);
            cells.forEach(c => {
                c.classList.remove('align-cell-wrong');
                c.classList.add('align-cell-found');
            });
            
            let found = userFoundSites.length;
            document.getElementById('mpFoundCount').innerText = found;

            if (found === TARGET_FIND_COUNT) {
                showToast(`コンプリート！情報をもつすべての座位（${TARGET_FIND_COUNT}箇所）を発見しました！`);
            } else {
                showToast(`正解！座位 ${k + 1} は系統推定に役立つ『情報をもつ座位』です。`);
            }

            let requiredCount = TARGET_FIND_COUNT >= 3 ? 3 : TARGET_FIND_COUNT;

            if (found >= requiredCount) {
                const btn2 = document.getElementById('btnProceedToStep2');
                if(btn2) {
                    btn2.disabled = false;
                    btn2.style.background = '#3498db';
                    btn2.style.borderColor = '#2980b9';
                    btn2.style.cursor = 'pointer';
                    btn2.classList.add('pulse-anim');
                }
            }
        } else if (isJustVariable) {
            cells.forEach(c => {
                c.classList.add('align-cell-wrong');
                setTimeout(() => c.classList.remove('align-cell-wrong'), 1000);
            });
            showToast(`惜しい！座位 ${k + 1} は1つの分類群だけが異なる突然変異なので、系統の枝分かれを特定できません。`, "warning");
        } else {
            cells.forEach(c => {
                c.classList.add('align-cell-wrong');
                setTimeout(() => c.classList.remove('align-cell-wrong'), 1000);
            });
            showToast(`残念！座位 ${k + 1} は全員が同じ塩基で、突然変異がありません。`, "error");
        }
    }

    function proceedToMPStep2() {
        let interactiveSites = allInformativeSites.filter(s => userFoundSites.includes(s.idx));
        if (interactiveSites.length === 0) interactiveSites = allInformativeSites.slice(0, 3); 

        const selector = document.getElementById('mpSiteSelector');
        selector.innerHTML = '';
        interactiveSites.forEach((s, idx) => {
            selector.innerHTML += `<option value="${idx}">部位 (座位 ${s.pos})</option>`;
        });

        allInformativeSites = interactiveSites;
        activeMPInteractiveSiteIndex = 0;
        initMPInteractiveSite(0);

        document.getElementById('mpStep1').style.display = 'none';
        document.getElementById('mpStep2').style.display = 'block';
    }

    function initMPInteractiveSite(index) {
        activeMPInteractiveSiteIndex = index;
        let site = allInformativeSites[index];
        
        document.getElementById('mpSelectedSiteNum').innerText = site.pos;
        document.getElementById('mpSelectedSiteBases').innerHTML = `
            現在の塩基: 
            <span class="scientific-name">${mpNames[0]}</span>: <b>${site.bases[0]}</b>, 
            <span class="scientific-name">${mpNames[1]}</span>: <b>${site.bases[1]}</b>, 
            <span class="scientific-name">${mpNames[2]}</span>: <b>${site.bases[2]}</b>, 
            <span class="scientific-name">${mpNames[3]}</span>: <b>${site.bases[3]}</b>
        `;

        activePlacedMutations = [
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false]
        ];

        document.getElementById('mpStep2Feedback').style.display = 'none';
        const btn3 = document.getElementById('btnProceedToStep3');
        if (btn3) {
            btn3.disabled = true;
            btn3.style.background = '#bdc3c7';
            btn3.style.borderColor = '#bdc3c7';
            btn3.style.cursor = 'not-allowed';
            btn3.classList.remove('pulse-anim');
        }

        renderInteractiveSVG(1, site); 
        renderInteractiveSVG(2, site); 
        renderInteractiveSVG(3, site); 

        updateMutationCounters();
    }

    function changeMPInteractiveSite() {
        const idx = parseInt(document.getElementById('mpSiteSelector').value);
        initMPInteractiveSite(idx);
    }

    function toggleMutation(treeType, branchIdx) {
        activePlacedMutations[treeType - 1][branchIdx] = !activePlacedMutations[treeType - 1][branchIdx];
        
        const line = document.getElementById(`line_${treeType}_${branchIdx}`);
        const starGroup = document.getElementById(`star_${treeType}_${branchIdx}`); 

        if (activePlacedMutations[treeType - 1][branchIdx]) {
            line.classList.add('branch-mutated');
            starGroup.setAttribute('opacity', '1');
        } else {
            line.classList.remove('branch-mutated');
            starGroup.setAttribute('opacity', '0');
        }

        updateMutationCounters();
    }

    function updateMutationCounters() {
        for (let t = 1; t <= 3; t++) {
            let count = activePlacedMutations[t - 1].filter(Boolean).length;
            document.getElementById(`mutCount${t}`).innerText = count;
            
            let textEl = document.getElementById(`mutPassIcon${t}`);
            textEl.innerText = "未検証";
            textEl.style.color = "#7f8c8d";
            document.getElementById(`mpInteractiveCard${t}`).style.borderColor = "var(--border-color)";
            document.getElementById(`mpInteractiveCard${t}`).style.boxShadow = "none";
        }
    }

    function renderInteractiveSVG(treeType, site) {
        const svg = document.getElementById(`mpSvg${treeType}`);
        svg.innerHTML = '';

        // 座標を全体的に左へシフトし、右端の見切れを防止
        const root = {x: 110, y: 120};
        const n1 = {x: 140, y: 90};
        const n2 = {x: 170, y: 60};
        
        let points = [];
        if (treeType === 1) { 
            points = [
                {x: 20, y: 30, b: site.bases[0], label: mpNames[0]}, 
                {x: 80, y: 30, b: site.bases[1], label: mpNames[1]}, 
                {x: 140, y: 30, b: site.bases[2], label: mpNames[2]}, 
                {x: 200, y: 30, b: site.bases[3], label: mpNames[3]} 
            ];
        } else if (treeType === 2) { 
            points = [
                {x: 20, y: 30, b: site.bases[0], label: mpNames[0]}, 
                {x: 80, y: 30, b: site.bases[2], label: mpNames[2]}, 
                {x: 140, y: 30, b: site.bases[1], label: mpNames[1]}, 
                {x: 200, y: 30, b: site.bases[3], label: mpNames[3]} 
            ];
        } else { 
            points = [
                {x: 20, y: 30, b: site.bases[0], label: mpNames[0]}, 
                {x: 80, y: 30, b: site.bases[3], label: mpNames[3]}, 
                {x: 140, y: 30, b: site.bases[1], label: mpNames[1]}, 
                {x: 200, y: 30, b: site.bases[2], label: mpNames[2]} 
            ];
        }

        let baseLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        baseLine.setAttribute("x1", root.x); baseLine.setAttribute("y1", root.y);
        baseLine.setAttribute("x2", points[0].x); baseLine.setAttribute("y2", points[0].y);
        baseLine.setAttribute("stroke", "#bdc3c7"); baseLine.setAttribute("stroke-width", "4");
        svg.appendChild(baseLine);

        const branches = [
            {id: 0, x1: root.x, y1: root.y, x2: n1.x, y2: n1.y}, 
            {id: 1, x1: n1.x, y1: n1.y, x2: points[1].x, y2: points[1].y}, 
            {id: 2, x1: n2.x, y1: n2.y, x2: points[2].x, y2: points[2].y}, 
            {id: 3, x1: n2.x, y1: n2.y, x2: points[3].x, y2: points[3].y}, 
            {id: 4, x1: n1.x, y1: n1.y, x2: n2.x, y2: n2.y} 
        ];

        branches.forEach(b => {
            let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("id", `line_${treeType}_${b.id}`);
            line.setAttribute("x1", b.x1);
            line.setAttribute("y1", b.y1);
            line.setAttribute("x2", b.x2);
            line.setAttribute("y2", b.y2);
            line.setAttribute("stroke", "#27ae60");
            line.setAttribute("stroke-width", "4");
            line.setAttribute("class", "branch-clickable");
            line.onclick = () => toggleMutation(treeType, b.id);
            svg.appendChild(line);

            const mx = (b.x1 + b.x2) / 2;
            const my = (b.y1 + b.y2) / 2;
            
            let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.setAttribute("id", `star_${treeType}_${b.id}`);
            g.setAttribute("opacity", "0");
            g.style.pointerEvents = 'none'; 

            let barLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            barLine.setAttribute("x1", mx - 10);
            barLine.setAttribute("y1", my);
            barLine.setAttribute("x2", mx + 10);
            barLine.setAttribute("y2", my);
            barLine.setAttribute("stroke", site.color || '#e74c3c');
            barLine.setAttribute("stroke-width", "4");
            
            let numText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            numText.setAttribute("x", mx + 14);
            numText.setAttribute("y", my + 4);
            numText.setAttribute("font-size", "12");
            numText.setAttribute("font-weight", "bold");
            numText.setAttribute("fill", "#2c3e50");
            numText.textContent = site.pos;
            
            g.appendChild(barLine);
            g.appendChild(numText);
            svg.appendChild(g);
        });

        points.forEach((p) => {
            let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", p.x);
            circle.setAttribute("cy", p.y);
            circle.setAttribute("r", "12");
            circle.setAttribute("fill", "#3498db");
            svg.appendChild(circle);

            let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", p.x);
            text.setAttribute("y", p.y + 4);
            text.setAttribute("font-size", "11");
            text.setAttribute("fill", "#fff");
            text.setAttribute("font-weight", "bold");
            text.setAttribute("text-anchor", "middle");
            text.textContent = p.b;
            svg.appendChild(text);

            let label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", p.x);
            label.setAttribute("y", p.y - 18);
            label.setAttribute("font-size", "10");
            label.setAttribute("fill", "#7f8c8d");
            label.setAttribute("text-anchor", "middle");
            label.setAttribute("class", "scientific-name");
            label.textContent = p.label;
            svg.appendChild(label);
        });
    }

    function verifyPlacedMutations() {
        let site = allInformativeSites[activeMPInteractiveSiteIndex];
        let allPassed = true;
        let incorrectTrees = [];

        for (let t = 1; t <= 3; t++) {
            let expectedMin = site.costs[t - 1];
            let placed = activePlacedMutations[t - 1];
            let currentCost = placed.filter(Boolean).length;
            
            let leaves = [];
            if (t === 1) leaves = [site.bases[0], site.bases[1], site.bases[2], site.bases[3]]; 
            else if (t === 2) leaves = [site.bases[0], site.bases[2], site.bases[1], site.bases[3]]; 
            else leaves = [site.bases[0], site.bases[3], site.bases[1], site.bases[2]]; 

            let isLogical = checkLogicalFeasibility(leaves, placed);

            let card = document.getElementById(`mpInteractiveCard${t}`);
            let icon = document.getElementById(`mutPassIcon${t}`);

            if (isLogical && currentCost === expectedMin) {
                card.style.borderColor = "#2ecc71";
                card.style.boxShadow = "0 0 0 2px #2ecc71";
                icon.innerText = "検証クリア！";
                icon.style.color = "#2ecc71";
            } else {
                allPassed = false;
                incorrectTrees.push(t === 1 ? 'I' : t === 2 ? 'II' : 'III');
                card.style.borderColor = "#e74c3c";
                card.style.boxShadow = "0 0 0 2px #e74c3c";
                
                if (currentCost < expectedMin) {
                    icon.innerHTML = `突然変異数が足りません (最小: ${expectedMin}回)`;
                } else if (currentCost > expectedMin) {
                    icon.innerHTML = `突然変異が多すぎます (最小: ${expectedMin}回)`;
                } else {
                    icon.innerHTML = "塩基の不整合 (説明不能)";
                }
                icon.style.color = "#e74c3c";
            }
        }

        const feedback = document.getElementById('mpStep2Feedback');
        feedback.style.display = "block";

        if (allPassed) {
            feedback.style.backgroundColor = '#e8f8f5';
            feedback.style.border = '1px solid #27ae60';
            feedback.style.borderRadius = '4px';
            feedback.innerHTML = `
                <div class="assist-item">
                    <div class="assist-title" style="color:#27ae60; font-weight:bold; margin-bottom:5px;">完璧です！すべての系統樹で最小の突然変異を正しく配置できました！</div>
                    <div class="assist-reason" style="color:var(--text-main); margin-bottom:8px;">座位によっては「突然変異数がどの樹形でも同じ」場合と、「特定の系統樹だけで突然変異が少なくて済む（合理的）」場合があります。</div>
                    <div class="assist-fix" style="border:1px solid #2ecc71; background:#fff; padding:10px; border-radius:4px; color:#117864; font-weight:bold;">
                        最小の突然変異数で説明できる系統樹を探索する最大節約法 (MP法) の本質が、これで実感できましたね。<br>
                        準備が整いました。全座位を集計した塩基配列全体のステップに進みましょう！
                    </div>
                </div>
            `;
            const btn3 = document.getElementById('btnProceedToStep3');
            if (btn3) {
                btn3.disabled = false;
                btn3.style.background = '#3498db';
                btn3.style.borderColor = '#2980b9';
                btn3.style.cursor = 'pointer';
                btn3.classList.add('pulse-anim');
            }
        } else {
            feedback.style.backgroundColor = '#fadbd8';
            feedback.style.border = '1px solid #e74c3c';
            feedback.style.borderRadius = '4px';
            feedback.innerHTML = `
                <div class="assist-item">
                    <div class="assist-title" style="color:#c0392b; font-weight:bold; margin-bottom:5px;">突然変異の配置が不正確です (対象: 系統樹 ${incorrectTrees.join(', ')})</div>
                    <div class="assist-reason" style="color:#7f8c8d; margin-bottom:8px;">1回の突然変異では説明できない配置になっているか、無駄な置換が多く置かれています。</div>
                    <div class="assist-fix" style="border:1px solid #e74c3c; background:#fff; padding:10px; border-radius:4px; color:var(--primary); font-weight:bold;">
                        最小回数を満たすように、枝をクリックして配置をやり直してください。<br>
                        （例：枝の先で塩基が [C] と [A] にバラバラに配置されている樹形では、1回の置換で全員の塩基を矛盾なく説明することはできず、独立した2回の置換が必要です）
                    </div>
                </div>
            `;
        }
    }

    function checkLogicalFeasibility(leaves, placed) {
        const bases = ['A', 'T', 'G', 'C', '-', 'N'];
        for (let bN1 of bases) {
            for (let bN2 of bases) {
                let valid = true;
                if ((leaves[0] !== bN1) !== placed[0]) valid = false; 
                if ((leaves[1] !== bN1) !== placed[1]) valid = false; 
                if ((leaves[2] !== bN2) !== placed[2]) valid = false; 
                if ((leaves[3] !== bN2) !== placed[3]) valid = false; 
                if ((bN1 !== bN2) !== placed[4]) valid = false; 
                if (valid) return true; 
            }
        }
        return false;
    }

    function proceedToMPStep3() {
        step3Order = [1, 2, 3].sort(() => 0.5 - Math.random());
        
        let html = '';
        step3Order.forEach(i => {
            html += `
                <div class="mp-tree-card" onclick="selectMPTree(${i})" style="flex: 1 1 30%; min-width: 220px; max-width: 32%; border: 2px solid var(--border-color); border-radius: 6px; padding: 10px; cursor: pointer; text-align: center; background: #fff; transition: 0.2s;" data-tooltip="この系統樹を最も最節約的であると選択します">
                    <h4 style="margin: 0 0 10px 0; color: var(--text-main); font-size: 13px;">系統樹 ${i === 1 ? 'I' : i === 2 ? 'II' : i === 3 ? 'III' : ''}</h4>
                    <div style="width: 100%; display: flex; justify-content: center;">
                        <canvas id="mpCanvas${i}" width="220" height="130" style="max-width: 100%; height: auto;"></canvas>
                    </div>
                    <p style="margin: 10px 0 0 0; font-size: 12px; font-weight: bold; color: var(--secondary);">総突然変異数: <span style="font-size: 16px; color: #e67e22;">${mpScores[i-1]}</span> 回</p>
                </div>`;
        });
        
        document.getElementById('mpResults').innerHTML = html;
        document.getElementById('mpFeedback').style.display = 'none';
        
        document.getElementById('mpStep2').style.display = 'none';
        document.getElementById('mpStep3').style.display = 'block';
        
        setTimeout(() => {
            drawMPTreeCanvas(`mpCanvas1`, 1);
            drawMPTreeCanvas(`mpCanvas2`, 2);
            drawMPTreeCanvas(`mpCanvas3`, 3);
        }, 50);
    }
    
    function drawMPTreeCanvas(canvasId, treeType) {
        const canvas = document.querySelector(`canvas[id="${canvasId}"]`);
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        
        // 座標を左へシフトし、見切れを防止
        const root = {x: 95, y: 110};
        const n1 = {x: 125, y: 80};
        const n2 = {x: 155, y: 50};
        
        let points = [];
        if (treeType === 1) { 
            points = [ {x: 25, y: 20, label: mpNames[0]}, {x: 75, y: 20, label: mpNames[1]}, {x: 125, y: 20, label: mpNames[2]}, {x: 185, y: 20, label: mpNames[3]} ];
        } else if (treeType === 2) { 
            points = [ {x: 25, y: 20, label: mpNames[0]}, {x: 75, y: 20, label: mpNames[2]}, {x: 125, y: 20, label: mpNames[1]}, {x: 185, y: 20, label: mpNames[3]} ];
        } else {
            points = [ {x: 25, y: 20, label: mpNames[0]}, {x: 75, y: 20, label: mpNames[3]}, {x: 125, y: 20, label: mpNames[1]}, {x: 185, y: 20, label: mpNames[2]} ];
        }

        ctx.beginPath();
        ctx.strokeStyle = '#bdc3c7';
        ctx.moveTo(root.x, root.y); ctx.lineTo(points[0].x, points[0].y); 
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = '#27ae60';
        ctx.moveTo(root.x, root.y); ctx.lineTo(n1.x, n1.y); 
        ctx.moveTo(n1.x, n1.y); ctx.lineTo(points[1].x, points[1].y); 
        ctx.moveTo(n1.x, n1.y); ctx.lineTo(n2.x, n2.y); 
        ctx.moveTo(n2.x, n2.y); ctx.lineTo(points[2].x, points[2].y); 
        ctx.moveTo(n2.x, n2.y); ctx.lineTo(points[3].x, points[3].y); 
        ctx.stroke();
        
        ctx.fillStyle = '#2c3e50'; 
        ctx.font = 'italic bold 10px "Times New Roman", serif'; 
        ctx.textBaseline = 'bottom';
        ctx.textAlign = 'center';
        
        points.forEach(p => {
            ctx.fillText(p.label, p.x, p.y - 5);
        });

        let foundSites = allInformativeSites.filter(site => userFoundSites.includes(site.idx));
        let displaySites = foundSites.slice(0, 5); 
        let branchMutations = [[], [], [], [], []];
        
        displaySites.forEach(site => {
            if (site.optimalPlacements && site.optimalPlacements[treeType - 1]) {
                site.optimalPlacements[treeType - 1].forEach((isPlaced, bIdx) => {
                    if (isPlaced) branchMutations[bIdx].push(site);
                });
            }
        });

        const branchesWithId = [
            {id: 0, x1: root.x, y1: root.y, x2: n1.x, y2: n1.y}, 
            {id: 1, x1: n1.x, y1: n1.y, x2: points[1].x, y2: points[1].y}, 
            {id: 2, x1: n2.x, y1: n2.y, x2: points[2].x, y2: points[2].y}, 
            {id: 3, x1: n2.x, y1: n2.y, x2: points[3].x, y2: points[3].y}, 
            {id: 4, x1: n1.x, y1: n1.y, x2: n2.x, y2: n2.y} 
        ];

        branchesWithId.forEach(b => {
            let muts = branchMutations[b.id];
            for (let i = 0; i < muts.length; i++) {
                let t = (i + 1) / (muts.length + 1);
                let mx = b.x1 + t * (b.x2 - b.x1);
                let my = b.y1 + t * (b.y2 - b.y1);
                
                ctx.strokeStyle = muts[i].color || '#e74c3c';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(mx - 6, my);
                ctx.lineTo(mx + 6, my);
                ctx.stroke();
                
                ctx.fillStyle = '#2c3e50';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(muts[i].pos, mx + 8, my);
            }
        });
    }

    function selectMPTree(index) {
        const score = mpScores[index - 1];
        const isCorrect = (score === mpMinScore);
        const feedback = document.getElementById('mpFeedback');
        feedback.style.display = 'block';
        
        const cards = document.querySelectorAll('.mp-tree-card');
        
        step3Order.forEach((treeNum, cardDomIdx) => {
            let c = cards[cardDomIdx];
            if (treeNum === index) {
                c.style.borderColor = isCorrect ? '#27ae60' : '#e74c3c';
                c.style.boxShadow = isCorrect ? '0 0 0 2px #27ae60' : '0 0 0 2px #e74c3c';
                c.style.backgroundColor = isCorrect ? '#e8f8f5' : '#fadbd8';
            } else {
                c.style.borderColor = 'var(--border-color)';
                c.style.boxShadow = 'none';
                c.style.backgroundColor = '#fff';
            }
        });

        if (isCorrect) {
            feedback.style.backgroundColor = '#e8f8f5';
            feedback.style.border = '1px solid #27ae60';
            feedback.style.borderRadius = '4px';
            feedback.innerHTML = `
                <div class="assist-item">
                    <div class="assist-title" style="color: #27ae60; font-weight:bold; margin-bottom:5px;">大正解！最も突然変異数が少ない（最節約的な）樹形を選びました。</div>
                    <div class="assist-reason" style="color: var(--text-main); margin-bottom:8px;">塩基配列全体における突然変異の合計値が最も小さくなる「系統樹 ${index === 1 ? 'I' : index === 2 ? 'II' : 'III'}」が、最も無駄のない進化モデルとして学術的に支持されます。</div>
                    <div class="assist-fix" style="border: 1px solid #27ae60; background: #fff; padding:10px; border-radius:4px; color: #1e8449; font-weight:bold;">
                        実際の分子系統解析では、何万〜何億サイトにも及ぶ遺伝情報をコンピュータで走査します。<br>
                        しかし裏側で行われているのは、今回のように「情報をもつ座位ごとに最小の突然変異数をカウントし、その和が最も少なくなるモデルを選択する」という、あなたが体験した地道な最大節約法 (MP法) のアルゴリズムそのものです！
                    </div>
                </div>
            `;
        } else {
            feedback.style.backgroundColor = '#fadbd8';
            feedback.style.border = '1px solid #e74c3c';
            feedback.style.borderRadius = '4px';
            feedback.innerHTML = `
                <div class="assist-item">
                    <div class="assist-title" style="color:#c0392b; font-weight:bold; margin-bottom:5px;">それは最節約的な樹形ではありません</div>
                    <div class="assist-reason" style="color:#7f8c8d; margin-bottom:8px;">選択した系統樹の総突然変異数は ${score} 回ですが、もっと突然変異数が少なくなる樹形が存在します。</div>
                    <div class="assist-fix" style="border:1px solid #e74c3c; background:#fff; padding:10px; border-radius:4px; color:var(--primary); font-weight:bold;">各カードの下に表示されている「総突然変異数」をよく見て、<strong>一番値が小さいもの</strong>を選んでください。</div>
                </div>
            `;
        }
    }

    // ====== 真・ML法シミュレーション用ロジック (フェルゼンスタイン計算エンジン) ======
    
    function isTransitionOnly(b1, b2) {
        let set = new Set([b1, b2]);
        if (set.has('-') || set.has('N')) return false;
        return (set.has('A') && set.has('G') && set.size === 2) || (set.has('C') && set.has('T') && set.size === 2);
    }
    
    function getTransitionProb(model, b1, b2, t) {
        if (b1 === '-' || b2 === '-' || b1 === 'N' || b2 === 'N') return 1.0; 

        let isSame = (b1 === b2);
        let isTrans = isTransitionOnly(b1, b2);

        if (model === 'JC69') {
            let pSame = 0.25 + 0.75 * Math.exp(- (4/3) * t);
            let pDiff = 0.25 - 0.25 * Math.exp(- (4/3) * t);
            return isSame ? pSame : pDiff;
        } else if (model === 'K80') {
            let e1 = Math.exp(-t);
            let e2 = Math.exp(-1.5 * t);
            let pSame = 0.25 + 0.25 * e1 + 0.5 * e2;
            let pTs   = 0.25 + 0.25 * e1 - 0.5 * e2;
            let pTv   = 0.25 - 0.25 * e1;
            
            if (isSame) return pSame;
            if (isTrans) return pTs;
            return pTv;
        }
        return 0.25;
    }

    function calculateSiteLikelihood(model, l1, l2, l3, l4, t) {
        const bases = ['A', 'T', 'G', 'C'];
        let likelihood = 0;
        
        for (let n1 of bases) {
            for (let n2 of bases) {
                let p_n1 = 0.25; 
                let p_l1 = getTransitionProb(model, n1, l1, t);
                let p_l2 = getTransitionProb(model, n1, l2, t);
                let p_n1_n2 = getTransitionProb(model, n1, n2, t);
                let p_l3 = getTransitionProb(model, n2, l3, t);
                let p_l4 = getTransitionProb(model, n2, l4, t);
                
                likelihood += p_n1 * p_l1 * p_l2 * p_n1_n2 * p_l3 * p_l4;
            }
        }
        return likelihood;
    }

    function calculateOverallLogLikelihood(model, treeType, t) {
        let lnL = 0;
        let len = mlSeqs[0].seq.length;
        for (let k = 0; k < len; k++) {
            let bases = [mlSeqs[0].seq[k], mlSeqs[1].seq[k], mlSeqs[2].seq[k], mlSeqs[3].seq[k]];
            let l1, l2, l3, l4;
            if (treeType === 1) { l1=bases[0]; l2=bases[1]; l3=bases[2]; l4=bases[3]; }
            else if (treeType === 2) { l1=bases[0]; l2=bases[2]; l3=bases[1]; l4=bases[3]; }
            else { l1=bases[0]; l2=bases[3]; l3=bases[1]; l4=bases[2]; }
            
            let siteL = calculateSiteLikelihood(model, l1, l2, l3, l4, t);
            if (siteL > 0) {
                lnL += Math.log(siteL);
            }
        }
        return lnL;
    }

    function toggleMLMaskConservedSites() {
        isMLMasked = !isMLMasked;
        const btn = document.getElementById('btnMLMaskConserved');
        const conservedCells = document.querySelectorAll('#mlAlignmentContainer .conserved-cell');
        
        if (isMLMasked) {
            conservedCells.forEach(c => c.classList.add('align-cell-conserved'));
            btn.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5V15h8v-2.5A6 6 0 0 0 12 2z"/></svg> マスク解除';
            btn.style.background = '#eaf2f8';
            btn.style.color = '#2980b9';
            btn.style.border = '1px solid #3498db';
            showToast("ヒント：突然変異のない保存領域を薄くしました。");
        } else {
            conservedCells.forEach(c => c.classList.remove('align-cell-conserved'));
            btn.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5V15h8v-2.5A6 6 0 0 0 12 2z"/></svg> マスク';
            btn.style.background = '#fdfefe';
            btn.style.color = 'var(--text-main)';
            btn.style.border = '1px solid var(--border-color)';
            showToast("マスクを解除しました。");
        }
    }

    function startMLSimulation() {
        const lines = document.getElementById('fastaInput').value.split('\n');
        let seqs = []; let name = "", seq = "";
        lines.forEach(l => {
            if(l.startsWith('>')) { if(name) seqs.push({name, seq}); name = l.substring(1).trim(); seq = ""; }
            else seq += l.toUpperCase().replace(/[^A-Z-]/g, '');
        });
        if(name) seqs.push({name, seq});

        if(seqs.length < 4) { 
            showToast("最尤法 (ML法) のシミュレーションには4つ以上の塩基配列/アミノ酸配列が必要です。", "warning"); 
            return; 
        }
        let len = seqs[0].seq.length;
        if(!seqs.every(s => s.seq.length === len)) { 
            document.getElementById('errorSuggestModal').style.display = 'flex';
            return; 
        }

        let targetSeqs = seqs.slice(0, 4);
        mlNames = targetSeqs.map(s => formatScientificName(s.name)); 
        mlSeqs = targetSeqs;
        
        mlVarSites = [];
        mlFoundTransitions = [];
        mlFoundTransversions = [];
        
        document.getElementById('mlFoundTsCount').innerText = '0';
        document.getElementById('mlFoundTvCount').innerText = '0';
        
        for (let k = 0; k < len; k++) {
            let bases = [targetSeqs[0].seq[k], targetSeqs[1].seq[k], targetSeqs[2].seq[k], targetSeqs[3].seq[k]];
            let uniqueBases = new Set(bases);
            uniqueBases.delete('-'); uniqueBases.delete('N');
            
            if (uniqueBases.size === 2 && isInformativeSite(bases)) {
                let arr = Array.from(uniqueBases);
                let isTrans = isTransitionOnly(arr[0], arr[1]);
                mlVarSites.push({
                    idx: k, pos: k + 1, bases: bases, isTransition: isTrans
                });
            }
        }
        
        if (mlVarSites.length === 0) {
            showToast("解析対象の最初の4種に、遷移・置換を判別できる明確な突然変異が見つかりません。", "warning");
            return;
        }

        let tableHtml = '<table style="table-layout: fixed; width: max-content; min-width: 100%; border-collapse: separate; border-spacing: 0;">';
        tableHtml += '<tr><th style="background:#eaeded; color:var(--text-main); position: sticky; left:0; z-index:10; border-right:2px solid var(--border-color); border-bottom:1px solid var(--border-color); width: 80px; min-width: 80px;">座位</th>';
        for (let k = 0; k < len; k++) {
            tableHtml += `<th class="align-col-header" onclick="mlClickAlignmentCol(${k})" data-tooltip="座位 ${k + 1} を選択" style="width: 36px; min-width: 36px; max-width: 36px;">${k + 1}</th>`;
        }
        tableHtml += '</tr>';
        
        for (let i = 0; i < 4; i++) {
            tableHtml += `<tr><th style="background:#eaeded; font-size:11px; text-align:left; position: sticky; left:0; z-index:10; border-right:2px solid var(--border-color); border-bottom:1px solid var(--border-color);" class="scientific-name">${mlNames[i]}</th>`;
            for (let k = 0; k < len; k++) {
                let char = targetSeqs[i].seq[k];
                let isConserved = targetSeqs.every(s => s.seq[k] === char && char !== '-');
                // 初期状態の表示
                let cellClass = isConserved ? "align-cell conserved-cell" : "align-cell";
                tableHtml += `<td id="ml_cell_${i}_${k}" class="${cellClass}" style="border-bottom:1px solid var(--border-color); border-right:1px solid var(--border-color); width: 36px; min-width: 36px; max-width: 36px;" onclick="mlClickAlignmentCol(${k})">${char}</td>`;
            }
            tableHtml += '</tr>';
        }
        tableHtml += '</table>';
        
        document.getElementById('mlAlignmentContainer').innerHTML = tableHtml;
        
        mlSelectedSiteInfo = null;
        document.getElementById('mlStep1QuestionPanel').style.display = 'none';
        
        const btn2 = document.getElementById('btnProceedToMLStep2');
        if(btn2) {
            btn2.disabled = true;
            btn2.style.background = '#bdc3c7';
            btn2.style.borderColor = '#bdc3c7';
            btn2.style.cursor = 'not-allowed';
            btn2.classList.remove('pulse-anim');
        }

        // ML法マスク状態のリセット
        isMLMasked = false;
        const btnMLMask = document.getElementById('btnMLMaskConserved');
        if (btnMLMask) {
            btnMLMask.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5V15h8v-2.5A6 6 0 0 0 12 2z"/></svg> マスク';
            btnMLMask.style.background = '#fdfefe';
            btnMLMask.style.color = 'var(--text-main)';
            btnMLMask.style.border = '1px solid var(--border-color)';
        }

        document.getElementById('mlStep1').style.display = 'block';
        document.getElementById('mlStep2').style.display = 'none';
        document.getElementById('mlStep3').style.display = 'none';
        document.getElementById('mlModal').style.display = 'flex';
    }
    
    function mlClickAlignmentCol(k) {
        let siteInfo = mlVarSites.find(s => s.idx === k);
        let cells = [];
        for(let i=0; i<4; i++) cells.push(document.getElementById(`ml_cell_${i}_${k}`));
        
        if (siteInfo) {
            document.querySelectorAll('[id^="ml_cell_"]').forEach(c => c.style.boxShadow = 'none');
            cells.forEach(c => c.style.boxShadow = 'inset 0 0 0 2px #3498db');
            
            mlSelectedSiteInfo = siteInfo;
            document.getElementById('mlCurrentSiteNum').innerText = (k + 1);
            document.getElementById('mlCurrentSiteBases').innerHTML = `
                <span class="scientific-name">${mlNames[0]}</span>: <b>${siteInfo.bases[0]}</b>, 
                <span class="scientific-name">${mlNames[1]}</span>: <b>${siteInfo.bases[1]}</b>, 
                <span class="scientific-name">${mlNames[2]}</span>: <b>${siteInfo.bases[2]}</b>, 
                <span class="scientific-name">${mlNames[3]}</span>: <b>${siteInfo.bases[3]}</b>
            `;
            document.getElementById('mlStep1QuestionPanel').style.display = 'block';
            document.getElementById('mlStep1Feedback').innerHTML = '';
            
            const btn2 = document.getElementById('btnProceedToMLStep2');
            btn2.disabled = true;
            btn2.style.background = '#bdc3c7';
            btn2.style.borderColor = '#bdc3c7';
            btn2.style.cursor = 'not-allowed';
            btn2.classList.remove('pulse-anim');
        } else {
            cells.forEach(c => {
                c.classList.add('align-cell-wrong');
                setTimeout(() => c.classList.remove('align-cell-wrong'), 1000);
            });
            showToast("その座位は遷移と置換の区別が難しいか、情報を持っていません。別の列を選んでください。", "warning");
        }
    }
    
    function mlCheckMutationType(userChoice) {
        if (!mlSelectedSiteInfo) return;
        
        let isTrans = mlSelectedSiteInfo.isTransition;
        let isCorrect = (userChoice === 'transition' && isTrans) || (userChoice === 'transversion' && !isTrans);
        let k = mlSelectedSiteInfo.idx;
        
        const feedback = document.getElementById('mlStep1Feedback');
        let cells = [];
        for(let i=0; i<4; i++) cells.push(document.getElementById(`ml_cell_${i}_${k}`));
        
        if (isCorrect) {
            cells.forEach(c => {
                c.classList.remove('align-cell-wrong');
                c.classList.add('align-cell-found');
                c.style.boxShadow = 'none';
            });

            if(isTrans) {
                if(!mlFoundTransitions.includes(k)) mlFoundTransitions.push(k);
                feedback.innerHTML = `<span style="color:var(--success);">大正解！</span>化学的性質が似た者同士（プリン同士 または ピリミジン同士）の変化なので、これは<strong>「遷移 (Transition)」</strong>です。<br><span style="color:#7f8c8d; font-weight:normal;">DNA構造に無理が生じないため、自然界ではこの突然変異が圧倒的に起こりやすいです。</span>`;
            } else {
                if(!mlFoundTransversions.includes(k)) mlFoundTransversions.push(k);
                feedback.innerHTML = `<span style="color:var(--success);">大正解！</span>プリン塩基とピリミジン塩基をまたぐ変化なので、これは<strong>「置換 (Transversion)」</strong>です。<br><span style="color:#7f8c8d; font-weight:normal;">※重要用語規格においてトランスバージョンは「置換（塩基置換）」と表記されます。</span>`;
            }
            
            document.getElementById('mlFoundTsCount').innerText = mlFoundTransitions.length;
            document.getElementById('mlFoundTvCount').innerText = mlFoundTransversions.length;
            
            const btn2 = document.getElementById('btnProceedToMLStep2');
            if (mlFoundTransitions.length >= 1 && mlFoundTransversions.length >= 1) {
                if(btn2) {
                    btn2.disabled = false;
                    btn2.style.background = '#3498db';
                    btn2.style.borderColor = '#2980b9';
                    btn2.style.cursor = 'pointer';
                    btn2.classList.add('pulse-anim');
                }
                showToast("遷移と置換をそれぞれ1つ以上発見しました！次へ進めます。");
            } else {
                if(btn2) {
                    btn2.disabled = true;
                    btn2.style.background = '#bdc3c7';
                    btn2.style.borderColor = '#bdc3c7';
                    btn2.style.cursor = 'not-allowed';
                    btn2.classList.remove('pulse-anim');
                }
                showToast("正解です！次へ進むには、遷移と置換の両方を見つける必要があります。");
            }
        } else {
            cells.forEach(c => {
                c.classList.add('align-cell-wrong');
                setTimeout(() => c.classList.remove('align-cell-wrong'), 1000);
            });
            feedback.innerHTML = `<span style="color:var(--danger);">不正解...</span> もう一度「遷移」と「置換」のルール（根拠パネル）を確認してみましょう。`;
        }
    }

    function proceedToMLStep2() {
        document.getElementById('mlStep1').style.display = 'none';
        document.getElementById('mlStep2').style.display = 'block';
        
        let html = '';
        for(let i=1; i<=3; i++) {
            html += `
                <div id="mlCard${i}" style="flex:1; min-width:250px; border:2px solid var(--border-color); border-radius:6px; padding:12px; text-align:center; background:#fafbfc; cursor:pointer; transition:0.2s;" onclick="selectMLTree(${i})" data-tooltip="この樹形を選択します">
                    <h4 style="margin:0 0 10px 0; font-size:13px; color:var(--text-main);">系統樹 ${i === 1 ? 'I' : i === 2 ? 'II' : 'III'}</h4>
                    <svg id="mlSimSvg${i}" width="250" height="150" style="background:#fff; border-radius:4px; max-width: 100%; border:1px solid #ecf0f1;"></svg>
                    <div style="margin-top: 10px; text-align: left;">
                        <div style="font-size: 11px; color: #7f8c8d; margin-bottom: 2px;">尤度 (相対値): <span id="mlSimScoreVal${i}" style="font-weight:bold; color:var(--text-main); font-size: 14px;">0</span></div>
                        <div style="width: 100%; height: 8px; background: #ecf0f1; border-radius: 4px; overflow: hidden;">
                            <div id="mlSimBar${i}" style="height: 100%; width: 0%; background: #3498db; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);"></div>
                        </div>
                    </div>
                </div>
            `;
        }
        document.getElementById('mlInteractiveTrees').innerHTML = html;
        
        setTimeout(() => {
            drawMLInteractiveTree(1, mlSelectedSiteInfo);
            drawMLInteractiveTree(2, mlSelectedSiteInfo);
            drawMLInteractiveTree(3, mlSelectedSiteInfo);
            document.getElementById('ml_jc69').checked = true;
            updateMLModel();
        }, 50);
        
        document.getElementById('mlStep2Feedback').style.display = 'none';
    }

    function drawMLInteractiveTree(treeType, site) {
        const svg = document.getElementById(`mlSimSvg${treeType}`);
        svg.innerHTML = '';
        
        // 座標を全体的に左へシフトし、右端の見切れを防止
        const root = {x: 110, y: 120};
        const n1 = {x: 140, y: 90};
        const n2 = {x: 170, y: 60};
        
        let pIdx = [];
        if(treeType === 1) pIdx = [0, 1, 2, 3];
        else if(treeType === 2) pIdx = [0, 2, 1, 3];
        else pIdx = [0, 3, 1, 2];
        
        const points = [
            {x: 20, y: 30, label: mlNames[pIdx[0]], b: site.bases[pIdx[0]]}, 
            {x: 80, y: 30, label: mlNames[pIdx[1]], b: site.bases[pIdx[1]]}, 
            {x: 140, y: 30, label: mlNames[pIdx[2]], b: site.bases[pIdx[2]]}, 
            {x: 200, y: 30, label: mlNames[pIdx[3]], b: site.bases[pIdx[3]]}
        ];

        const drawLine = (x1, y1, x2, y2, color) => {
            let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", x1); line.setAttribute("y1", y1);
            line.setAttribute("x2", x2); line.setAttribute("y2", y2);
            line.setAttribute("stroke", color || "#bdc3c7"); line.setAttribute("stroke-width", "3");
            svg.appendChild(line);
        };
        
        // 根元の枝
        drawLine(root.x, root.y, points[0].x, points[0].y);
        
        // 内部のクラード構造
        drawLine(root.x, root.y, n1.x, n1.y, "#27ae60");
        drawLine(n1.x, n1.y, points[1].x, points[1].y, "#27ae60");
        drawLine(n1.x, n1.y, n2.x, n2.y, "#27ae60");
        drawLine(n2.x, n2.y, points[2].x, points[2].y, "#27ae60");
        drawLine(n2.x, n2.y, points[3].x, points[3].y, "#27ae60");

        points.forEach(p => {
            let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", p.x);
            circle.setAttribute("cy", p.y);
            circle.setAttribute("r", "12");
            circle.setAttribute("fill", "#3498db");
            svg.appendChild(circle);

            let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", p.x);
            text.setAttribute("y", p.y + 4);
            text.setAttribute("font-size", "11");
            text.setAttribute("fill", "#fff");
            text.setAttribute("font-weight", "bold");
            text.setAttribute("text-anchor", "middle");
            text.textContent = p.b;
            svg.appendChild(text);

            let label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", p.x);
            label.setAttribute("y", p.y - 18);
            label.setAttribute("font-size", "10");
            label.setAttribute("fill", "#7f8c8d");
            label.setAttribute("text-anchor", "middle");
            label.setAttribute("class", "scientific-name");
            label.textContent = p.label;
            svg.appendChild(label);
        });
    }

    function updateMLModel() {
        const model = document.querySelector('input[name="ml_sim_model"]:checked').value;
        let bases = mlSelectedSiteInfo.bases;
        let t = 0.1; 
        
        let likelihoods = [];
        for (let i = 1; i <= 3; i++) {
            let l1, l2, l3, l4;
            if (i === 1) { l1=bases[0]; l2=bases[1]; l3=bases[2]; l4=bases[3]; }
            else if (i === 2) { l1=bases[0]; l2=bases[2]; l3=bases[1]; l4=bases[3]; }
            else { l1=bases[0]; l2=bases[3]; l3=bases[1]; l4=bases[2]; }
            
            likelihoods.push(calculateSiteLikelihood(model, l1, l2, l3, l4, t));
        }
        
        let maxL = Math.max(...likelihoods);
        let minL = Math.min(...likelihoods);
        
        mlSelectedTreeType = likelihoods.indexOf(maxL) + 1;
        
        for(let i=1; i<=3; i++) {
            let L = likelihoods[i-1];
            let score = 0;
            if (maxL > minL) {
                let maxLn = Math.log(maxL);
                let minLn = Math.log(minL);
                let currentLn = Math.log(L);
                score = 20 + 80 * ((currentLn - minLn) / (maxLn - minLn));
                if (isNaN(score)) score = 100;
            } else {
                score = 100;
            }
            
            let displayVal = L * 100000;
            
            document.getElementById(`mlSimScoreVal${i}`).innerText = displayVal.toFixed(2);
            let bar = document.getElementById(`mlSimBar${i}`);
            bar.style.width = score + '%';
            
            if (model === 'K80' && i === mlSelectedTreeType && mlSelectedSiteInfo.isTransition) {
                bar.style.background = '#e67e22'; 
            } else {
                bar.style.background = '#3498db';
            }
            
            let card = document.getElementById(`mlCard${i}`);
            card.style.borderColor = 'var(--border-color)';
            card.style.boxShadow = 'none';
        }
        document.getElementById('mlStep2Feedback').style.display = 'none';
        const btn3 = document.getElementById('btnProceedToMLStep3');
        if(btn3) {
            btn3.disabled = true;
            btn3.style.background = '#bdc3c7';
            btn3.style.borderColor = '#bdc3c7';
            btn3.style.cursor = 'not-allowed';
            btn3.classList.remove('pulse-anim');
        }
    }

    function selectMLTree(index) {
        const isMaxLikelihood = (index === mlSelectedTreeType);
        const model = document.querySelector('input[name="ml_sim_model"]:checked').value;
        const feedback = document.getElementById('mlStep2Feedback');
        
        // 【大正解条件】
        const isCorrect = isMaxLikelihood && model === 'K80';
        // 【部分正解条件】
        const isPartial = isMaxLikelihood && model === 'JC69';
        
        for(let i=1; i<=3; i++) {
            let card = document.getElementById(`mlCard${i}`);
            if (i === index) {
                if (isCorrect) {
                    card.style.borderColor = '#27ae60';
                    card.style.boxShadow = '0 0 0 2px #27ae60';
                } else if (isPartial) {
                    card.style.borderColor = '#f39c12';
                    card.style.boxShadow = '0 0 0 2px #f39c12';
                } else {
                    card.style.borderColor = '#e74c3c';
                    card.style.boxShadow = '0 0 0 2px #e74c3c';
                }
            } else {
                card.style.borderColor = 'var(--border-color)';
                card.style.boxShadow = 'none';
            }
        }
        
        feedback.style.display = 'block';
        
        const btn3 = document.getElementById('btnProceedToMLStep3');
        if (btn3) {
            btn3.disabled = true;
            btn3.style.background = '#bdc3c7';
            btn3.style.borderColor = '#bdc3c7';
            btn3.style.cursor = 'not-allowed';
            btn3.classList.remove('pulse-anim');
        }

        if (isCorrect) {
            feedback.style.backgroundColor = '#e8f8f5';
            feedback.style.border = '1px solid #27ae60';
            feedback.style.borderRadius = '4px';
            
            let exp = `K80モデルを用いたことで「遷移」の発生確率が高く評価され、他の樹形と比べて圧倒的に高い尤度スコアを叩き出しました。実際の研究でも、適切な進化モデルを選ぶことが真実の系統樹に辿り着くためのカギになります。`;

            feedback.innerHTML = `
                <div class="assist-item">
                    <div class="assist-title" style="color:#27ae60; font-weight:bold; margin-bottom:5px;">大正解！最も尤度（起こりやすさ）が高い真の樹形を選択しました。</div>
                    <div class="assist-reason" style="color:var(--text-main); margin-bottom:8px;">${exp}</div>
                </div>
            `;
            
            if(btn3) {
                btn3.disabled = false;
                btn3.style.background = '#3498db';
                btn3.style.borderColor = '#2980b9';
                btn3.style.cursor = 'pointer';
                btn3.classList.add('pulse-anim');
            }
        } else if (isPartial) {
            feedback.style.backgroundColor = '#fef9e7';
            feedback.style.border = '1px solid #f39c12';
            feedback.style.borderRadius = '4px';
            feedback.innerHTML = `
                <div class="assist-item">
                    <div class="assist-title" style="color:#d35400; font-weight:bold; margin-bottom:5px;">惜しい！尤度は最大ですが、モデルが不十分です。</div>
                    <div class="assist-reason" style="color:#7e5109; margin-bottom:8px;">
                        このモデル（JC69）の中では最大ですが、塩基の変わりやすさ（遷移と置換）を考慮した現実に即したモデル（K80）を使えば、もっと尤度が高い樹形が見つかるはずです。上のラジオボタンで「K80モデル」に切り替えてから再度選択してください。
                    </div>
                </div>
            `;
        } else {
            feedback.style.backgroundColor = '#fadbd8';
            feedback.style.border = '1px solid #e74c3c';
            feedback.style.borderRadius = '4px';
            feedback.innerHTML = `
                <div class="assist-item">
                    <div class="assist-title" style="color:#c0392b; font-weight:bold; margin-bottom:5px;">不正解です</div>
                    <div class="assist-reason" style="color:#7f8c8d;">その樹形の尤度スコアは最大ではありません。バーが一番伸びているものを選んでください。</div>
                </div>
            `;
        }
    }

    function proceedToMLStep3() {
        document.getElementById('mlStep2').style.display = 'none';
        document.getElementById('mlStep3').style.display = 'block';
        
        const targetSvg = document.getElementById('mlStep3Svg');
        const sourceSvg = document.getElementById(`mlSimSvg${mlSelectedTreeType}`);
        targetSvg.innerHTML = sourceSvg.innerHTML;
        
        const model = document.querySelector('input[name="ml_sim_model"]:checked').value;
        mlLnLData = [];
        mlMaxLnL = -Infinity;
        mlMinLnL = Infinity;
        mlOptimalBranch = 0.01;
        
        for (let t = 0.01; t <= 1.00; t += 0.01) {
            let lnL = calculateOverallLogLikelihood(model, mlSelectedTreeType, t);
            mlLnLData.push({ t: t, lnL: lnL });
            if (lnL > mlMaxLnL) { mlMaxLnL = lnL; mlOptimalBranch = t; }
            if (lnL < mlMinLnL) { mlMinLnL = lnL; }
        }
        
        const slider = document.getElementById('mlBranchSlider');
        slider.value = (mlOptimalBranch > 0.5) ? 0.1 : 0.9;
        
        const feedback = document.getElementById('mlStep3Feedback');
        feedback.innerHTML = '';
        feedback.style.backgroundColor = 'transparent';
        feedback.style.borderColor = 'transparent';
        
        updateMLBranchSlider();
    }
    
    function updateMLBranchSlider() {
        const branchLen = parseFloat(document.getElementById('mlBranchSlider').value);
        document.getElementById('mlBranchSliderVal').innerText = branchLen.toFixed(2);
        
        const model = document.querySelector('input[name="ml_sim_model"]:checked').value;
        let currentLnL = calculateOverallLogLikelihood(model, mlSelectedTreeType, branchLen);
        
        let score = 2; 
        if (mlMaxLnL > mlMinLnL) {
            score = 2 + 98 * ((currentLnL - mlMinLnL) / (mlMaxLnL - mlMinLnL));
        }
        
        const bar = document.getElementById('mlOverallLikelihoodBar');
        bar.style.width = score + '%';
        
        let isPeak = Math.abs(currentLnL - mlMaxLnL) < 0.001;
        
        if (isPeak) bar.style.background = '#27ae60';
        else if (score > 80) bar.style.background = '#f1c40f';
        else bar.style.background = '#3498db';

        const feedback = document.getElementById('mlStep3Feedback');
        if (isPeak) {
            feedback.style.backgroundColor = '#e8f8f5';
            feedback.style.border = '1px solid #27ae60';
            feedback.style.borderRadius = '4px';
            feedback.innerHTML = `
                <div class="assist-item">
                    <div class="assist-title" style="color:#27ae60; font-weight:bold; margin-bottom:5px;">最適化クリア！全体尤度が最大（山の頂上）になりました。</div>
                    <div class="assist-reason" style="color:var(--text-main); margin-bottom:8px;">
                        塩基配列全体の違い（距離）と、設定した枝の長さの辻褄が最も合うポイント（最適解）を発見しました！<br>
                        最大対数尤度 (ln L) = <strong>${currentLnL.toFixed(2)}</strong>
                    </div>
                    <div class="assist-fix" style="border:1px solid #2ecc71; background:#fff; padding:10px; border-radius:4px; color:#117864; font-weight:bold;">
                        実際の最尤法（ML法）のプログラムは、今回あなたが体験した「進化モデルに基づく本物の確率計算」と、「微分や山登り法を用いた枝の長さの最適化」を、全樹形パターンに対して数千〜数万回も繰り返すことで、最も尤もらしい1つの真実の系統樹を導き出しているのです。
                    </div>
                </div>
            `;
        } else {
            feedback.innerHTML = '';
            feedback.style.backgroundColor = 'transparent';
            feedback.style.border = '1px solid transparent';
        }
    }

    function getNJQMatrix() {
        const n = clusters.length;
        let q = Array(n).fill(0).map(() => Array(n).fill(0));
        let r = Array(n).fill(0); 

        let activeNodesCount = clusters.filter(c => c.active).length;

        for(let i=0; i<n; i++) {
            if(!clusters[i].active) continue;
            for(let j=0; j<n; j++) {
                if(!clusters[j].active) continue;
                r[i] += distanceMatrix[i][j];
            }
        }
        for(let i=0; i<n; i++) {
            if(!clusters[i].active) continue;
            for(let j=i+1; j<n; j++) {
                if(!clusters[j].active) continue;
                q[i][j] = q[j][i] = (activeNodesCount - 2) * distanceMatrix[i][j] - r[i] - r[j];
            }
        }
        return {q, r};
    }

    function findMin() {
        const algo = document.getElementById('algoSelect').value;
        let minVal = Infinity, minI = -1, minJ = -1;
        if(algo === "UPGMA") {
            for(let i=0; i<clusters.length; i++) {
                if(!clusters[i].active) continue;
                for(let j=i+1; j<clusters.length; j++) {
                    if(!clusters[j].active) continue;
                    if(distanceMatrix[i][j] < minVal) { minVal = distanceMatrix[i][j]; minI = i; minJ = j; }
                }
            }
        } else {
            const {q} = getNJQMatrix();
            for(let i=0; i<clusters.length; i++) {
                if(!clusters[i].active) continue;
                for(let j=i+1; j<clusters.length; j++) {
                    if(!clusters[j].active) continue;
                    if(q[i][j] < minVal) { minVal = q[i][j]; minI = i; minJ = j; }
                }
            }
        }
        return {i: minI, j: minJ, dist: distanceMatrix[minI][minJ]}; 
    }

    function renderMatrix() {
        const algo = document.getElementById('algoSelect').value;
        let displayMatrix = distanceMatrix;
        if(algo === "NJ") displayMatrix = getNJQMatrix().q;

        let html = "<table><tr><th></th>";
        for (let i = 0; i < clusters.length; i++) {
            let c = clusters[i];
            let headerCls = c.active ? 'scientific-name' : 'scientific-name matrix-inactive-header';
            let displayName = formatScientificName(originalNames[i]);
            html += `<th><span class="${headerCls}">${displayName}</span></th>`;
        }
        html += "</tr>";
        
        for(let i=0; i<clusters.length; i++) {
            let headerCls = clusters[i].active ? 'scientific-name' : 'scientific-name matrix-inactive-header';
            let displayName = formatScientificName(originalNames[i]);
            html += `<tr><th><span class="${headerCls}">${displayName}</span></th>`;
            for(let j=0; j<clusters.length; j++) {
                if(i === j) {
                    html += `<td class="matrix-diagonal">-</td>`;
                } else if(j < i) {
                    html += `<td class="matrix-diagonal"></td>`; 
                } else {
                    let val = displayMatrix[i][j].toFixed(1);
                    
                    if(!clusters[i].active || !clusters[j].active) {
                        html += `<td class="matrix-inactive">${val}</td>`;
                    } else {
                        let isSelected = selectedPair && ((i===selectedPair.i && j===selectedPair.j) || (i===selectedPair.j && j===selectedPair.i));
                        let cls = isSelected ? 'matrix-min' : 'matrix-clickable';
                        html += `<td id="matrix_cell_${i}_${j}" class="${cls}" onclick="checkUserSelection(${i}, ${j})">${val}</td>`;
                    }
                }
            }
            html += "</tr>";
        }
        html += "</table>";
        document.getElementById('matrixContainer').innerHTML = html;
    }

    function checkUserSelection(i, j) {
        if(!clusters[i].active || !clusters[j].active) return;
        
        let trueMin = findMin();
        const algo = document.getElementById('algoSelect').value;
        
        let isCorrect = false;
        if(algo === "UPGMA") {
            isCorrect = (distanceMatrix[i][j].toFixed(1) === distanceMatrix[trueMin.i][trueMin.j].toFixed(1));
        } else {
            let q = getNJQMatrix().q;
            isCorrect = (q[i][j].toFixed(1) === q[trueMin.i][trueMin.j].toFixed(1));
        }

        if(isCorrect) {
            selectedPair = {i: i, j: j, dist: distanceMatrix[i][j]};
            document.getElementById('statusLog').innerHTML = `[正解！] <i class="highlight-step scientific-name" style="color:#f1c40f;">${formatScientificName(clusters[i].name)}</i> と <i class="highlight-step scientific-name" style="color:#f1c40f;">${formatScientificName(clusters[j].name)}</i> が一番近いですね。<br>自動的に結合して行列を更新します。`;
            document.getElementById('btnNextStep').style.display = 'none';
            renderMatrix();
            showToast("正解です。結合を実行します。", "info");
            setTimeout(() => {
                executeCombine();
            }, 1000);
        } else {
            document.getElementById('statusLog').innerHTML = `[不正解] <span style="color:#e74c3c;">そこは一番小さい数字ではありません！</span><br>表をよく見て、一番小さい値を探してクリックしてください。`;
            
            selectedPair = null;
            document.getElementById('btnNextStep').style.display = 'none';
            
            renderMatrix(); 

            let targetCell = document.getElementById(`matrix_cell_${i}_${j}`);
            if (targetCell) {
                targetCell.classList.add('matrix-error');
                setTimeout(() => { targetCell.classList.remove('matrix-error'); }, 400);
            }
        }
    }

    function executeCombine() {
        if(!selectedPair) return;
        const algo = document.getElementById('algoSelect').value;
        const btnExecute = document.getElementById('btnExecute');
        
        let i = selectedPair.i, j = selectedPair.j, c1 = clusters[i], c2 = clusters[j], n = clusters.length;
        
        let activeNodesCount = clusters.filter(c => c.active).length;
        if (activeNodesCount <= 1) return;

        let newMaxDepth = 0;
        
        if(algo === "NJ") {
            if (activeNodesCount > 2) {
                const {r} = getNJQMatrix();
                let d1 = (distanceMatrix[i][j] / 2) + (r[i] - r[j]) / (2 * (activeNodesCount - 2)); 
                let d2 = distanceMatrix[i][j] - d1;
                c1.edge = Math.max(0, d1); 
                c2.edge = Math.max(0, d2);
            } else {
                c1.edge = Math.max(0, distanceMatrix[i][j] / 2);
                c2.edge = Math.max(0, distanceMatrix[i][j] / 2);
            }
            newMaxDepth = Math.max(c1.maxDepth + c1.edge, c2.maxDepth + c2.edge);
        } else {
            newMaxDepth = selectedPair.dist / 2;
            c1.edge = Math.max(0, newMaxDepth - c1.maxDepth);
            c2.edge = Math.max(0, newMaxDepth - c2.maxDepth);
        }

        let newNode = { name: `(${formatScientificName(c1.name)},${formatScientificName(c2.name)})`, id: nextNodeId++, size: c1.size+c2.size, maxDepth: newMaxDepth, left: c1, right: c2, edge: 0, active: true, minLeafIndex: Math.min(c1.minLeafIndex, c2.minLeafIndex) };
        
        let newDistForI = [];
        for(let k=0; k<n; k++) {
            if (k === i || k === j) {
                newDistForI.push(0);
            } else {
                let d = algo === "UPGMA" 
                ? (distanceMatrix[i][k]*c1.size + distanceMatrix[j][k]*c2.size)/newNode.size 
                : (distanceMatrix[i][k] + distanceMatrix[j][k] - distanceMatrix[i][j])/2;
                newDistForI.push(d);
            }
        }
        
        for(let k=0; k<n; k++) {
            distanceMatrix[i][k] = newDistForI[k];
            distanceMatrix[k][i] = newDistForI[k];
        }
        distanceMatrix[i][i] = 0;
        
        clusters[i] = newNode;
        clusters[j].active = false;
        
        selectedPair = null;
        document.getElementById('btnNextStep').style.display = 'none';
        stepCount++;

        let remainingNodes = clusters.filter(c => c.active).length;

        if(remainingNodes <= 1) {
            renderMatrix(); 
            document.getElementById('matrixContainer').innerHTML += "<div style='text-align:center; padding:15px; color:#27ae60; font-weight:bold; font-size:14px;'>全ての分類群の結合が完了しました</div>";
            
            let diagPanel = document.getElementById('autoDiagPanel');
            diagPanel.innerHTML = diagnosticMsg;
            diagPanel.style.display = 'block';

            let bsVal = parseInt(document.querySelector('input[name="bootstrap"]:checked').value);
            if (bsVal > 0) {
                document.getElementById('statusLog').innerHTML = `ブートストラップ解析(${bsVal}回)を実行中... (0/${bsVal} 回完了)`;
                document.getElementById('btnSaveImg').disabled = true;
                const btnCopyNewick = document.getElementById('btnCopyNewick');
                if (btnCopyNewick) btnCopyNewick.disabled = true;
                updatePhyloExportButtonsState(false);
                
                const worker = new Worker('lib/phylo_worker.js');
                worker.postMessage({ type: 'CALC_BOOTSTRAP', seqs: originalSeqs, algo: algo, iterations: bsVal });

                worker.onmessage = function(e) {
                    if (e.data.type === 'PROGRESS') {
                        document.getElementById('statusLog').innerHTML = `ブートストラップ解析(${bsVal}回)を実行中... (<span style="color:#e67e22; font-weight:bold;">${e.data.completed}</span>/${bsVal} 回完了)`;
                    } else if (e.data.type === 'SUCCESS_BOOTSTRAP') {
                        assignBootstrapValues(clusters.find(c => c.active), e.data.cladeCounts, bsVal);
                        
                        document.getElementById('statusLog').innerHTML = `<b>系統樹完成！</b> ${algo === 'UPGMA' ? '平均距離法 (UPGMA法)' : '近隣結合法 (NJ法)'}とブートストラップ解析が完了しました。<br><span style="color:#f1c40f;">※分岐点に表示されている数値（%）がブートストラップ値（分岐の信頼性）です。</span>`;
                        drawTree();
                        
                        let outgroupName = document.getElementById('outgroupSelect').value;
                        let finalRoot = clusters.find(c => c.active);
                        if (outgroupName) finalRoot = getRoutedTree(finalRoot, outgroupName);
                        addLogEntry(algo, bsVal, finalRoot);
                        document.getElementById('btnSaveImg').disabled = false;
                        const btnCopyNewick = document.getElementById('btnCopyNewick');
                        if (btnCopyNewick) btnCopyNewick.disabled = false;
                        updatePhyloExportButtonsState(true);
                        toggleUIState(false);
                    } else if (e.data.type === 'ERROR') {
                        showToast(e.data.message, "error");
                        document.getElementById('statusLog').innerHTML = `[エラー] ブートストラップ解析に失敗しました。`;
                        toggleUIState(false);
                    }
                };
            } else {
                document.getElementById('statusLog').innerHTML = `<b>系統樹完成！</b> ${algo === 'UPGMA' ? '平均距離法 (UPGMA法)' : '近隣結合法 (NJ法)'}による計算がすべて終了し、共通祖先（根）に到達しました。`;
                drawTree();
                
                let outgroupName = document.getElementById('outgroupSelect').value;
                let finalRoot = clusters.find(c => c.active);
                if (outgroupName) finalRoot = getRoutedTree(finalRoot, outgroupName);
                addLogEntry(algo, 0, finalRoot);
                document.getElementById('btnSaveImg').disabled = false;
                const btnCopyNewick = document.getElementById('btnCopyNewick');
                if (btnCopyNewick) btnCopyNewick.disabled = false;
                updatePhyloExportButtonsState(true);
                toggleUIState(false);
            }
        } else {
            renderMatrix(); 
            drawTree();
            document.getElementById('statusLog').innerHTML = `[STEP ${stepCount}] 新しいグループの距離を行列内でインプレース更新し、計算済みのペアを斜線で消しました。<br><b>続けて、有効なセルの中から一番小さい数字をクリックしてください。</b>`;
        }
    }

    function assignBootstrapValues(node, cladeCounts, iterations) {
        if (!node || (!node.left && !node.right)) return;
        let id = getCladeId(node);
        let count = cladeCounts[id] || 0;
        node.bootstrap = Math.round((count / iterations) * 100);
        assignBootstrapValues(node.left, cladeCounts, iterations);
        assignBootstrapValues(node.right, cladeCounts, iterations);
    }

    function getRoutedTree(root, outgroupName) {
        let cloneMap = new Map();
        function cloneNode(n) {
            if (!n) return null;
            if (cloneMap.has(n.id)) return cloneMap.get(n.id);
            let cloned = { ...n, left: null, right: null, parent: null };
            cloneMap.set(n.id, cloned);
            if (n.left) { cloned.left = cloneNode(n.left); cloned.left.parent = cloned; }
            if (n.right) { cloned.right = cloneNode(n.right); cloned.right.parent = cloned; }
            return cloned;
        }
        
        let clonedRoot = cloneNode(root);
        if (!outgroupName) return clonedRoot;

        let target = null;
        function findTarget(n) {
            if(!n) return;
            if(n.name === outgroupName && !n.left && !n.right) target = n;
            findTarget(n.left); findTarget(n.right);
        }
        findTarget(clonedRoot);

        if (!target || target.parent === clonedRoot) return clonedRoot;

        let path = [];
        let curr = target;
        while(curr) { path.push(curr); curr = curr.parent; }

        let newRoot = {
            name: "Root", id: nextNodeId++,
            left: target, right: target.parent,
            edge: 0, maxDepth: 0, active: true, minLeafIndex: target.minLeafIndex
        };

        let currentParentEdge = target.edge / 2;
        target.edge = target.edge / 2;
        target.parent = newRoot;

        let prev = target;
        for(let i=1; i<path.length-1; i++) {
            let node = path[i];
            let nextParent = path[i+1];
            let sibling = (node.left === prev) ? node.right : node.left;

            node.left = sibling;
            node.right = nextParent;
            node.parent = (i === 1) ? newRoot : path[i-1];

            let tempEdge = node.edge;
            node.edge = currentParentEdge;
            currentParentEdge = tempEdge;

            prev = node;
        }

        let oldRoot = path[path.length - 1];
        let oldRootChild = (oldRoot.left === path[path.length - 2]) ? oldRoot.right : oldRoot.left;

        let lastInPath = path[path.length - 2];
        lastInPath.right = oldRootChild;
        if(oldRootChild) oldRootChild.parent = lastInPath;
        lastInPath.edge = currentParentEdge; 
        lastInPath.parent = (path.length > 2) ? path[path.length - 3] : newRoot;

        function recalcDepth(n) {
            if(!n) return 0;
            if(!n.left && !n.right) { n.maxDepth = 0; return 0; }
            let dL = recalcDepth(n.left) + (n.left ? n.left.edge : 0);
            let dR = recalcDepth(n.right) + (n.right ? n.right.edge : 0);
            n.maxDepth = Math.max(dL, dR);
            return n.maxDepth;
        }
        recalcDepth(newRoot);

        return newRoot;
    }
    
    function changeOutgroup() {
        drawTree();
    }

    function drawTree() {
        const canvas = document.getElementById('treeCanvas');
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        ctx.fillStyle = "white"; ctx.fillRect(0,0,w,h); 

        let activeClusters = clusters.filter(c => c.active).sort((a, b) => a.minLeafIndex - b.minLeafIndex);
        if(activeClusters.length === 0) return;

        let outgroupName = document.getElementById('outgroupSelect').value;
        let forest = activeClusters;
        
        if (activeClusters.length === 1 && outgroupName) {
            forest = [getRoutedTree(activeClusters[0], outgroupName)];
        }

        let leafCount = 0;
        let globalMaxDepth = 0;

        ctx.font = 'italic bold 12px "Times New Roman", serif';
        let maxTextWidth = 0;
        originalNames.forEach(name => {
            let tw = ctx.measureText(formatScientificName(name)).width;
            if(tw > maxTextWidth) maxTextWidth = tw;
        });

        function traverseY(node) {
            if(!node.left && !node.right) { 
                node.yPos = leafCount * (h - 160)/Math.max(1, originalNames.length-1) + 80; 
                leafCount++; 
            } else { 
                if (node.left) traverseY(node.left); 
                if (node.right) traverseY(node.right); 

                if (node.left && node.right) node.yPos = (node.left.yPos + node.right.yPos)/2; 
                else if (node.left) node.yPos = node.left.yPos;
                else node.yPos = node.right.yPos;
            }
            if(node.maxDepth > globalMaxDepth) globalMaxDepth = node.maxDepth;
        }
        
        forest.forEach(root => traverseY(root));

        let drawAreaW = w - 140 - maxTextWidth - 30; 
        let scaleX = globalMaxDepth > 0 ? drawAreaW / globalMaxDepth : 1;

        function traverseX(node, parentX) {
            if (parentX === undefined) {
                node.xPos = 140 + (globalMaxDepth - node.maxDepth) * scaleX;
            } else {
                node.xPos = parentX + node.edge * scaleX;
            }
            if (node.left) traverseX(node.left, node.xPos);
            if (node.right) traverseX(node.right, node.xPos);
        }
        forest.forEach(root => traverseX(root));

        ctx.lineWidth = 3; ctx.lineJoin = 'round';
        
        function draw(node) {
            let x = node.xPos, y = node.yPos;
            
            if(!node.left && !node.right) {
                let isOutgroup = node.name === outgroupName;
                ctx.fillStyle = isOutgroup && activeClusters.length === 1 ? '#e74c3c' : '#2c3e50'; 
                ctx.font = 'italic bold 12px "Times New Roman", serif'; 
                ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
                ctx.fillText(formatScientificName(node.name), x + 12, y);
                ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2); ctx.fillStyle = isOutgroup && activeClusters.length === 1 ? '#e74c3c' : '#3498db'; ctx.fill(); 
                return;
            }
            
            if(node.left) draw(node.left); 
            if(node.right) draw(node.right);
            
            if (node.left && node.right) {
                let lx = node.left.xPos, ly = node.left.yPos;
                let rx = node.right.xPos, ry = node.right.yPos;
                
                ctx.strokeStyle = '#27ae60'; ctx.beginPath();
                ctx.moveTo(x, ly); ctx.lineTo(x, ry);
                ctx.moveTo(x, ly); ctx.lineTo(lx, ly);
                ctx.moveTo(x, ry); ctx.lineTo(rx, ry);
                ctx.stroke();

                ctx.fillStyle = '#2c3e50';
                ctx.font = '11px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom'; 
                
                const algoVal = document.getElementById('algoSelect').value;
                let leftEdgeVal = algoVal === 'ML' ? node.left.edge.toFixed(3) : node.left.edge.toFixed(1);
                ctx.fillText(leftEdgeVal, (x + lx) / 2, ly - 3);
                
                let rightEdgeVal = algoVal === 'ML' ? node.right.edge.toFixed(3) : node.right.edge.toFixed(1);
                ctx.fillText(rightEdgeVal, (x + rx) / 2, ry - 3);
                
                let isRootOfForest = forest.some(r => r.id === node.id);
                if (node.bootstrap !== undefined && !isRootOfForest) {
                    ctx.fillStyle = '#16a085'; 
                    ctx.font = '11px sans-serif';
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'top'; 
                    ctx.fillText(node.bootstrap + "%", x - 6, y + 4);
                }

                ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI*2); ctx.fillStyle = '#e67e22'; ctx.fill(); ctx.stroke();
            }
        }
        forest.forEach(root => draw(root));

        const algoVal = document.getElementById('algoSelect').value;
        const algoName = algoVal === 'UPGMA' ? '平均距離法 (UPGMA法)' : (algoVal === 'NJ' ? '近隣結合法 (NJ法)' : (algoVal === 'MP' ? '最大節約法 (MP法)' : '最尤法 (ML法)'));
        ctx.fillStyle = '#95a5a6'; 
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(`Algorithm: ${algoName}`, 20, 35);

        ctx.strokeStyle = '#bdc3c7'; ctx.lineWidth = 2; ctx.beginPath();
        let barY = h - 30; 
        let barX = 140; 
        let barLength = 10 * scaleX; 
        if (algoVal === 'ML') {
            barLength = 0.1 * scaleX;
        }
        ctx.moveTo(barX, barY); ctx.lineTo(barX + barLength, barY); ctx.stroke();
        ctx.moveTo(barX, barY-5); ctx.lineTo(barX, barY+5); ctx.stroke();
        ctx.moveTo(barX + barLength, barY-5); ctx.lineTo(barX + barLength, barY+5); ctx.stroke();
        ctx.fillStyle = '#7f8c8d'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        let barLabel = algoVal === 'MP' ? '10 Mutations' : (algoVal === 'ML' ? '0.1 Substitutions/Site' : '10 Mismatch');
        ctx.fillText(barLabel, barX + (barLength / 2), barY - 10);
        
        let legendX = w - 190;
        let legendY = h - 45;
        let legendW = 175;
        let legendH = 30;
        let r = 4;
        ctx.beginPath();
        ctx.moveTo(legendX + r, legendY);
        ctx.lineTo(legendX + legendW - r, legendY);
        ctx.quadraticCurveTo(legendX + legendW, legendY, legendX + legendW, legendY + r);
        ctx.lineTo(legendX + legendW, legendY + legendH - r);
        ctx.quadraticCurveTo(legendX + legendW, legendY + legendH, legendX + legendW - r, legendY + legendH);
        ctx.lineTo(legendX + r, legendY + legendH);
        ctx.quadraticCurveTo(legendX, legendY + legendH, legendX, legendY + legendH - r);
        ctx.lineTo(legendX, legendY + r);
        ctx.quadraticCurveTo(legendX, legendY, legendX + r, legendY);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();

        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillStyle = '#2c3e50';
        let branchLabel = algoVal === 'MP' ? 'Mutations (Steps)' : (algoVal === 'ML' ? 'Substitutions/Site' : 'Branch Length');
        ctx.fillText(branchLabel, legendX + 48, legendY + legendH / 2);
        

        ctx.fillStyle = '#16a085'; 
        ctx.fillText('% Bootstrap', legendX + 135, legendY + legendH / 2);
    }

    const scrollContainer = document.getElementById('scrollContainer');
    let isDraggingScroll = false;
    let autoScrollFrame;

    scrollContainer.addEventListener('mousedown', () => { isDraggingScroll = true; });
    document.addEventListener('mouseup', () => { 
        isDraggingScroll = false; 
        cancelAnimationFrame(autoScrollFrame);
    });
    scrollContainer.addEventListener('mouseleave', () => {
        if(!isDraggingScroll) return;
        cancelAnimationFrame(autoScrollFrame);
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDraggingScroll) return;
        const rect = scrollContainer.getBoundingClientRect();
        const scrollTriggerArea = 50; 
        const maxSpeed = 30; 
        let scrollSpeed = 0;

        if (e.clientX > rect.right - scrollTriggerArea && e.clientX < rect.right + 100) {
            let dist = e.clientX - (rect.right - scrollTriggerArea);
            scrollSpeed = Math.min(maxSpeed, (dist / scrollTriggerArea) * maxSpeed);
        } 
        else if (e.clientX < rect.left + scrollTriggerArea && e.clientX > rect.left - 100) {
            let dist = (rect.left + scrollTriggerArea) - e.clientX;
            scrollSpeed = -Math.min(maxSpeed, (dist / scrollTriggerArea) * maxSpeed);
        }

        cancelAnimationFrame(autoScrollFrame);
        if (scrollSpeed !== 0) {
            const scrollLoop = () => {
                scrollContainer.scrollLeft += scrollSpeed;
                autoScrollFrame = requestAnimationFrame(scrollLoop);
            };
            autoScrollFrame = requestAnimationFrame(scrollLoop);
        }
    });

    // 入力変更時および初期ロード時のエクスポートボタン状態初期化（ガイドライン第9項②準拠）
    document.getElementById('fastaInput')?.addEventListener('input', () => {
        updatePhyloExportButtonsState(false);
    });
    window.addEventListener('load', () => {
        updatePhyloExportButtonsState(false);
    });
    updatePhyloExportButtonsState(false);
