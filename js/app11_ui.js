document.addEventListener("DOMContentLoaded", () => {
    const runBtn = document.getElementById("run-analysis-btn");
    const mutationInput = document.getElementById("mutation-data");
    const variationInput = document.getElementById("variation-data");
    const resultArea = document.getElementById("result-area");
    const mantelRDisplay = document.getElementById("mantel-r");
    const ctx = document.getElementById("mantelChart").getContext("2d");
    window.mantelChartInstance = null;

    let baseMutMatrix = null;
    let baseVarMatrix = null;
    const noiseSlider = document.getElementById("noise-slider");
    const noiseValueDisplay = document.getElementById("noise-value");

    // データのパース関数
    function parseData(text) {
        const lines = text.trim().split('\n');
        let data = [];
        for (let line of lines) {
            if (!line.trim()) continue;
            // カンマ、タブ、スペースで区切る
            const parts = line.trim().split(/[\t, ]+/);
            // 数値に変換可能なものだけを抽出する
            let vector = parts.map(Number).filter(n => !isNaN(n));
            if (vector.length > 0) {
                data.push(vector);
            }
        }
        return data;
    }

    // 距離マトリクスから下三角要素（対角線を除く）のペアを抽出
    function extractPairs(matrixA, matrixB) {
        const N = matrixA.length;
        let points = [];
        for (let i = 1; i < N; i++) {
            for (let j = 0; j < i; j++) {
                points.push({
                    x: matrixA[i][j], // Mutation (Genetic distance)
                    y: matrixB[i][j]  // Variation (Morphological distance)
                });
            }
        }
        return points;
    }

    runBtn.addEventListener("click", () => {
        const mutText = mutationInput.value;
        const varText = variationInput.value;

        if (!mutText || !varText) {
            showSmartAlert("突然変異データと変異データの両方を入力してください。");
            return;
        }

        const mutData = parseData(mutText);
        const varData = parseData(varText);

        if (mutData.length < 3 || varData.length < 3) {
            showSmartAlert("Mantel検定を実行するには、少なくとも3個体以上のデータが必要です。");
            return;
        }

        if (mutData.length !== varData.length) {
            showSmartAlert(`データ数が一致しません。\n突然変異データ: ${mutData.length}個\n変異データ: ${varData.length}個`);
            return;
        }

        try {
            // --- 追加: 入力データのプロット ---
            const mutScatterData = mutData.map(d => ({ x: d[0] || 0, y: d[1] || 0 }));
            const mutCtx = document.getElementById("mutationChart").getContext("2d");
            if (window.mutationChartInstance) window.mutationChartInstance.destroy();
            window.mutationChartInstance = new Chart(mutCtx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: '突然変異 (Genetic)',
                        data: mutScatterData,
                        backgroundColor: 'rgba(26, 188, 156, 0.8)',
                        borderColor: '#1abc9c',
                        pointRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { title: { display: true, text: 'X 座標' } },
                        y: { title: { display: true, text: 'Y 座標' } }
                    }
                }
            });

            const varScatterData = varData.map(d => ({ x: d[0] || 0, y: d[1] || 0 }));
            const varCtx = document.getElementById("variationChart").getContext("2d");
            if (window.variationChartInstance) window.variationChartInstance.destroy();
            window.variationChartInstance = new Chart(varCtx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: '変異 (Morphological)',
                        data: varScatterData,
                        backgroundColor: 'rgba(230, 126, 34, 0.8)',
                        borderColor: '#e67e22',
                        pointRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { title: { display: true, text: 'X 特徴量' } },
                        y: { title: { display: true, text: 'Y 特徴量' } }
                    }
                }
            });
            // ---------------------------------

            // 1. 距離マトリクスの計算
            const mutMatrix = calculateEuclideanDistanceMatrix(mutData);
            const varMatrix = calculateEuclideanDistanceMatrix(varData);

            baseMutMatrix = mutMatrix;
            baseVarMatrix = varMatrix;

            if (noiseSlider) {
                noiseSlider.value = 0;
                if (noiseValueDisplay) noiseValueDisplay.textContent = "0";
            }

            updateMantelChartAndR();

            // 4. 解析完了時に画面下部へスムーススクロール
            setTimeout(() => {
                resultArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);

        } catch (error) {
            console.error(error);
            showSmartAlert("解析中にエラーが発生しました。データフォーマットを確認してください。");
        }
    });

    if (noiseSlider) {
        noiseSlider.addEventListener("input", (e) => {
            if (noiseValueDisplay) noiseValueDisplay.textContent = e.target.value;
            updateMantelChartAndR();
        });
    }

    function updateMantelChartAndR() {
        if (!baseMutMatrix || !baseVarMatrix) return;
        
        const noiseLevel = noiseSlider ? parseInt(noiseSlider.value, 10) : 0;
        const N = baseMutMatrix.length;
        
        let maxVar = 0;
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                if (baseVarMatrix[i][j] > maxVar) maxVar = baseVarMatrix[i][j];
            }
        }
        
        const noisedVarMatrix = [];
        for (let i = 0; i < N; i++) {
            noisedVarMatrix[i] = [];
            for (let j = 0; j < N; j++) {
                if (i === j) {
                    noisedVarMatrix[i][j] = 0;
                } else if (j < i) {
                    const base = baseVarMatrix[i][j];
                    const noise = (Math.random() - 0.5) * 2 * (maxVar * (noiseLevel / 100));
                    noisedVarMatrix[i][j] = Math.max(0, base + noise);
                }
            }
        }
        for (let i = 0; i < N; i++) {
            for (let j = i + 1; j < N; j++) {
                noisedVarMatrix[i][j] = noisedVarMatrix[j][i];
            }
        }

        // 2. Mantel相関係数の再計算
        const r = calculateMantelCorrelation(baseMutMatrix, noisedVarMatrix);
        mantelRDisplay.textContent = r.toFixed(4);
        
        document.getElementById("mantel-placeholder").style.display = "none";
        resultArea.style.display = "block";

        // 3. 散布図データ抽出
        const scatterData = extractPairs(baseMutMatrix, noisedVarMatrix);
        
        // --- 外れ値検出 (線形回帰による残差から) ---
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        const len = scatterData.length;
        if (len > 1) {
            for (let i = 0; i < len; i++) {
                sumX += scatterData[i].x;
                sumY += scatterData[i].y;
                sumXY += scatterData[i].x * scatterData[i].y;
                sumXX += scatterData[i].x * scatterData[i].x;
            }
            const meanX = sumX / len;
            const meanY = sumY / len;
            const slope = (sumXX - len * meanX * meanX === 0) ? 0 : (sumXY - len * meanX * meanY) / (sumXX - len * meanX * meanX);
            const intercept = meanY - slope * meanX;

            let residuals = [];
            for (let i = 0; i < len; i++) {
                const predictedY = slope * scatterData[i].x + intercept;
                const resid = scatterData[i].y - predictedY;
                residuals.push(resid);
                scatterData[i]._resid = resid;
            }
            const meanResid = residuals.reduce((a,b)=>a+b, 0) / len;
            const varResid = residuals.reduce((a,b)=>a + Math.pow(b - meanResid, 2), 0) / len;
            const stdResid = Math.sqrt(varResid);

            const threshold = stdResid * 1.5;
            for (let i = 0; i < len; i++) {
                scatterData[i].isOutlier = Math.abs(scatterData[i]._resid) > threshold;
            }
        } else {
            for (let i = 0; i < len; i++) scatterData[i].isOutlier = false;
        }
        
        const bgColors = scatterData.map(d => d.isOutlier ? 'rgba(231, 76, 60, 0.9)' : 'rgba(142, 68, 173, 0.8)');
        const borderColors = scatterData.map(d => d.isOutlier ? '#c0392b' : '#8e44ad');
        const radii = scatterData.map(d => d.isOutlier ? 7 : 5);
        const hoverRadii = scatterData.map(d => d.isOutlier ? 9 : 7);

        if (window.mantelChartInstance) {
            window.mantelChartInstance.destroy();
        }

        window.mantelChartInstance = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: '個体間ペア距離',
                    data: scatterData,
                    backgroundColor: bgColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                    pointRadius: radii,
                    pointHoverRadius: hoverRadii
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const d = context.raw;
                                let lines = [`Mutation: ${d.x.toFixed(3)}, Variation: ${d.y.toFixed(3)}`];
                                if (d.isOutlier) {
                                    lines.push('【特異な適応個体】全体の相関トレンドから逸脱しています。');
                                    lines.push('局所適応、交雑、または測定ノイズの可能性があります。');
                                }
                                return lines;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: '遺伝的距離 (Mutation)' },
                        grid: { color: '#e9ecef' }
                    },
                    y: {
                        title: { display: true, text: '形態的距離 (Variation)' },
                        grid: { color: '#e9ecef' }
                    }
                }
            }
        });
    }
});