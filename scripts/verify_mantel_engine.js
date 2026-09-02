const path = require('path');
const { calculateEuclideanDistanceMatrix, calculateMantelCorrelation } = require(path.join(__dirname, '../lib/bio_math_engine.js'));

console.log("==========================================");
console.log("   Mantel Test Engine Verification");
console.log("==========================================\n");

// Test 1: Euclidean Distance Matrix
console.log("Test 1: Euclidean Distance Matrix");
const dataA = [
    [0, 0], // Point 0
    [3, 4], // Point 1 (Dist 0-1 = 5)
    [6, 8]  // Point 2 (Dist 1-2 = 5, Dist 0-2 = 10)
];
const distA = calculateEuclideanDistanceMatrix(dataA);

console.assert(distA[0][0] === 0, "Distance to self should be 0");
console.assert(distA[0][1] === 5, "Distance between [0,0] and [3,4] should be 5");
console.assert(distA[1][2] === 5, "Distance between [3,4] and [6,8] should be 5");
console.assert(distA[0][2] === 10, "Distance between [0,0] and [6,8] should be 10");
console.log(" => Test 1 Passed\n");


// Test 2: Mantel Correlation (Perfect Correlation)
console.log("Test 2: Perfect Correlation (r = 1.0)");
// distA の下三角は [5, 10, 5] になるはず。
// matrix Bを distA と完全に同じにする。
const rPerfect = calculateMantelCorrelation(distA, distA);
console.assert(Math.abs(rPerfect - 1.0) < 1e-9, `Expected 1.0, got ${rPerfect}`);
console.log(" => Test 2 Passed\n");


// Test 3: Mantel Correlation (Known correlation)
console.log("Test 3: Known Correlation");
const matrixX = [
    [0, 2, 4],
    [2, 0, 6],
    [4, 6, 0]
];
const matrixY = [
    [0, 4, 8],
    [4, 0, 12],
    [8, 12, 0]
];
// 下三角要素は X: [2, 4, 6], Y: [4, 8, 12] -> Y = 2X (完全な正の相関)
const rKnown1 = calculateMantelCorrelation(matrixX, matrixY);
console.assert(Math.abs(rKnown1 - 1.0) < 1e-9, `Expected 1.0, got ${rKnown1}`);

const matrixZ = [
    [0, 6, 4],
    [6, 0, 2],
    [4, 2, 0]
];
// X: [2, 4, 6]
// Z: [6, 4, 2] -> Z = 8 - X (完全な負の相関)
const rKnown2 = calculateMantelCorrelation(matrixX, matrixZ);
console.assert(Math.abs(rKnown2 - (-1.0)) < 1e-9, `Expected -1.0, got ${rKnown2}`);
console.log(" => Test 3 Passed\n");


// Test 4: Mantel Correlation (No Correlation or Partial)
console.log("Test 4: Specific Calculation");
const mat1 = [
    [0, 1, 2, 3],
    [1, 0, 4, 5],
    [2, 4, 0, 6],
    [3, 5, 6, 0]
];
const mat2 = [
    [0, 2, 2, 2],
    [2, 0, 2, 2],
    [2, 2, 0, 2],
    [2, 2, 2, 0]
];
// mat1 lower: [1, 2, 4, 3, 5, 6]
// mat2 lower: [2, 2, 2, 2, 2, 2]
// mat2 is constant, so variance is 0. Expected result is 0.
const rKnown3 = calculateMantelCorrelation(mat1, mat2);
console.assert(rKnown3 === 0, `Expected 0 (due to 0 variance), got ${rKnown3}`);
console.log(" => Test 4 Passed\n");

console.log("All tests passed successfully!");
