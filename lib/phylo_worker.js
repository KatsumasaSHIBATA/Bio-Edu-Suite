// lib/phylo_worker.js
// Maximum Parsimony (MP法), Maximum Likelihood (ML法) の全自動系統樹探索、および ブートストラップ処理 を行う Web Worker

self.onmessage = function(e) {
    if (e.data.type === 'CALC_MP') {
        const seqs = e.data.seqs;
        
        // リミッター: 計算爆発を防ぐため配列数は7個までに制限
        if (seqs.length > 7) {
            self.postMessage({ type: 'ERROR', message: '【計算リミッター】最大節約法(MP法)の全探索は、計算の爆発を防ぐため配列数7個までとしています。' });
            return;
        }
        if (seqs.length < 3) {
            self.postMessage({ type: 'ERROR', message: '最大節約法の計算には配列が3個以上必要です。' });
            return;
        }
        
        let seqLen = seqs[0].seq.length;
        let indices = seqs.map((_, i) => i);
        
        // 1. 全ての有根トポロジーを列挙する
        let topologies = generateTopologies(indices);
        
        let minScore = Infinity;
        let bestTree = null;
        
        // 2. Fitchのアルゴリズムで各トポロジーのスコアを評価し、最小スコアを探索
        for (let tree of topologies) {
            let score = calculateCost(tree, seqs, seqLen);
            if (score < minScore) {
                minScore = score;
                bestTree = tree;
            }
        }
        
        // 3. 最適な樹形に対して、枝ごとの変異数（ステップ数）を割り当て
        assignEdgeLengths(bestTree, seqs, seqLen);
        
        // 4. メインスレッドで描画できるフォーマット（既存のclusters形式）に変換
        let idCounter = { val: seqs.length }; 
        let rootNode = convertToMainFormat(bestTree, seqs, idCounter);
        rootNode.active = true;
        calculateMaxDepth(rootNode);
        
        // 結果の返却
        self.postMessage({ 
            type: 'SUCCESS', 
            tree: rootNode, 
            minScore: minScore, 
            treesEvaluated: topologies.length 
        });
    }

    if (e.data.type === 'CALC_ML') {
        const seqs = e.data.seqs;
        if (seqs.length > 7) {
            self.postMessage({ type: 'ERROR', message: '【計算リミッター】最尤法(ML法)の全探索は、計算の爆発を防ぐため配列数7個までとしています。' });
            return;
        }
        if (seqs.length < 3) {
            self.postMessage({ type: 'ERROR', message: '最尤法の計算には配列が3個以上必要です。' });
            return;
        }

        let seqLen = seqs[0].seq.length;
        let indices = seqs.map((_, i) => i);
        
        let topologies = generateTopologies(indices);
        
        let maxLogLikelihood = -Infinity;
        let bestTree = null;

        for (let tree of topologies) {
            // トポロジーごとに枝の長さを最適化
            let optimizedTree = optimizeBranchLengthsML(tree, seqs, seqLen);
            if (optimizedTree.logLikelihood > maxLogLikelihood) {
                maxLogLikelihood = optimizedTree.logLikelihood;
                bestTree = optimizedTree;
            }
        }
        
        let idCounter = { val: seqs.length }; 
        let rootNode = convertToMainFormatML(bestTree, seqs, idCounter);
        rootNode.active = true;
        calculateMaxDepthML(rootNode); 
        
        self.postMessage({ 
            type: 'SUCCESS', 
            tree: rootNode, 
            maxLogLikelihood: maxLogLikelihood, 
            treesEvaluated: topologies.length 
        });
    }

    if (e.data.type === 'CALC_BOOTSTRAP') {
        const seqs = e.data.seqs;
        const algo = e.data.algo;
        const iterations = e.data.iterations;
        let cladeCounts = {};
        
        let seqLen = seqs[0].seq.length;
        let indices = seqs.map((_, i) => i);
        let topologies = null;
        if (algo === 'MP' || algo === 'ML') {
            topologies = generateTopologies(indices);
        }

        for (let iter = 0; iter < iterations; iter++) {
            let resampledSeqs = seqs.map(s => ({ name: s.name, seq: '' }));
            let len = seqs[0].seq.length;
            
            // ブートストラップサンプリング (復元抽出)
            for (let k = 0; k < len; k++) {
                let randomCol = Math.floor(Math.random() * len);
                for (let i = 0; i < seqs.length; i++) {
                    resampledSeqs[i].seq += seqs[i].seq[randomCol];
                }
            }
            
            let clades = [];
            
            if (algo === 'MP') {
                let minScore = Infinity;
                let bestTree = null;
                for (let tree of topologies) {
                    let score = calculateCost(tree, resampledSeqs, len);
                    if (score < minScore) {
                        minScore = score;
                        bestTree = tree;
                    }
                }
                let idCounter = { val: resampledSeqs.length }; 
                let rootNode = convertToMainFormat(bestTree, resampledSeqs, idCounter);
                clades = extractCladesFromRoot(rootNode, resampledSeqs.length);
            } else if (algo === 'ML') {
                let maxLogLikelihood = -Infinity;
                let bestTree = null;
                for (let tree of topologies) {
                    let optimizedTree = optimizeBranchLengthsML(tree, resampledSeqs, len);
                    if (optimizedTree.logLikelihood > maxLogLikelihood) {
                        maxLogLikelihood = optimizedTree.logLikelihood;
                        bestTree = optimizedTree;
                    }
                }
                let idCounter = { val: resampledSeqs.length }; 
                let rootNode = convertToMainFormatML(bestTree, resampledSeqs, idCounter);
                clades = extractCladesFromRoot(rootNode, resampledSeqs.length);
            } else {
                // サイレントで系統樹を構築し、発生した分岐（clade）を取得
                clades = buildTreeSilentAndGetClades(resampledSeqs, algo);
            }
            
            clades.forEach(c => { cladeCounts[c] = (cladeCounts[c] || 0) + 1; });
            
            // メインスレッドへ進捗を報告 (1000回なら50回ごと、それ以外は10回ごと)
            let reportInterval = iterations >= 1000 ? 50 : (iterations >= 100 ? 10 : 1);
            if ((iter + 1) % reportInterval === 0 || (iter + 1) === iterations) {
                self.postMessage({ type: 'PROGRESS', completed: iter + 1, total: iterations });
            }
        }

        self.postMessage({ type: 'SUCCESS_BOOTSTRAP', cladeCounts: cladeCounts });
    }
};

