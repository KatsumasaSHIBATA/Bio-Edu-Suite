/**
 * ==========================================
 * Bio-Edu Suite: Math & Statistical Engine (Master)
 * ==========================================
 * 
 * [References]
 * - Morphology (EFA): Kuhl & Giardina (1982), 岩田洋佳 (1998) p.10-18
 * - Clustering (Lance-Williams): 新納浩幸 (2007) p.67-68
 */

// ==========================================
// 1. Morphometrics & EFA (楕円フーリエ解析)
// ==========================================

/**
 * Freeman Chain Code (8方向) を X, Y 座標系の軌跡に変換する
 * 参照: 岩田(1998) p.13 (画像座標系: Y軸下向き正)
 */
function chainCodeToCoordinates(codes) {
    // 0:東, 1:北東, 2:北, 3:北西, 4:西, 5:南西, 6:南, 7:南東
    const dx = [1,  1,  0, -1, -1, -1,  0,  1];
    const dy = [0, -1, -1, -1,  0,  1,  1,  1]; // 修正: 原典通りの画像座標系(下向き正)
    
    let coords = [{x: 0, y: 0}], cx = 0, cy = 0;
    for(let i=0; i<codes.length; i++) { 
        cx += dx[codes[i]]; 
        cy += dy[codes[i]]; 
        coords.push({x: cx, y: cy}); 
    }
    return coords;
}

/**
 * 座標群から EFA の係数 (a, b, c, d) を算出する
 * 参照: 岩田(1998) p.10 式(3), (4)
 */
function computeEFA(coords, numHarmonics) {
    const K = coords.length - 1;
    let dt = new Array(K), t = new Array(K + 1);
    t[0] = 0;
    
    // 各点間の距離（弧長）の計算
    for(let p=0; p<K; p++) {
        dt[p] = Math.sqrt(Math.pow(coords[p+1].x - coords[p].x, 2) + Math.pow(coords[p+1].y - coords[p].y, 2));
        t[p+1] = t[p] + dt[p];
    }
    const T = t[K]; // 全周囲長
    
    if(T === 0) {
        let empty = [];
        for(let n=1; n<=numHarmonics; n++) empty.push({a:0, b:0, c:0, d:0});
        return empty;
    }

    let coeffs = [];
    for(let n=1; n<=numHarmonics; n++) {
        let a=0, b=0, c=0, d=0;
        let factor = T / (2 * n * n * Math.PI * Math.PI);
        
        for(let p=0; p<K; p++) {
            if(dt[p] === 0) continue;
            let dX = coords[p+1].x - coords[p].x;
            let dY = coords[p+1].y - coords[p].y;
            let phi_p = (2 * Math.PI * n * t[p+1]) / T;
            let phi_prev = (2 * Math.PI * n * t[p]) / T;
            let dcos = Math.cos(phi_p) - Math.cos(phi_prev);
            let dsin = Math.sin(phi_p) - Math.sin(phi_prev);
            
            a += (dX / dt[p]) * dcos;
            b += (dX / dt[p]) * dsin;
            c += (dY / dt[p]) * dcos;
            d += (dY / dt[p]) * dsin;
        }
        coeffs.push({ a: factor*a, b: factor*b, c: factor*c, d: factor*d });
    }
    return coeffs;
}

/**
 * 第1調和楕円に基づく厳密な標準化 (サイズ、回転、開始点)
 * 参照: 岩田(1998) p.15-18 "2.4 楕円フーリエ記述子の標準化"
 */
