/**
 * scripts/test_tangle_sa.js
 * タングルグラム最適化Worker（Simulated Annealing）単体テスト & 動作確認スクリプト
 */

const assert = require('assert');
const path = require('path');
const {
    optimizeTanglegram,
    countInversions,
    calculateCrossings,
    getLeafNames,
    normalizeName
} = require('../lib/tangle_worker.js');

/**
 * 簡易 Newick パーサー (10_integrative_taxonomy_studio.html 準拠)
 */
function parseNewickString(s) {
    if (!s || typeof s !== 'string') return { name: "root" };
    let str = s.trim();
    if (str.endsWith(';')) str = str.slice(0, -1).trim();

    const openCount = (str.match(/\(/g) || []).length;
    const closeCount = (str.match(/\)/g) || []).length;
    if (openCount < closeCount) {
        str = '('.repeat(closeCount - openCount) + str;
    } else if (openCount > closeCount) {
        str = str + ')'.repeat(openCount - closeCount);
    }

    let ancestors = [];
    let tree = {};
    let tokens = str.split(/\s*(;|\(|\)|,|:)\s*/);

    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        if (!token) continue;

        switch (token) {
            case '(': {
                let subtree = {};
                if (!tree.children) tree.children = [];
                tree.children.push(subtree);
                ancestors.push(tree);
                tree = subtree;
                break;
            }
            case ',': {
                let parent = ancestors[ancestors.length - 1];
                if (!parent) {
                    parent = { children: [tree] };
                    ancestors.push(parent);
                }
                let subtree2 = {};
                parent.children.push(subtree2);
                tree = subtree2;
                break;
            }
            case ')': {
                if (ancestors.length > 0) {
                    tree = ancestors.pop();
                }
                break;
            }
            case ':':
                break;
            default: {
                let prevToken = tokens[i - 1];
                if (prevToken === ':') {
                    tree.length = parseFloat(token);
                } else if (token !== ';') {
                    tree.name = token;
                }
                break;
            }
        }
    }

    while (ancestors.length > 0) {
        tree = ancestors.pop();
    }

    while (tree.children && tree.children.length === 1 && !tree.name) {
        tree = tree.children[0];
    }

    return tree;
}

// ------------------------------------------------------------
// Test 1: 転倒数計算（countInversions）の検証
// ------------------------------------------------------------
console.log('--- Test 1: Inversion Count Verification ---');
assert.strictEqual(countInversions([0, 1, 2, 3]), 0, 'Sorted array should have 0 inversions');
assert.strictEqual(countInversions([3, 2, 1, 0]), 6, 'Reversed array of 4 should have 6 inversions');
assert.strictEqual(countInversions([1, 0, 3, 2]), 2, '[1,0,3,2] should have 2 inversions');
console.log('✔ Inversion count logic passed.\n');

// ------------------------------------------------------------
// Test 2: 基本的なもつれ解消 (4分類群)
// ------------------------------------------------------------
console.log('--- Test 2: Basic 4-Taxa Tanglegram Optimization ---');
const molTree1 = parseNewickString('((TaxonA,TaxonB),(TaxonC,TaxonD));');
const morphTree1 = parseNewickString('((TaxonD,TaxonC),(TaxonB,TaxonA));');

console.log('Mol Tree Leaves   :', getLeafNames(molTree1).join(', '));
console.log('Morph Tree Leaves :', getLeafNames(morphTree1).join(', '));

const res1 = optimizeTanglegram(molTree1, morphTree1, [], {
    iterations: 2000,
    initialTemp: 5.0,
    coolingRate: 0.99
});

console.log(`Initial Crossings : ${res1.initialCrossings}`);
console.log(`Optimized Crossings: ${res1.bestCrossings} (Iterations: ${res1.iterationsExecuted})`);
console.log('Optimized Leaves  :', getLeafNames(res1.morphTree).join(', '));

assert.strictEqual(res1.initialCrossings > 0, true, 'Initial crossings should be > 0');
assert.strictEqual(res1.bestCrossings, 0, 'Optimized crossings should converge to 0');
console.log('✔ 4-Taxa test passed.\n');