/**
 * 葉のインデックス配列から、考えうる全ての有根系統樹（トポロジー）を生成する
 */
function generateTopologies(indices) {
    if (indices.length === 1) {
        return [{ type: 'leaf', index: indices[0] }];
    }
    if (indices.length === 2) {
        return [{ type: 'node', left: { type: 'leaf', index: indices[0] }, right: { type: 'leaf', index: indices[1] } }];
    }
    
    let prevTrees = generateTopologies(indices.slice(0, indices.length - 1));
    let newTrees = [];
    let newIndex = indices[indices.length - 1];
    
    for (let tree of prevTrees) {
        // 構築済みのツリーのすべての枝（エッジ）に新しい葉を挿入する
        let inserted = insertLeaf(tree, newIndex);
        newTrees.push(...inserted);
    }
    return newTrees;
}

function insertLeaf(node, leafIndex) {
    return insertLeafRecursive(node, leafIndex);
}

function insertLeafRecursive(node, leafIndex) {
    let results = [];
    
    // パターン1: このノードの直上に新しい内部ノードを作成し、そこに新しい葉を繋ぐ
    results.push({
        type: 'node',
        left: cloneTree(node),
        right: { type: 'leaf', index: leafIndex }
    });
    
    // パターン2: このノードが内部ノードの場合、その子孫のエッジに再帰的に挿入していく
    if (node.type === 'node') {
        let leftInserts = insertLeafRecursive(node.left, leafIndex);
        for (let lTree of leftInserts) {
            results.push({
                type: 'node',
                left: lTree,
                right: cloneTree(node.right)
            });
        }
        
        let rightInserts = insertLeafRecursive(node.right, leafIndex);
        for (let rTree of rightInserts) {
            results.push({
                type: 'node',
                left: cloneTree(node.left),
                right: rTree
            });
        }
    }
    
    return results;
}

function cloneTree(node) {
    if (node.type === 'leaf') return { type: 'leaf', index: node.index };
    return {
        type: 'node',
        left: cloneTree(node.left),
        right: cloneTree(node.right)
    };
}

/**
 * Fitchのアルゴリズムを用いて、指定されたトポロジーの総突然変異数（コスト）を計算する
 */
function calculateCost(tree, seqs, seqLen) {
    let totalCost = 0;
    for (let i = 0; i < seqLen; i++) {
        let { cost } = fitchSite(tree, seqs, i);
        totalCost += cost;
    }
    return totalCost;
}