function standardizeEFA(coeffs) {
    if(coeffs.length === 0) return coeffs;
    
    // 第1調和項の係数
    let a1 = coeffs[0].a, b1 = coeffs[0].b, c1 = coeffs[0].c, d1 = coeffs[0].d;
    
    // 長軸の傾き theta1 の算出
    let theta1 = 0.5 * Math.atan2(2 * (a1*b1 + c1*d1), a1*a1 + c1*c1 - b1*b1 - d1*d1);
    if (theta1 < 0) theta1 += Math.PI; 
    
    let a1_star = a1 * Math.cos(theta1) + b1 * Math.sin(theta1);
    let c1_star = c1 * Math.cos(theta1) + d1 * Math.sin(theta1);
    
    // 位相のずれ psi1 の算出
    let psi1 = Math.atan2(c1_star, a1_star);
    if (psi1 < 0) psi1 += 2 * Math.PI;
    
    // スケール E_star (半長軸の大きさ) の算出
    let E_star = Math.sqrt(a1_star*a1_star + c1_star*c1_star) || 1;

    let std = [];
    for (let n = 1; n <= coeffs.length; n++) {
        let a = coeffs[n-1].a, b = coeffs[n-1].b, c = coeffs[n-1].c, d = coeffs[n-1].d;
        let n_theta1 = n * theta1;
        let cos_nt = Math.cos(n_theta1), sin_nt = Math.sin(n_theta1);
        let cos_psi = Math.cos(psi1), sin_psi = Math.sin(psi1);

        // 位相の標準化
        let m1_a = a * cos_nt + b * sin_nt;
        let m1_b = -a * sin_nt + b * cos_nt;
        let m1_c = c * cos_nt + d * sin_nt;
        let m1_d = -c * sin_nt + d * cos_nt;

        // 回転とサイズの標準化
        let a_new = (cos_psi * m1_a + sin_psi * m1_c) / E_star;
        let b_new = (cos_psi * m1_b + sin_psi * m1_d) / E_star;
        let c_new = (-sin_psi * m1_a + cos_psi * m1_c) / E_star;
        let d_new = (-sin_psi * m1_b + cos_psi * m1_d) / E_star;

        std.push({a: a_new, b: b_new, c: c_new, d: d_new});
    }
    return std;
}

/**
 * フーリエ逆変換によるシルエット描画 (UI用/App10)
 * EFA係数からCanvas上に元の形状を復元してアニメーション遷移等に用いる
 */
function drawEFAShape(ctx, coeffs, canvasWidth, canvasHeight, options = {}) {
    if (!coeffs || coeffs.length === 0) return;
    
    const scale = options.scale || 100;
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    const points = 200; // 描画の滑らかさ (頂点数)
    const fillColor = options.fillColor || "rgba(74, 144, 226, 0.5)";
    const strokeColor = options.strokeColor || "#333";

    if (options.animate) {
        let currentPoint = 0;
        const speed = options.animateSpeed || 2;
        
        function animateFrame() {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.beginPath();
            
            for (let i = 0; i <= currentPoint; i++) {
                let t = (i / points) * 2 * Math.PI;
                let x = 0, y = 0;
                
                for (let n = 1; n <= coeffs.length; n++) {
                    let c = coeffs[n - 1];
                    let nt = n * t;
                    x += c.a * Math.cos(nt) + c.b * Math.sin(nt);
                    y += c.c * Math.cos(nt) + c.d * Math.sin(nt);
                }
                
                let plotX = cx + (x * scale);
                // CanvasのY軸は下向き正のため、EFAのY座標を反転させる
                let plotY = cy - (y * scale); 
                
                if (i === 0) ctx.moveTo(plotX, plotY);
                else ctx.lineTo(plotX, plotY);
            }
            
            ctx.lineWidth = 2;
            ctx.strokeStyle = strokeColor;
            ctx.stroke();
            
            if (currentPoint >= points) {
                ctx.closePath();
                ctx.fillStyle = fillColor;
                ctx.fill();
            } else {
                currentPoint = Math.min(currentPoint + speed, points);
                requestAnimationFrame(animateFrame);
            }
        }
        animateFrame();
    } else {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
            let t = (i / points) * 2 * Math.PI;
            let x = 0, y = 0;
            
            for (let n = 1; n <= coeffs.length; n++) {
                let c = coeffs[n - 1];
                let nt = n * t;
                x += c.a * Math.cos(nt) + c.b * Math.sin(nt);
                y += c.c * Math.cos(nt) + c.d * Math.sin(nt);
            }
            
            let plotX = cx + (x * scale);
            let plotY = cy - (y * scale); 
            
            if (i === 0) ctx.moveTo(plotX, plotY);
            else ctx.lineTo(plotX, plotY);
        }
        ctx.closePath();
        
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
    }
}

