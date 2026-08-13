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
        interpolateAncestralEFA
    };
}