function fitchSite(node, seqs, siteIndex) {
    if (node.type === 'leaf') {
        let base = seqs[node.index].seq[siteIndex];
        // ギャップや不明な塩基はすべての状態として扱う（コストゼロとしてパスする）
        if (base === '-' || base === 'N' || base === '?') {
            return { state: new Set(['A', 'T', 'G', 'C']), cost: 0 };
        }
        return { state: new Set([base]), cost: 0 };
    }
    
    let leftRes = fitchSite(node.left, seqs, siteIndex);
    let rightRes = fitchSite(node.right, seqs, siteIndex);
    
    // 積集合 (Intersection) を取る
    let intersection = new Set([...leftRes.state].filter(x => rightRes.state.has(x)));
    
    if (intersection.size > 0) {
        // 共通の状態があればコスト加算なし
        return { state: intersection, cost: leftRes.cost + rightRes.cost };
    } else {
        // 共通の状態がなければ和集合 (Union) を取り、コストを +1 する
        let union = new Set([...leftRes.state, ...rightRes.state]);
        return { state: union, cost: leftRes.cost + rightRes.cost + 1 };
    }
}

/**
 * 最適な樹形に対して、各枝で発生した突然変異数（ステップ数）を祖先状態の再構築から割り当てる
 */
function assignEdgeLengths(tree, seqs, seqLen) {
    initEdgeLengths(tree);
    for (let i = 0; i < seqLen; i++) {
        // パス1: ボトムアップで状態集合を構築
        bottomUpFitch(tree, seqs, i);
        // パス2: トップダウンで祖先状態を確定し、変化があった枝にカウントを加算
        let rootState = Array.from(tree.tempState)[0];
        topDownFitch(tree, rootState);
    }
}

function initEdgeLengths(node) {
    node.edge = 0;
    if (node.type === 'node') {
        initEdgeLengths(node.left);
        initEdgeLengths(node.right);
    }
}

function bottomUpFitch(node, seqs, siteIndex) {
    if (node.type === 'leaf') {
        let base = seqs[node.index].seq[siteIndex];
        if (base === '-' || base === 'N' || base === '?') {
            node.tempState = new Set(['A', 'T', 'G', 'C']);
        } else {
            node.tempState = new Set([base]);
        }
        return;
    }
    
    bottomUpFitch(node.left, seqs, siteIndex);
    bottomUpFitch(node.right, seqs, siteIndex);
    
    let intersection = new Set([...node.left.tempState].filter(x => node.right.tempState.has(x)));
    if (intersection.size > 0) {
        node.tempState = intersection;
    } else {
        node.tempState = new Set([...node.left.tempState, ...node.right.tempState]);
    }
}

function topDownFitch(node, parentState) {
    let myState = parentState;
    // 自身の状態集合に親の状態が含まれていなければ突然変異が発生したとみなし、エッジを加算
    if (!node.tempState.has(parentState)) {
        node.edge += 1;
        myState = Array.from(node.tempState)[0]; // 任意の1つを選択
    }
    
    if (node.type === 'node') {
        topDownFitch(node.left, myState);
        topDownFitch(node.right, myState);
    }
}

/**
 * メインスレッド（D3.js / Canvas 描画ロジック）で扱えるデータ構造へ変換する (MP用)
 */
function convertToMainFormat(node, seqs, idCounter) {
    let result = {
        id: idCounter.val++,
        edge: node.edge || 0,
        active: false // 後でメインスレッド側でルートのみ true にする
    };
    
    if (node.type === 'leaf') {
        result.name = seqs[node.index].name;
        result.size = 1;
        result.minLeafIndex = node.index;
        result.left = null;
        result.right = null;
    } else {
        result.left = convertToMainFormat(node.left, seqs, idCounter);
        result.right = convertToMainFormat(node.right, seqs, idCounter);
        result.name = ""; // 内部ノードは名前を持たない
        result.size = result.left.size + result.right.size;
        result.minLeafIndex = Math.min(result.left.minLeafIndex, result.right.minLeafIndex);
    }
    return result;
}

/**
 * 描画用の maxDepth (ルートから葉までの最大長) を計算する (MP用)
 */
function calculateMaxDepth(node) {
    if (!node.left && !node.right) {
        node.maxDepth = 0;
        return 0;
    }
    let dL = calculateMaxDepth(node.left) + (node.left.edge || 0);
    let dR = calculateMaxDepth(node.right) + (node.right.edge || 0);
    node.maxDepth = Math.max(dL, dR);
    return node.maxDepth;
}

// JC69の遷移確率行列 P(t) = 1/4 + 3/4 * exp(-4/3 * t) for same base
// P(t) = 1/4 - 1/4 * exp(-4/3 * t) for different base