// ==========================================
// 2. Statistical Analysis (PCA & Clustering)
// ==========================================

/**
 * NIPALSアルゴリズムによる主成分分析 (PCA)
 */
function nipalsPCA(X, n_components = 2) {
    let n = X.length; 
    let p = X[0].length;
    let means = new Array(p).fill(0);
    
    for(let i=0; i<n; i++) for(let j=0; j<p; j++) means[j] += X[i][j] / n;
    let Xc = X.map(row => row.map((val, j) => val - means[j]));
    
    let scores = []; 
    let evals = []; 
    let E = Xc.map(row => row.slice());
    
    for(let k=0; k<n_components; k++) {
        let t = E.map(row => row[0]); 
        let p_vec = new Array(p).fill(0); 
        let t_old = new Array(n).fill(0);
        
        for(let iter=0; iter<50; iter++) {
            t_old = t.slice();
            let t_norm_sq = t.reduce((sum, val) => sum + val*val, 0) || 1;
            
            for(let j=0; j<p; j++) {
                let sum = 0; for(let i=0; i<n; i++) sum += E[i][j] * t[i];
                p_vec[j] = sum / t_norm_sq;
            }
            
            let p_norm = Math.sqrt(p_vec.reduce((sum, val) => sum + val*val, 0)) || 1;
            p_vec = p_vec.map(val => val / p_norm);
            
            for(let i=0; i<n; i++) {
                let sum = 0; for(let j=0; j<p; j++) sum += E[i][j] * p_vec[j];
                t[i] = sum;
            }
            
            let diff = 0; for(let i=0; i<n; i++) diff += Math.pow(t[i] - t_old[i], 2);
            if(diff < 1e-6) break;
        }
        scores.push(t);
        let variance = t.reduce((sum, val) => sum + val*val, 0) / (n - 1);
        evals.push(variance);
        
        for(let i=0; i<n; i++) for(let j=0; j<p; j++) E[i][j] -= t[i] * p_vec[j];
    }
    
    let scores_t = [];
    for(let i=0; i<n; i++) scores_t.push([scores[0][i], scores[1][i]]);
    
    let totalVar = Xc[0].reduce((sum, _, j) => sum + Xc.reduce((s, row) => s + row[j]*row[j], 0)/(n-1), 0);
    let varRatios = evals.map(e => (e / totalVar) * 100);
    
    return { scores: scores_t, varianceRatios: varRatios };
}

/**
 * 距離計算関数 (ユークリッド, マンハッタン, キャンベラ)
 */
function calcDistance(vecA, vecB, type) {
    let sum = 0;
    for (let i = 0; i < vecA.length; i++) {
        let a = vecA[i], b = vecB[i];
        if (type === 'euclidean') sum += Math.pow(a - b, 2);
        else if (type === 'manhattan') sum += Math.abs(a - b);
        else if (type === 'canberra') {
            let num = Math.abs(a - b), den = Math.abs(a) + Math.abs(b);
            if (den !== 0) sum += num / den;
        }
    }
    return type === 'euclidean' ? Math.sqrt(sum) : sum;
}

/**
 * 階層的クラスタリング (Lance-Williams 更新式に基づく)
 * 参照: 新納浩幸 (2007) p.67-68
 */
