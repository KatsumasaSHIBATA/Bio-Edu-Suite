document.addEventListener("DOMContentLoaded", () => {
    const runBtn = document.getElementById("run-analysis-btn");
    const mutationInput = document.getElementById("mutation-data");
    const variationInput = document.getElementById("variation-data");
    const resultArea = document.getElementById("result-area");
    const mantelRDisplay = document.getElementById("mantel-r");
    const ctx = document.getElementById("mantelChart").getContext("2d");
    window.mantelChartInstance = null;

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

            // 2. Mantel相関係数の計算
            const r = calculateMantelCorrelation(mutMatrix, varMatrix);

            // 結果の表示
            mantelRDisplay.textContent = r.toFixed(4);
            document.getElementById("mantel-placeholder").style.display = "none";
            resultArea.style.display = "block";

            // 3. 散布図の描画 (Chart.js)
            const scatterData = extractPairs(mutMatrix, varMatrix);
            
            if (window.mantelChartInstance) {
                window.mantelChartInstance.destroy();
            }

            window.mantelChartInstance = new Chart(ctx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: '個体間ペア距離',
                        data: scatterData,
                        backgroundColor: 'rgba(142, 68, 173, 0.8)',
                        borderColor: '#8e44ad',
                        borderWidth: 1,
                        pointRadius: 5,
                        pointHoverRadius: 7
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
                                    return `Mutation: ${context.parsed.x.toFixed(3)}, Variation: ${context.parsed.y.toFixed(3)}`;
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

            // 4. 解析完了時に画面下部へスムーススクロール
            setTimeout(() => {
                resultArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);

        } catch (error) {
            console.error(error);
            showSmartAlert("解析中にエラーが発生しました。データフォーマットを確認してください。");
        }
    });
});