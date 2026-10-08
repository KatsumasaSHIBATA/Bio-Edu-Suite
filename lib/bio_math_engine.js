/**
 * Bio-Edu Suite: Common Biological Math & Statistics Engine
 * lib/bio_math_engine.js
 * 準拠: 日本学術会議2025年版 / ガイドライン第0項・第11項・第18項
 */
(function(global) {
    'use strict';

    const BioMathEngine = {
        // ユークリッド距離マトリクス算出
        calculateEuclideanDistanceMatrix: function(dataMatrix) {
            const n = dataMatrix.length;
            const matrix = Array.from({ length: n }, () => new Float64Array(n));
            for (let i = 0; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                    let sumSq = 0;
                    const len = Math.min(dataMatrix[i].length, dataMatrix[j].length);
                    for (let k = 0; k < len; k++) {
                        const diff = (dataMatrix[i][k] || 0) - (dataMatrix[j][k] || 0);
                        sumSq += diff * diff;
                    }
                    const dist = Math.sqrt(sumSq);
                    matrix[i][j] = dist;
                    matrix[j][i] = dist;
                }
            }
            return matrix;
        },

        // ピアソン積率相関係数の算出
        calculatePearsonCorrelation: function(xArray, yArray) {
            const n = Math.min(xArray.length, yArray.length);
            if (n === 0) return 0;
            let sumX = 0, sumY = 0;
            for (let i = 0; i < n; i++) {
                sumX += xArray[i];
                sumY += yArray[i];
            }
            const meanX = sumX / n;
            const meanY = sumY / n;

            let num = 0, denX = 0, denY = 0;
            for (let i = 0; i < n; i++) {
                const dx = xArray[i] - meanX;
                const dy = yArray[i] - meanY;
                num += dx * dy;
                denX += dx * dx;
                denY += dy * dy;
            }
            const den = Math.sqrt(denX * denY);
            return den === 0 ? 0 : (num / den);
        },

        // Mantel検定（2つの距離行列間の相関 r）
        calculateMantelTest: function(matrixA, matrixB) {
            const n = matrixA.length;
            if (n !== matrixB.length || n < 2) return { r: 0, points: [] };

            const vecA = [];
            const vecB = [];
            const points = [];

            for (let i = 0; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                    const valA = matrixA[i][j];
                    const valB = matrixB[i][j];
                    vecA.push(valA);
                    vecB.push(valB);
                    points.push({ x: valA, y: valB, i: i, j: j });
                }
            }

            const r = this.calculatePearsonCorrelation(vecA, vecB);
            return {
                r: Number(r.toFixed(4)),
                points: points
            };
        },

        // app11_ui.js 互換用 Mantel 相関関数
        calculateMantelCorrelation: function(matrixA, matrixB) {
            const testResult = this.calculateMantelTest(matrixA, matrixB);
            // 数値としての直接評価（r.toFixed等）と、オブジェクトプロパティ（r.points, r.r）の双方に適合
            const val = testResult.r;
            const hybrid = new Number(val);
            hybrid.r = val;
            hybrid.points = testResult.points;
            return hybrid;
        }
    };

    // グローバル名前空間への登録
    global.BioMathEngine = BioMathEngine;

    // 後方互換性および既存UIからの直接呼び出し用エイリアス展開
    global.calculateEuclideanDistanceMatrix = BioMathEngine.calculateEuclideanDistanceMatrix.bind(BioMathEngine);
    global.calculatePearsonCorrelation = BioMathEngine.calculatePearsonCorrelation.bind(BioMathEngine);
    global.calculateMantelTest = BioMathEngine.calculateMantelTest.bind(BioMathEngine);
    global.calculateMantelCorrelation = BioMathEngine.calculateMantelCorrelation.bind(BioMathEngine);

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = BioMathEngine;
    }
})(typeof window !== 'undefined' ? window : global);