function performClustering(data, sampleNames, distType, linkType) {
    const n = data.length;
    let distMatrix = [];
    
    // 初期距離行列の作成
    for (let i = 0; i < n; i++) {
        distMatrix[i] = [];
        for (let j = 0; j < n; j++) {
            if (i === j) distMatrix[i][j] = 0;
            else if (i > j) {
                let d = calcDistance(data[i], data[j], distType);
                if (linkType === 'ward') d = d * d; // Ward法は距離の平方を初期値とする
                distMatrix[i][j] = d;
            }
        }
    }
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) distMatrix[i][j] = distMatrix[j][i];

    let clusters = [];
    for (let i = 0; i < n; i++) {
        clusters.push({ id: i, name: sampleNames[i], size: 1, active: true, left: null, right: null, height: 0 });
    }

    let clusterCount = n;
    while (clusterCount > 1) {
        let minDist = Infinity, mergeI = -1, mergeJ = -1;
        for (let i = 0; i < clusters.length; i++) {
            if (!clusters[i].active) continue;
            for (let j = i + 1; j < clusters.length; j++) {
                if (!clusters[j].active) continue;
                let d = distMatrix[clusters[i].id][clusters[j].id];
                if (d < minDist) { minDist = d; mergeI = i; mergeJ = j; }
            }
        }

        let cI = clusters[mergeI], cJ = clusters[mergeJ];
        cI.active = false; cJ.active = false;

        let newCluster = {
            id: clusters.length, 
            name: `Node${clusters.length}`, 
            size: cI.size + cJ.size,
            active: true, 
            left: cI, 
            right: cJ,
            height: linkType === 'ward' ? Math.sqrt(minDist) : minDist
        };
        
        if(linkType !== 'ward' && linkType !== 'upgma') newCluster.height = minDist;

        distMatrix[newCluster.id] = [];
        // Lance-Williams 更新式の適用
        for (let k = 0; k < clusters.length; k++) {
            if (!clusters[k].active && k !== mergeI && k !== mergeJ) continue;
            let d_ik = distMatrix[cI.id][clusters[k].id];
            let d_jk = distMatrix[cJ.id][clusters[k].id];
            let d_ij = minDist;
            let ni = cI.size, nj = cJ.size, nk = clusters[k].size, newDist = 0;

            if (linkType === 'upgma') newDist = (ni * d_ik + nj * d_jk) / (ni + nj);
            else if (linkType === 'complete') newDist = Math.max(d_ik, d_jk);
            else if (linkType === 'single') newDist = Math.min(d_ik, d_jk);
            else if (linkType === 'ward') newDist = ((ni + nk) * d_ik + (nj + nk) * d_jk - nk * d_ij) / (ni + nj + nk);

            distMatrix[newCluster.id][clusters[k].id] = newDist;
            if(!distMatrix[clusters[k].id]) distMatrix[clusters[k].id] = [];
            distMatrix[clusters[k].id][newCluster.id] = newDist;
        }
        clusters.push(newCluster);
        clusterCount--;
    }
    return clusters[clusters.length - 1]; 
}

// ==========================================
// 3. 統合・エクスポート・バケツリレー機能 (App 10向け)
// ==========================================

/**
 * アプリ⑨ (Morphometrics Studio) から アプリ⑩ へデータをバケツリレーするためのエクスポート
 */
function exportToIntegrativeJSON(samplesData) {
    // 必須プロパティを含む有効なデータのみをフィルタリングして JSON を構築
    const validSamples = samplesData.filter(s => s && s.id && s.pcaScores && s.efaCoeffs);
    
    const exportData = {
        metadata: {
            harmonics: validSamples[0]?.efaCoeffs.length || 20,
            exportedAt: new Date().toISOString()
        },
        samples: validSamples.map(s => ({
            id: s.id,
            name: s.name || s.id,
            pcaScores: s.pcaScores,
            efaCoeffs: s.efaCoeffs
        }))
    };
    return JSON.stringify(exportData, null, 2);
}

/**
 * アプリ⑧ (Tree Builder) で生成された Newick テキストを D3.js 階層構造へパース
 */
