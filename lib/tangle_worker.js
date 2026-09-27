/**
 * lib/tangle_worker.js
 * タングルグラム（もつれ系統樹）交差数最小化 Web Worker (Simulated Annealing)
 * 
 * 基準となる分子系統樹 (molTree) に対し、形態系統樹 (morphTree) の内部ノードを
 * 焼きなまし法（Simulated Annealing）によって回転・スワップし、交差数を最小化する。
 */

function normalizeName(name) {
    if (typeof name !== 'string') return '';
    return name.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

function getLeafNames(node) {
    const leaves = [];
    function traverse(n) {
        if (!n) return;
        if (!n.children || n.children.length === 0) {
            const name = n.name || (n.data && n.data.name) || '';
            leaves.push(name);
        } else {
            for (let i = 0; i < n.children.length; i++) {
                traverse(n.children[i]);
            }
        }
    }
    traverse(node);
    return leaves;
}

function getInternalNodes(node) {
    const internals = [];
    let idCounter = 0;
    function traverse(n) {
        if (!n) return;
        if (n.children && n.children.length >= 2) {
            if (n._internalId === undefined) {
                n._internalId = idCounter++;
            }
            internals.push(n);
            for (let i = 0; i < n.children.length; i++) {
                traverse(n.children[i]);
            }
        }
    }
    traverse(node);
    return internals;
}

function countInversions(arr) {
    let inv = 0;
    const len = arr.length;
    for (let i = 0; i < len; i++) {
        const valI = arr[i];
        for (let j = i + 1; j < len; j++) {
            if (valI > arr[j]) {
                inv++;
            }
        }
    }
    return inv;
}

function calculateCrossings(morphTree, morphToMolIndex) {
    const morphLeaves = getLeafNames(morphTree);
    const indices = [];
    for (let i = 0; i < morphLeaves.length; i++) {
        const name = morphLeaves[i];
        const norm = normalizeName(name);
        if (morphToMolIndex.has(norm)) {
            indices.push(morphToMolIndex.get(norm));
        }
    }
    return countInversions(indices);
}

function captureState(internals) {
    const state = {};
    for (let i = 0; i < internals.length; i++) {
        const node = internals[i];
        state[node._internalId] = node.children.slice();
    }
    return state;
}

function applyState(internals, state) {
    for (let i = 0; i < internals.length; i++) {
        const node = internals[i];
        if (state[node._internalId]) {
            node.children = state[node._internalId].slice();
        }
    }
}

function mutateRandomNode(internals) {
    if (internals.length === 0) return null;
    const randIdx = Math.floor(Math.random() * internals.length);
    const node = internals[randIdx];
    if (node.children.length === 2) {
        const tmp = node.children[0];
        node.children[0] = node.children[1];
        node.children[1] = tmp;
        return { node, i: 0, j: 1 };
    } else {
        const i = Math.floor(Math.random() * node.children.length);
        let j = Math.floor(Math.random() * (node.children.length - 1));
        if (j >= i) j++;
        const tmp = node.children[i];
        node.children[i] = node.children[j];
        node.children[j] = tmp;
        return { node, i, j };
    }
}

function revertMutation(mutation) {
    if (!mutation) return;
    const { node, i, j } = mutation;
    const tmp = node.children[i];
    node.children[i] = node.children[j];
    node.children[j] = tmp;
}

function optimizeTanglegram(molTree, morphTree, pairMappings = [], options = {}) {
    const iterations = options.iterations || 8000;
    const initialTemp = options.initialTemp || 10.0;
    const coolingRate = options.coolingRate || 0.995;
    const progressCallback = options.onProgress || null;

    // 1. 分子系統樹の葉順序をインデックスマップ化
    const molLeaves = getLeafNames(molTree);
    const molOrderMap = new Map();
    for (let i = 0; i < molLeaves.length; i++) {
        molOrderMap.set(normalizeName(molLeaves[i]), i);
    }

    // 2. 形態系統樹の葉から分子系統樹のインデックスへのマッピング構築
    const morphToMolIndex = new Map();
    const explicitPairMap = new Map();

    if (Array.isArray(pairMappings)) {
        for (const pair of pairMappings) {
            if (pair && pair.mol && pair.morph) {
                explicitPairMap.set(normalizeName(pair.morph), normalizeName(pair.mol));
            }
        }
    }

    const morphLeaves = getLeafNames(morphTree);
    for (const mLeaf of morphLeaves) {
        const normM = normalizeName(mLeaf);
        let targetMol = explicitPairMap.has(normM) ? explicitPairMap.get(normM) : normM;
        if (molOrderMap.has(targetMol)) {
            morphToMolIndex.set(normM, molOrderMap.get(targetMol));
        }
    }

    // 3. 内部ノードの収集
    const internals = getInternalNodes(morphTree);
    if (internals.length === 0) {
        const initialScore = calculateCrossings(morphTree, morphToMolIndex);
        return {
            morphTree,
            initialCrossings: initialScore,
            bestCrossings: initialScore,
            iterationsExecuted: 0
        };
    }

    // 4. 初期交差数計算と最適状態の初期化
    let currentCrossings = calculateCrossings(morphTree, morphToMolIndex);
    let bestCrossings = currentCrossings;
    let bestState = captureState(internals);
    const initialCrossings = currentCrossings;

    if (initialCrossings === 0) {
        return {
            morphTree,
            initialCrossings: 0,
            bestCrossings: 0,
            iterationsExecuted: 0
        };
    }

    let temp = initialTemp;
    const reportInterval = Math.max(1, Math.floor(iterations / 50));

    // 5. Simulated Annealing 反復ループ
    let i = 0;
    for (i = 0; i < iterations; i++) {
        const mutation = mutateRandomNode(internals);
        const newCrossings = calculateCrossings(morphTree, morphToMolIndex);
        const delta = newCrossings - currentCrossings;

        let accept = false;
        if (delta <= 0) {
            accept = true;
        } else {
            const probability = Math.exp(-delta / temp);
            if (probability > Math.random()) {
                accept = true;
            }
        }

        if (accept) {
            currentCrossings = newCrossings;
            if (currentCrossings < bestCrossings) {
                bestCrossings = currentCrossings;
                bestState = captureState(internals);
                if (bestCrossings === 0) {
                    i++;
                    break;
                }
            }
        } else {
            revertMutation(mutation);
        }

        temp *= coolingRate;

        if (progressCallback && (i % reportInterval === 0 || i === iterations - 1)) {
            progressCallback({
                progress: Math.min(1.0, (i + 1) / iterations),
                iteration: i + 1,
                currentCrossings,
                bestCrossings,
                temperature: temp
            });
        }
    }

    // 6. 最適状態を morphTree に復元
    applyState(internals, bestState);

    return {
        morphTree,
        initialCrossings,
        bestCrossings,
        iterationsExecuted: i
    };
}

// ============================================================
// Web Worker メッセージハンドラ
// ============================================================
if (typeof self !== 'undefined' && typeof self.postMessage === 'function') {
    self.onmessage = function(e) {
        const data = e.data;
        if (!data) return;

        if (data.type === 'OPTIMIZE') {
            try {
                const { molRoot, morphRoot, pairMappings, options } = data;

                const result = optimizeTanglegram(molRoot, morphRoot, pairMappings, {
                    ...(options || {}),
                    onProgress: (prog) => {
                        self.postMessage({
                            type: 'PROGRESS',
                            ...prog
                        });
                    }
                });

                self.postMessage({
                    type: 'SUCCESS',
                    morphTree: result.morphTree,
                    initialCrossings: result.initialCrossings,
                    bestCrossings: result.bestCrossings,
                    iterationsExecuted: result.iterationsExecuted
                });
            } catch (err) {
                self.postMessage({
                    type: 'ERROR',
                    message: err.message || String(err)
                });
            }
        }
    };
}

// Node.js / CommonJS エクスポート対応
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        optimizeTanglegram,
        normalizeName,
        getLeafNames,
        getInternalNodes,
        countInversions,
        calculateCrossings,
        captureState,
        applyState
    };
}

