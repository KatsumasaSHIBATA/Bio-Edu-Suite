/**
 * lib/tangle_worker.js
 * タングルグラム（もつれ系統樹）交差数最小化 Web Worker (Simulated Annealing)
 * 
 * 基準となる分子系統樹 (molTree) に対し、形態系統樹 (morphTree) の内部ノードを
 * 焼きなまし法（Simulated Annealing）によって回転・スワップし、交差数を最小化する。
 */

function normalizeName(name) {
    if (name == null) return '';
    return String(name).trim().toLowerCase().replace(/[\s_-]+/g, '');
}

function getShortLabel(name) {
    if (!name) return "";
    return String(name).replace(/^\d{8}_\d{6}_/, '').replace(/^\d{8}\d{6}_?/, '');
}

function isIdOrNameMatched(nameA, nameB) {
    if (!nameA || !nameB) return false;
    const normA = normalizeName(nameA);
    const normB = normalizeName(nameB);
    if (normA === normB) return true;
    
    // 8桁日付+6桁時刻のID部分（例: 20260920153043, 20260920_153043）を抽出して突合
    const idA = normA.match(/\d{8}\d{6}/);
    const idB = normB.match(/\d{8}\d{6}/);
    if (idA && idB && idA[0] === idB[0]) return true;

    // 生物名（shortLabel）部分を抽出して突合
    const shortA = normalizeName(getShortLabel(nameA));
    const shortB = normalizeName(getShortLabel(nameB));
    if (shortA && shortB && shortA === shortB) return true;

    // 前方一致・内包判定 (ヒト[自分の腕] などの部分一致)
    if (normA.length > 3 && normB.length > 3) {
        if (normA.includes(normB) || normB.includes(normA)) return true;
    }
    if (shortA.length > 2 && shortB.length > 2) {
        if (shortA.includes(shortB) || shortB.includes(shortA)) return true;
    }
    return false;
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

function getInternalNodes(node, prefix = 'in') {
    const internals = [];
    let idCounter = 0;
    function traverse(n) {
        if (!n) return;
        if (n.children && n.children.length >= 2) {
            if (n._internalId === undefined) {
                n._internalId = `${prefix}_${idCounter++}`;
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

function buildPairs(molLeaves, morphLeaves, pairMappings = []) {
    const pairs = [];
    if (Array.isArray(pairMappings) && pairMappings.length > 0) {
        pairMappings.forEach((mapping) => {
            const leftTarget = mapping.left || mapping.mol;
            const rightTarget = mapping.right || mapping.morph;
            const molIdx = molLeaves.findIndex(m => m && isIdOrNameMatched(m, leftTarget));
            const morphIdx = morphLeaves.findIndex(m => m && isIdOrNameMatched(m, rightTarget));
            if (molIdx !== -1 && morphIdx !== -1) {
                pairs.push({ molIdx, morphIdx });
            }
        });
    } else {
        molLeaves.forEach((molLeaf, molIdx) => {
            if (!molLeaf) return;
            const morphIdx = morphLeaves.findIndex(morphLeaf => morphLeaf && isIdOrNameMatched(molLeaf, morphLeaf));
            if (morphIdx !== -1) {
                pairs.push({ molIdx, morphIdx });
            }
        });
    }
    return pairs;
}

function calculateTotalCrossings(molLeaves, morphLeaves, pairMappings = []) {
    const pairs = buildPairs(molLeaves, morphLeaves, pairMappings);
    let crossings = 0;
    const len = pairs.length;
    for (let i = 0; i < len; i++) {
        const p1 = pairs[i];
        for (let j = i + 1; j < len; j++) {
            const p2 = pairs[j];
            if ((p1.molIdx - p2.molIdx) * (p1.morphIdx - p2.morphIdx) < 0) {
                crossings++;
            }
        }
    }
    return crossings;
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
    const iterations = options.iterations || 10000;
    const initialTemp = options.initialTemp || 10.0;
    const coolingRate = options.coolingRate || 0.995;
    const progressCallback = options.onProgress || null;

    // 内部ノードの収集（分子系統樹と形態系統樹の両方）
    const molInternals = getInternalNodes(molTree, 'mol');
    const morphInternals = getInternalNodes(morphTree, 'morph');
    const allInternals = [...molInternals, ...morphInternals];

    let initialMolLeaves = getLeafNames(molTree);
    let initialMorphLeaves = getLeafNames(morphTree);
    const initialCrossings = calculateTotalCrossings(initialMolLeaves, initialMorphLeaves, pairMappings);

    if (allInternals.length === 0 || initialCrossings === 0) {
        return {
            molTree,
            morphTree,
            initialCrossings,
            bestCrossings: initialCrossings,
            iterationsExecuted: 0
        };
    }

    let currentCrossings = initialCrossings;
    let bestCrossings = currentCrossings;
    let bestState = captureState(allInternals);

    let temp = initialTemp;
    const reportInterval = Math.max(1, Math.floor(iterations / 50));

    // Two-Sided Simulated Annealing 反復ループ
    let i = 0;
    for (i = 0; i < iterations; i++) {
        const mutation = mutateRandomNode(allInternals);
        const curMolLeaves = getLeafNames(molTree);
        const curMorphLeaves = getLeafNames(morphTree);
        const newCrossings = calculateTotalCrossings(curMolLeaves, curMorphLeaves, pairMappings);
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
                bestState = captureState(allInternals);
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

    // 最適状態を molTree / morphTree に復元
    applyState(allInternals, bestState);

    return {
        molTree,
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
                    molTree: result.molTree,
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
        getShortLabel,
        isIdOrNameMatched,
        getLeafNames,
        getInternalNodes,
        buildPairs,
        calculateTotalCrossings,
        countInversions,
        calculateCrossings,
        captureState,
        applyState
    };
}