function parseNewick(newick) {
    let ancestors = [];
    let tree = {};
    
    // 不要なセミコロン以降や空白を除去して堅牢性を確保
    newick = newick.split(';')[0].trim();
    let tokens = newick.split(/\s*(\(|\)|,|:)\s*/).filter(t => t);
    
    let currentNode = tree;

    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        switch (token) {
            case '(': // 子ノードの始まり
                let subTree = {};
                ancestors.push(currentNode);
                if (!currentNode.children) currentNode.children = [];
                currentNode.children.push(subTree);
                currentNode = subTree;
                break;
            case ',': // 兄弟ノード
                let sibling = {};
                ancestors[ancestors.length - 1].children.push(sibling);
                currentNode = sibling;
                break;
            case ')': // 親ノードへ戻る
                currentNode = ancestors.pop();
                break;
            case ':': // 枝の長さ（スキップして次の数値を読む）
                break;
            default:
                let prevToken = i > 0 ? tokens[i - 1] : '';
                if (prevToken === ':') {
                    currentNode.length = parseFloat(token);
                    if (isNaN(currentNode.length)) currentNode.length = 0;
                } else {
                    currentNode.name = token;
                }
        }
    }
    return tree;
}

/**
 * 祖先ノードの形態推定 (系統樹の分岐点におけるEFA係数の補間)
 * App 10 における「魔法のホバー体験」の裏側を支えるロジック
 */
function interpolateAncestralEFA(node, leafDataMap) {
    // 葉（末端ノード）の場合
    if (!node.children || node.children.length === 0) {
        node.efaCoeffs = leafDataMap[node.name] || null;
        return node.efaCoeffs;
    }

    // 内部ノード（祖先）の場合：子ノードのEFA係数を再帰的に取得
    let childrenCoeffs = node.children
        .map(child => interpolateAncestralEFA(child, leafDataMap))
        .filter(c => c !== null);
    
    if (childrenCoeffs.length === 0) return null;

    // 進化距離(node.length)を加味した加重平均による祖先形態の推定
    let numHarmonics = childrenCoeffs[0].length;
    let avgCoeffs = [];
    
    // 分岐距離が短いノード（近い子孫）ほど形態の寄与を大きくする
    let weights = node.children.map(child => {
        if (child.length === undefined || child.length === null) return 1;
        return 1 / (child.length + 0.0001); // 0除算防止
    });
    
    let totalWeight = weights.reduce((sum, w) => sum + w, 0);
    
    for (let h = 0; h < numHarmonics; h++) {
        let sumA = 0, sumB = 0, sumC = 0, sumD = 0;
        for (let i = 0; i < childrenCoeffs.length; i++) {
            let c = childrenCoeffs[i];
            let w = weights[i] / totalWeight;
            sumA += c[h].a * w;
            sumB += c[h].b * w;
            sumC += c[h].c * w;
            sumD += c[h].d * w;
        }
        avgCoeffs.push({ a: sumA, b: sumB, c: sumC, d: sumD });
    }
    
    node.efaCoeffs = avgCoeffs;
    return avgCoeffs;
}

/**
 * ==========================================
 * 6. Mantel Test Engine
 * ==========================================
 */

/**
 * ベクトルの配列からユークリッド距離マトリクスを生成する
 * @param {Array<Array<number>>} dataArray - 数値ベクトルの配列 (例: 形態の変異(variation)スコアや、突然変異(mutation)座標)
 * @returns {Array<Array<number>>} - 対称な距離マトリクス (N x N)
 */
function calculateEuclideanDistanceMatrix(dataArray) {
    const N = dataArray.length;
    let matrix = new Array(N);
    for (let i = 0; i < N; i++) {
        matrix[i] = new Array(N).fill(0);
    }
    
    for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
            let sumSq = 0;
            for (let k = 0; k < dataArray[i].length; k++) {
                sumSq += Math.pow(dataArray[i][k] - dataArray[j][k], 2);
            }
            const dist = Math.sqrt(sumSq);
            matrix[i][j] = dist;
            matrix[j][i] = dist;
        }
    }
    return matrix;
}