function optimizeBranchLengthsML(tree, seqs, seqLen) {
    // 簡易的な山登り法
    let clonedTree = cloneTreeWithEdge(tree, 0.1); 
    
    let improved = true;
    let maxIter = 10;
    let iter = 0;
    
    // ヒューリスティックに全体を最適化
    while(improved && iter < maxIter) {
        improved = false;
        iter++;
        
        // 全エッジに対して微小変化を試す
        let edges = getAllEdges(clonedTree);
        for (let edgeNode of edges) {
            let currentLikelihood = calculateLikelihood(clonedTree, seqs, seqLen);
            let bestLen = edgeNode.edge;
            let bestLikelihood = currentLikelihood;
            
            // 0.01 から 0.6 のステップで探索
            for (let testLen = 0.01; testLen <= 0.6; testLen += 0.05) {
                if (Math.abs(testLen - edgeNode.edge) < 0.001) continue;
                edgeNode.edge = testLen;
                let testLikelihood = calculateLikelihood(clonedTree, seqs, seqLen);
                if (testLikelihood > bestLikelihood) {
                    bestLikelihood = testLikelihood;
                    bestLen = testLen;
                    improved = true;
                }
            }
            edgeNode.edge = bestLen; // 最適な枝長をセット
        }
    }
    
    clonedTree.logLikelihood = calculateLikelihood(clonedTree, seqs, seqLen);
    return clonedTree;
}

function cloneTreeWithEdge(node, initEdge) {
    if (node.type === 'leaf') {
        return { type: 'leaf', index: node.index, edge: initEdge };
    }
    return {
        type: 'node',
        left: cloneTreeWithEdge(node.left, initEdge),
        right: cloneTreeWithEdge(node.right, initEdge),
        edge: initEdge
    };
}

function getAllEdges(node, edges = []) {
    if (node.type === 'node') {
        edges.push(node.left);
        edges.push(node.right);
        getAllEdges(node.left, edges);
        getAllEdges(node.right, edges);
    }
    return edges;
}

function calculateLikelihood(tree, seqs, seqLen) {
    // 対数尤度の和
    let totalLogLikelihood = 0;
    const bases = ['A', 'C', 'G', 'T'];
    
    for (let i = 0; i < seqLen; i++) {
        let siteLikelihood = felsenstein(tree, seqs, i, bases);
        // siteLikelihood が 0 になるのを防ぐ
        if (siteLikelihood < 1e-300) siteLikelihood = 1e-300;
        totalLogLikelihood += Math.log(siteLikelihood);
    }
    return totalLogLikelihood;
}

function felsenstein(node, seqs, siteIndex, bases) {
    // ボトムアップで計算
    let L = calculateNodeLikelihood(node, seqs, siteIndex, bases);
    
    // ルートでの各塩基の事前確率は 1/4 (JC69)
    let siteProb = 0;
    for (let i = 0; i < bases.length; i++) {
        siteProb += 0.25 * L[bases[i]];
    }
    return siteProb;
}

function getJC69Prob(t, isSame) {
    let pSame = 0.25 + 0.75 * Math.exp(-4.0 / 3.0 * t);
    let pDiff = 0.25 - 0.25 * Math.exp(-4.0 / 3.0 * t);
    return isSame ? pSame : pDiff;
}

function calculateNodeLikelihood(node, seqs, siteIndex, bases) {
    let L = {};
    if (node.type === 'leaf') {
        let base = seqs[node.index].seq[siteIndex];
        for (let b of bases) {
            // ギャップや不明文字は1.0とする（情報を持たない）
            if (base === '-' || base === 'N' || base === '?') {
                L[b] = 1.0;
            } else {
                L[b] = (b === base) ? 1.0 : 0.0;
            }
        }
        return L;
    }
    
    let L_left = calculateNodeLikelihood(node.left, seqs, siteIndex, bases);
    let L_right = calculateNodeLikelihood(node.right, seqs, siteIndex, bases);
    
    for (let baseParent of bases) {
        let sumLeft = 0;
        for (let baseChild of bases) {
            let prob = getJC69Prob(node.left.edge, baseParent === baseChild);
            sumLeft += prob * L_left[baseChild];
        }
        
        let sumRight = 0;
        for (let baseChild of bases) {
            let prob = getJC69Prob(node.right.edge, baseParent === baseChild);
            sumRight += prob * L_right[baseChild];
        }
        
        L[baseParent] = sumLeft * sumRight;
    }
    return L;
}

function convertToMainFormatML(node, seqs, idCounter) {
    let result = {
        id: idCounter.val++,
        edge: node.edge || 0,
        active: false 
    };
    
    if (node.type === 'leaf') {
        result.name = seqs[node.index].name;
        result.size = 1;
        result.minLeafIndex = node.index;
        result.left = null;
        result.right = null;
    } else {
        result.left = convertToMainFormatML(node.left, seqs, idCounter);
        result.right = convertToMainFormatML(node.right, seqs, idCounter);
        result.name = ""; 
        result.size = result.left.size + result.right.size;
        result.minLeafIndex = Math.min(result.left.minLeafIndex, result.right.minLeafIndex);
    }
    return result;
}