// ------------------------------------------------------------
// Test 3: 多重階層もつれ (8分類群・局所最適に陥りやすい複雑構造)
// ------------------------------------------------------------
console.log('--- Test 3: Deep Multi-level 8-Taxa Tanglegram Optimization ---');
const molNewick8 = '(((SpA,SpB),(SpC,SpD)),((SpE,SpF),(SpG,SpH)));';
const morphNewick8 = '(((SpH,SpG),(SpE,SpF)),((SpD,SpC),(SpB,SpA)));';

const molTree8 = parseNewickString(molNewick8);
const morphTree8 = parseNewickString(morphNewick8);

console.log('Mol 8 Leaves    :', getLeafNames(molTree8).join(', '));
console.log('Morph 8 Initial :', getLeafNames(morphTree8).join(', '));

let progressReports = 0;
const res8 = optimizeTanglegram(molTree8, morphTree8, [], {
    iterations: 8000,
    initialTemp: 10.0,
    coolingRate: 0.995,
    onProgress: (p) => {
        progressReports++;
    }
});

console.log(`Initial Crossings : ${res8.initialCrossings}`);
console.log(`Optimized Crossings: ${res8.bestCrossings} (Iterations: ${res8.iterationsExecuted})`);
console.log('Morph 8 Optimized :', getLeafNames(res8.morphTree).join(', '));
console.log(`Progress callback calls: ${progressReports}`);

assert.strictEqual(res8.initialCrossings > 10, true, 'Initial crossings should be high');
assert.strictEqual(res8.bestCrossings, 0, 'Complex multi-level tree must converge to 0 crossings');
console.log('✔ 8-Taxa multi-level test passed.\n');

// ------------------------------------------------------------
// Test 4: 非対称なペアマッピング (名前が異なる場合)
// ------------------------------------------------------------
console.log('--- Test 4: Explicit Pair Mappings ---');
const molTreePair = parseNewickString('((Mol_1,Mol_2),(Mol_3,Mol_4));');
const morphTreePair = parseNewickString('((Morph_D,Morph_C),(Morph_B,Morph_A));');
const pairMappings = [
    { mol: 'Mol_1', morph: 'Morph_A' },
    { mol: 'Mol_2', morph: 'Morph_B' },
    { mol: 'Mol_3', morph: 'Morph_C' },
    { mol: 'Mol_4', morph: 'Morph_D' }
];

const resPair = optimizeTanglegram(molTreePair, morphTreePair, pairMappings, {
    iterations: 3000
});

console.log(`Initial Crossings with Mapping : ${resPair.initialCrossings}`);
console.log(`Optimized Crossings            : ${resPair.bestCrossings}`);
console.log('Optimized Leaves               :', getLeafNames(resPair.morphTree).join(', '));

assert.strictEqual(resPair.bestCrossings, 0, 'Pair mapping tanglegram must converge to 0');
console.log('✔ Pair mappings test passed.\n');

// ------------------------------------------------------------
// Test 5: Worker メッセージングのモック動作検証
// ------------------------------------------------------------
console.log('--- Test 5: Web Worker Message Protocol Mock ---');

let workerMessageResult = null;
let workerProgressCount = 0;

global.self = {
    postMessage: function(msg) {
        if (msg.type === 'PROGRESS') {
            workerProgressCount++;
        } else if (msg.type === 'SUCCESS') {
            workerMessageResult = msg;
        }
    }
};

delete require.cache[require.resolve('../lib/tangle_worker.js')];
require('../lib/tangle_worker.js');

global.self.onmessage({
    data: {
        type: 'OPTIMIZE',
        molRoot: parseNewickString('((A,B),(C,D));'),
        morphRoot: parseNewickString('((D,C),(B,A));'),
        pairMappings: [],
        options: { iterations: 1000 }
    }
});

assert.ok(workerMessageResult, 'Worker should have posted a SUCCESS message');
assert.strictEqual(workerMessageResult.type, 'SUCCESS');
assert.strictEqual(workerMessageResult.bestCrossings, 0);
console.log(`Worker Success Result Crossings: ${workerMessageResult.bestCrossings}`);
console.log(`Worker Progress Messages Received: ${workerProgressCount}`);
console.log('✔ Web Worker mock test passed.\n');

console.log('====================================================');
console.log('  All Tanglegram SA Worker Tests PASSED Successfully!');
console.log('====================================================');