/**
 * 2つの距離マトリクス間の相関係数 (Mantel r) を計算する
 * 対角線および上三角行列を除外したピアソン積率相関係数
 * @param {Array<Array<number>>} matrixA - 距離マトリクスA
 * @param {Array<Array<number>>} matrixB - 距離マトリクスB
 * @returns {number} - ピアソン積率相関係数 (-1.0 to 1.0)
 */
function calculateMantelCorrelation(matrixA, matrixB) {
    const N = matrixA.length;
    if (N !== matrixB.length || N < 2) return 0;
    
    let vecA = [];
    let vecB = [];
    
    // 対称行列の下三角要素（対角線を除く）を抽出
    for (let i = 1; i < N; i++) {
        for (let j = 0; j < i; j++) {
            vecA.push(matrixA[i][j]);
            vecB.push(matrixB[i][j]);
        }
    }
    
    const count = vecA.length;
    if (count === 0) return 0;
    
    let sumA = 0, sumB = 0;
    for (let i = 0; i < count; i++) {
        sumA += vecA[i];
        sumB += vecB[i];
    }
    const meanA = sumA / count;
    const meanB = sumB / count;
    
    let sumSqA = 0, sumSqB = 0, sumProd = 0;
    for (let i = 0; i < count; i++) {
        const diffA = vecA[i] - meanA;
        const diffB = vecB[i] - meanB;
        sumSqA += diffA * diffA;
        sumSqB += diffB * diffB;
        sumProd += diffA * diffB;
    }
    
    if (sumSqA === 0 || sumSqB === 0) return 0;
    
    return sumProd / Math.sqrt(sumSqA * sumSqB);
}
/**
 * F分布の有意確率（p値）を計算する関数
 * 正則化不完全ベータ関数の連分数展開を用いて、F値および自由度からp値を算出する
 * @param {number} F - F値
 * @param {number} df1 - 自由度1（分子）
 * @param {number} df2 - 自由度2（分母）
 * @returns {number} p値
 */
function calculateFProbability(F, df1, df2) {
    if (F <= 0) return 1.0;
    if (df1 <= 0 || df2 <= 0) return NaN;

    const x = df2 / (df2 + df1 * F);
    const a = df2 / 2.0;
    const b = df1 / 2.0;

    function gammln(xx) {
        const cof = [
            76.18009172947146,
            -86.50532032941677,
            24.01409824083091,
            -1.231739572450155,
            0.1208650973866179e-2,
            -0.5395239384953e-5
        ];
        let y = xx;
        let tmp = xx + 5.5;
        tmp -= (xx + 0.5) * Math.log(tmp);
        let ser = 1.000000000190015;
        for (let j = 0; j <= 5; j++) {
            y += 1;
            ser += cof[j] / y;
        }
        return -tmp + Math.log(2.5066282746310005 * ser / xx);
    }

    function betacf(xx, aa, bb) {
        const MAXIT = 1000;
        const EPS = 3.0e-7;
        const FPMIN = 1.0e-30;
        const qab = aa + bb;
        const qap = aa + 1.0;
        const qam = aa - 1.0;
        let c = 1.0;
        let d = 1.0 - qab * xx / qap;
        if (Math.abs(d) < FPMIN) d = FPMIN;
        d = 1.0 / d;
        let h = d;
        for (let m = 1; m <= MAXIT; m++) {
            const m2 = 2 * m;
            let aa_val = m * (bb - m) * xx / ((qam + m2) * (aa + m2));
            d = 1.0 + aa_val * d;
            if (Math.abs(d) < FPMIN) d = FPMIN;
            c = 1.0 + aa_val / c;
            if (Math.abs(c) < FPMIN) c = FPMIN;
            d = 1.0 / d;
            h *= d * c;
            aa_val = -(aa + m) * (qab + m) * xx / ((aa + m2) * (qap + m2));
            d = 1.0 + aa_val * d;
            if (Math.abs(d) < FPMIN) d = FPMIN;
            c = 1.0 + aa_val / c;
            if (Math.abs(c) < FPMIN) c = FPMIN;
            d = 1.0 / d;
            const del = d * c;
            h *= del;
            if (Math.abs(del - 1.0) <= EPS) break;
        }
        return h;
    }

    let bt = 0.0;
    if (x > 0.0 && x < 1.0) {
        bt = Math.exp(gammln(a + b) - gammln(a) - gammln(b) + a * Math.log(x) + b * Math.log(1.0 - x));
    }
    
    let p = 0.0;
    if (x < (a + 1.0) / (a + b + 2.0)) {
        p = bt * betacf(x, a, b) / a;
    } else {
        p = 1.0 - bt * betacf(1.0 - x, b, a) / b;
    }
    
    return p;
}