function calculateMaxDepthML(node) {
    if (!node.left && !node.right) {
        node.maxDepth = 0;
        return 0;
    }
    let dL = calculateMaxDepthML(node.left) + (node.left.edge || 0);
    let dR = calculateMaxDepthML(node.right) + (node.right.edge || 0);
    node.maxDepth = Math.max(dL, dR);
    return node.maxDepth;
}

/**
 * 構築された系統樹のルートから、発生した分岐（clade）を抽出する (MP / ML用)
 */
function extractCladesFromRoot(node, totalLeaves) {
    let clades = [];
    function traverse(n) {
        if (!n) return [];
        if (!n.left && !n.right) return [n.name];
        
        let leftLeaves = traverse(n.left);
        let rightLeaves = traverse(n.right);
        let allLeaves = leftLeaves.concat(rightLeaves).sort();
        
        if (allLeaves.length > 1 && allLeaves.length < totalLeaves) {
            clades.push(allLeaves.join(','));
        }
        return allLeaves;
    }
    traverse(node);
    return clades;
}

/**
 * ブートストラップ評価用のサイレント系統樹構築関数 (UPGMA/NJ対応)
 */
function buildTreeSilentAndGetClades(seqs, algo) {
    let n = seqs.length;
    let localClusters = seqs.map((s, i) => ({ id: i, active: true, leaves: [s.name], size: 1 }));
    let dist = Array(n).fill(0).map(() => Array(n).fill(0));
    let len = seqs[0].seq.length;
    
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            let m = 0, v = 0;
            for (let k = 0; k < len; k++) {
                if (seqs[i].seq[k] !== '-' && seqs[j].seq[k] !== '-') { 
                    v++; 
                    if (seqs[i].seq[k] !== seqs[j].seq[k]) m++; 
                }
            }
            dist[i][j] = dist[j][i] = v > 0 ? (m / v) * 100 : 0;
        }
    }
    
    let activeCount = n;
    while (activeCount > 1) {
        let minVal = Infinity, minI = -1, minJ = -1;
        let q = null, r = null;
        
        if (algo === "NJ" && activeCount > 2) {
            r = Array(localClusters.length).fill(0);
            for (let i = 0; i < localClusters.length; i++) {
                if (!localClusters[i].active) continue;
                for (let j = 0; j < localClusters.length; j++) {
                    if (!localClusters[j].active) continue;
                    r[i] += dist[i][j];
                }
            }
            q = Array(localClusters.length).fill(0).map(() => Array(localClusters.length).fill(0));
            for (let i = 0; i < localClusters.length; i++) {
                if (!localClusters[i].active) continue;
                for (let j = i + 1; j < localClusters.length; j++) {
                    if (!localClusters[j].active) continue;
                    q[i][j] = q[j][i] = (activeCount - 2) * dist[i][j] - r[i] - r[j];
                }
            }
        }
        
        for (let i = 0; i < localClusters.length; i++) {
            if (!localClusters[i].active) continue;
            for (let j = i + 1; j < localClusters.length; j++) {
                if (!localClusters[j].active) continue;
                let val = (algo === "NJ" && activeCount > 2) ? q[i][j] : dist[i][j];
                if (val < minVal) { minVal = val; minI = i; minJ = j; }
            }
        }
        
        let c1 = localClusters[minI], c2 = localClusters[minJ];
        let newNode = { active: true, size: c1.size + c2.size, leaves: c1.leaves.concat(c2.leaves).sort() };
        let newDistRow = [];
        
        for (let k = 0; k < localClusters.length; k++) {
            let d = 0;
            if (k !== minI && k !== minJ) {
                d = algo === "UPGMA" ? (dist[minI][k] * c1.size + dist[minJ][k] * c2.size) / newNode.size 
                : (dist[minI][k] + dist[minJ][k] - dist[minI][minJ]) / 2;
            }
            newDistRow.push(d);
            dist[k].push(d);
        }
        newDistRow.push(0);
        dist.push(newDistRow);
        c1.active = false; c2.active = false;
        localClusters.push(newNode);
        activeCount--;
    }
    
    let clades = [];
    localClusters.forEach(c => {
        if (c.leaves && c.leaves.length > 1 && c.leaves.length < n) {
            clades.push(c.leaves.join(','));
        }
    });
    return clades;
}