/**
 * ダイアレル交配分析エンジン (Griffing Method 2 / Model I)
 * @param {Array<Array<number|null>>} matrixData - p x p の交配結果（親自殖およびF1片側交配）
 * @param {Array<string>} parentNames - 親系統名の文字列配列
 * @returns {Object} 解析結果 (parents, gcaEffects, scaEffects, heterosis, anova, bakerRatio)
 */
function computeDiallelAnalysis(matrixData, parentNames) {
    const p = parentNames.length;
    if (p < 3) {
        throw new Error("ダイアレル分析には少なくとも3つの親系統が必要です。");
    }

    // 対称性の自動補完
    const Y = [];
    for (let i = 0; i < p; i++) {
        Y[i] = [];
        for (let j = 0; j < p; j++) {
            let val = matrixData[i] && matrixData[i][j];
            if (val == null || isNaN(val)) {
                val = matrixData[j] && matrixData[j][i];
            }
            if (val == null || isNaN(val)) {
                val = 0;
            }
            Y[i][j] = Number(val);
        }
    }

    const N = p * (p + 1) / 2;

    // 親ごとの合計と全合計の計算
    const Y_i = new Array(p).fill(0);
    let Y_dotdot = 0;
    for (let i = 0; i < p; i++) {
        for (let j = 0; j < p; j++) {
            Y_i[i] += Y[i][j];
            if (i <= j) {
                Y_dotdot += Y[i][j];
            }
        }
    }

    // 総合平均
    const mu = (2 / (p * (p + 1))) * Y_dotdot;

    // GCA（一般組合せ能力＝相加的効果）
    const gcaEffects = new Array(p).fill(0);
    for (let i = 0; i < p; i++) {
        gcaEffects[i] = (1 / (p + 2)) * (Y_i[i] + Y[i][i] - (2 / p) * Y_dotdot);
    }

    // SCA（特定組合せ能力＝顕性効果・非相加的相互作用）
    const scaEffects = [];
    for (let i = 0; i < p; i++) {
        scaEffects[i] = [];
        for (let j = 0; j < p; j++) {
            if (i === j) {
                scaEffects[i][j] = Y[i][i] - mu - 2 * gcaEffects[i];
            } else {
                scaEffects[i][j] = Y[i][j] - mu - gcaEffects[i] - gcaEffects[j];
            }
        }
    }

    // 雑種強勢率（ヘテロシス）
    const heterosis = [];
    for (let i = 0; i < p; i++) {
        heterosis[i] = [];
        for (let j = 0; j < p; j++) {
            if (i === j) {
                heterosis[i][j] = { midParent: 0, highParent: 0 };
            } else {
                const midP = (Y[i][i] + Y[j][j]) / 2;
                const highP = Math.max(Y[i][i], Y[j][j]);
                const mph = midP === 0 ? 0 : ((Y[i][j] - midP) / midP) * 100;
                const hph = highP === 0 ? 0 : ((Y[i][j] - highP) / highP) * 100;
                heterosis[i][j] = { midParent: mph, highParent: hph };
            }
        }
    }

    // 分散分析 (ANOVA)
    const CF = Math.pow(Y_dotdot, 2) / N;
    let sumSqTotalRaw = 0;
    for (let i = 0; i < p; i++) {
        for (let j = i; j < p; j++) {
            sumSqTotalRaw += Math.pow(Y[i][j], 2);
        }
    }
    const SSTotal = sumSqTotalRaw - CF;
    const dfTotal = N - 1;

    let sumSqGcaRaw = 0;
    for (let i = 0; i < p; i++) {
        sumSqGcaRaw += Math.pow(Y_i[i] + Y[i][i], 2);
    }
    const SSGCA = (1 / (p + 2)) * (sumSqGcaRaw - (4 / p) * Math.pow(Y_dotdot, 2));
    const dfGCA = p - 1;

    const SSSCA = Math.max(0, SSTotal - SSGCA);
    const dfSCA = p * (p - 1) / 2;

    const MSGCA = dfGCA > 0 ? SSGCA / dfGCA : 0;
    const MSSCA = dfSCA > 0 ? SSSCA / dfSCA : 0;

    const F_GCA = MSSCA > 0 ? MSGCA / MSSCA : 0;
    
    const pValueGCA = MSSCA > 0 ? calculateFProbability(F_GCA, dfGCA, dfSCA) : 1.0;

    // Bakerの比率 (Baker 1978)
    const bakerRatio = (2 * MSGCA + MSSCA) === 0 ? 0 : (2 * MSGCA) / (2 * MSGCA + MSSCA);

    const anova = {
        SSTotal, dfTotal,
        SSGCA, dfGCA, MSGCA, F_GCA, pValueGCA,
        SSSCA, dfSCA, MSSCA
    };

    return {
        parents: parentNames,
        gcaEffects,
        scaEffects,
        heterosis,
        anova,
        bakerRatio
    };
}


// Node.js または ES Modules 環境での互換性を持たせるエクスポート設定
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        chainCodeToCoordinates,
        computeEFA,
        standardizeEFA,
        drawEFAShape,
        nipalsPCA,
        performClustering,
        exportToIntegrativeJSON,
        parseNewick,
        interpolateAncestralEFA,
        calculateEuclideanDistanceMatrix,
        calculateMantelCorrelation,
        calculateFProbability,
        computeDiallelAnalysis
    };
}


window.BioMath = window.BioMath || {};

// PCR: Wallace Rule (Tm Calculation)
window.BioMath.calculateTmWallace = function(seq) {
    if (!seq) return 0;
    let a = (seq.match(/A/g) || []).length;
    let t = (seq.match(/T/g) || []).length;
    let g = (seq.match(/G/g) || []).length;
    let c = (seq.match(/C/g) || []).length;
    if (seq.length < 14) return (a + t) * 2 + (g + c) * 4;
    else return 64.9 + 41 * (g + c - 16.4) / seq.length;
};

// PCR: Parse Temperature String
window.BioMath.parseTempStr = function(valStr) {
    if (!valStr || valStr === "∞") return 0;
    let val = parseFloat(valStr);
    if (val >= 100 && !valStr.includes('.')) return val / 10;
    return val;
};

// PCR: Parse Time String to Seconds
window.BioMath.parseTimeStr = function(timeStr) {
    if (!timeStr || timeStr === "∞") return Infinity;
    if (timeStr.includes(':')) {
        let parts = timeStr.split(':');
        return parseInt(parts[0] || 0) * 60 + parseInt(parts[1] || 0);
    } else {
        let str = timeStr.padStart(4, '0'); 
        return parseInt(str.substring(0, 2) || 0) * 60 + parseInt(str.substring(2, 4) || 0);
    }
};
