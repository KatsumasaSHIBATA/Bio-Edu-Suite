// ==========================================
// Bio-Edu Suite: Math Engine (Master)
// Reference: Kuhl & Giardina (1982), Iwata (1998)
// ==========================================

function chainCodeToCoordinates(codes) {
    // 数学座標系 (岩田1998, p.12)
    // 0:東, 1:北東, 2:北, 3:北西, 4:西, 5:南西, 6:南, 7:南東
    const dx = [1, 1, 0, -1, -1, -1,  0,  1];
    const dy = [0, 1, 1,  1,  0, -1, -1, -1];
    let coords = [{x: 0, y: 0}], cx = 0, cy = 0;
    for(let i=0; i<codes.length; i++) { 
        cx += dx[codes[i]]; cy += dy[codes[i]]; 
        coords.push({x: cx, y: cy}); 
    }
    return coords;
}

function computeEFA(coords, numHarmonics) {
    const K = coords.length - 1;
    let dt = new Array(K), t = new Array(K + 1);
    t[0] = 0;
    for(let p=0; p<K; p++) {
        dt[p] = Math.sqrt(Math.pow(coords[p+1].x - coords[p].x, 2) + Math.pow(coords[p+1].y - coords[p].y, 2));
        t[p+1] = t[p] + dt[p];
    }
    const T = t[K];
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
            let dX = coords[p+1].x - coords[p].x, dY = coords[p+1].y - coords[p].y;
            let phi_p = (2 * Math.PI * n * t[p+1]) / T, phi_prev = (2 * Math.PI * n * t[p]) / T;
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

function standardizeEFA(coeffs) {
    if(coeffs.length === 0) return coeffs;
    let a1 = coeffs[0].a, b1 = coeffs[0].b, c1 = coeffs[0].c, d1 = coeffs[0].d;
    
    let theta1 = 0.5 * Math.atan2(2 * (a1*b1 + c1*d1), a1*a1 + c1*c1 - b1*b1 - d1*d1);
    if (theta1 < 0) theta1 += Math.PI; 
    
    let a1_star = a1 * Math.cos(theta1) + b1 * Math.sin(theta1);
    let c1_star = c1 * Math.cos(theta1) + d1 * Math.sin(theta1);
    
    let psi1 = Math.atan2(c1_star, a1_star);
    if (psi1 < 0) psi1 += 2 * Math.PI;
    
    let E_star = Math.sqrt(a1_star*a1_star + c1_star*c1_star) || 1;

    let std = [];
    for (let n = 1; n <= coeffs.length; n++) {
        let a = coeffs[n-1].a, b = coeffs[n-1].b, c = coeffs[n-1].c, d = coeffs[n-1].d;
        let n_theta1 = n * theta1;
        let cos_nt = Math.cos(n_theta1), sin_nt = Math.sin(n_theta1);
        let cos_psi = Math.cos(psi1), sin_psi = Math.sin(psi1);

        let m1_a = a * cos_nt + b * sin_nt;
        let m1_b = -a * sin_nt + b * cos_nt;
        let m1_c = c * cos_nt + d * sin_nt;
        let m1_d = -c * sin_nt + d * cos_nt;

        let a_new = (cos_psi * m1_a + sin_psi * m1_c) / E_star;
        let b_new = (cos_psi * m1_b + sin_psi * m1_d) / E_star;
        let c_new = (-sin_psi * m1_a + cos_psi * m1_c) / E_star;
        let d_new = (-sin_psi * m1_b + cos_psi * m1_d) / E_star;

        std.push({a: a_new, b: b_new, c: c_new, d: d_new});
    }
    return std;
}

function _parseChainCodeToFeatures(rawStr, harmonics) {
    let parts = rawStr.trim().split(/\s+/);
    let endIndex = parts.indexOf('-1');
    if (endIndex === -1) endIndex = parts.length;
    
    let codes = [];
    for (let i = 0; i < endIndex; i++) {
        if (/^[0-7]$/.test(parts[i])) codes.push(parseInt(parts[i], 10));
    }
    if (codes.length < 10) codes = [0,1,2,3,4,5,6,7,0,1]; 

    let coords = chainCodeToCoordinates(codes);
    let rawCoeffs = computeEFA(coords, harmonics);
    let stdCoeffs = standardizeEFA(rawCoeffs);
    
    let features = [];
    for (let j = 0; j < harmonics; j++) {
        if(stdCoeffs.length > j) {
            let c = stdCoeffs[j];
            if (j > 0) features.push(c.a, c.b, c.c);
            features.push(c.d);
        } else {
            features.push(0,0,0,0);
        }
    }
    return { features, stdCoeffs };
}

function computePCA(matrix) {
    const N = matrix.length, M = matrix[0].length;
    let means = new Array(M).fill(0);
    for(let i=0; i<N; i++) for(let j=0; j<M; j++) means[j] += matrix[i][j];
    for(let j=0; j<M; j++) means[j] /= N;
    let X = matrix.map(row => row.map((val, j) => val - means[j]));
    
    function extractPC(data) {
        let t = new Array(N).fill(1), p = new Array(M).fill(0);
        for(let iter=0; iter<30; iter++) {
            let t_norm = t.reduce((sum, val) => sum + val*val, 0) || 1;
            for(let j=0; j<M; j++) {
                p[j] = 0; for(let i=0; i<N; i++) p[j] += data[i][j] * t[i];
                p[j] /= t_norm;
            }
            let p_norm = Math.sqrt(p.reduce((sum, val) => sum + val*val, 0)) || 1;
            for(let j=0; j<M; j++) p[j] /= p_norm;
            for(let i=0; i<N; i++) {
                t[i] = 0; for(let j=0; j<M; j++) t[i] += data[i][j] * p[j];
            }
        }
        return {scores: t, loadings: p};
    }

    let pc1 = extractPC(X);
    let X2 = X.map((row, i) => row.map((val, j) => val - pc1.scores[i] * pc1.loadings[j]));
    let pc2 = extractPC(X2);

    function calcSD(arr) {
        const m = arr.reduce((a, b) => a + b, 0) / arr.length;
        const v = arr.reduce((a, b) => a + Math.pow(b - m, 2), 0) / arr.length;
        return Math.sqrt(v);
    }
    return { pc1: pc1.scores, pc2: pc2.scores, loadings1: pc1.loadings, loadings2: pc2.loadings, means: means, sd1: calcSD(pc1.scores) || 1, sd2: calcSD(pc2.scores) || 1 };
}

function nipalsPCA(X, n_components = 2) {
    let n = X.length; let p = X[0].length;
    let means = new Array(p).fill(0);
    for(let i=0; i<n; i++) for(let j=0; j<p; j++) means[j] += X[i][j] / n;
    let Xc = X.map(row => row.map((val, j) => val - means[j]));
    
    let scores = []; let evals = []; let E = Xc.map(row => row.slice());
    
    for(let k=0; k<n_components; k++) {
        let t = E.map(row => row[0]); 
        let p_vec = new Array(p).fill(0); let t_old = new Array(n).fill(0);
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

function performClustering(data, sampleNames, distType, linkType) {
    const n = data.length;
    let distMatrix = [];
    for (let i = 0; i < n; i++) {
        distMatrix[i] = [];
        for (let j = 0; j < n; j++) {
            if (i === j) distMatrix[i][j] = 0;
            else if (i > j) {
                let d = calcDistance(data[i], data[j], distType);
                if (linkType === 'ward') d = d * d; 
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
            id: clusters.length, name: `Node${clusters.length}`, size: cI.size + cJ.size,
            active: true, left: cI, right: cJ,
            height: linkType === 'ward' ? Math.sqrt(minDist) : minDist
        };
        if(linkType !== 'ward' && linkType !== 'upgma') newCluster.height = minDist;

        distMatrix[newCluster.id] = [];
        for (let k = 0; k < clusters.length; k++) {
            if (!clusters[k].active && k !== mergeI && k !== mergeJ) continue;
            let d_ik = distMatrix[cI.id][clusters[k].id], d_jk = distMatrix[cJ.id][clusters[k].id], d_ij = minDist;
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

function runKMeans(dataMatrix, k, maxIter = 100) {
    if(dataMatrix.length === 0) return [];
    let centroids = [];
    let indices = [];
    while(indices.length < k && indices.length < dataMatrix.length) {
        let idx = Math.floor(Math.random() * dataMatrix.length);
        if(!indices.includes(idx)) {
            indices.push(idx);
            centroids.push([...dataMatrix[idx]]);
        }
    }
    
    let assignments = new Array(dataMatrix.length).fill(-1);
    let changed = true;
    let iter = 0;
    
    while(changed && iter < maxIter) {
        changed = false;
        iter++;
        let sums = Array.from({length: k}, () => new Array(dataMatrix[0].length).fill(0));
        let counts = new Array(k).fill(0);
        
        for(let i=0; i<dataMatrix.length; i++) {
            let point = dataMatrix[i];
            let minDist = Infinity;
            let bestCluster = -1;
            for(let c=0; c<k; c++) {
                let dist = 0;
                for(let j=0; j<point.length; j++) dist += Math.pow(point[j] - centroids[c][j], 2);
                if(dist < minDist) { minDist = dist; bestCluster = c; }
            }
            if(assignments[i] !== bestCluster) { assignments[i] = bestCluster; changed = true; }
            for(let j=0; j<point.length; j++) sums[bestCluster][j] += point[j];
            counts[bestCluster]++;
        }
        for(let c=0; c<k; c++) {
            if(counts[c] > 0) {
                for(let j=0; j<centroids[c].length; j++) centroids[c][j] = sums[c][j] / counts[c];
            }
        }
    }
    return assignments;
}

// --- App 10 (Static View) Wrappers ---
function computeMorphologyPCA(morphStrings) {
    const harmonics = 20; 
    let featureMatrix = morphStrings.map(str => _parseChainCodeToFeatures(str, harmonics).features);
    return nipalsPCA(featureMatrix, 2);
}

function computeGeneticTree(samples) {
    let n = samples.length;
    let distMatrix = Array(n).fill(0).map(() => Array(n).fill(0));
    
    let freqs = samples.map(s => {
        let seq = (s.dnaData || s.dnaSequence || "").split('\n').filter(l=>!l.startsWith('>')).join('').toUpperCase().replace(/[^ATGC]/g,'');
        let f = {};
        if(seq.length > 3) {
            for(let i=0; i<=seq.length-3; i++) {
                let kmer = seq.substr(i, 3);
                f[kmer] = (f[kmer] || 0) + 1;
            }
        }
        return f;
    });

    for(let i=0; i<n; i++) {
        for(let j=i+1; j<n; j++) {
            let d = 0;
            let keys = new Set([...Object.keys(freqs[i]), ...Object.keys(freqs[j])]);
            keys.forEach(k => {
                let diff = (freqs[i][k] || 0) - (freqs[j][k] || 0);
                d += diff * diff;
            });
            distMatrix[i][j] = distMatrix[j][i] = Math.sqrt(d);
        }
    }

    let clusters = samples.map((s, i) => ({ id: i, data: s, size: 1, left: null, right: null, height: 0 }));
    let dist = distMatrix.map(row => [...row]); 
    let nodes = [...clusters];
    let nextId = n;
    
    while(nodes.length > 1) {
        let minD = Infinity, c1 = -1, c2 = -1;
        for(let i=0; i<nodes.length; i++) {
            for(let j=i+1; j<nodes.length; j++) {
                if(dist[nodes[i].id][nodes[j].id] < minD) {
                    minD = dist[nodes[i].id][nodes[j].id]; c1 = i; c2 = j;
                }
            }
        }
        
        let left = nodes[c1], right = nodes[c2];
        let newNode = { id: nextId++, data: {name: `Node${nextId}`}, size: left.size + right.size, left: left, right: right, height: minD / 2 };
        
        dist[newNode.id] = [];
        for(let i=0; i<dist.length; i++) dist[i][newNode.id] = 0;
        
        for(let i=0; i<nodes.length; i++) {
            if(i === c1 || i === c2) continue;
            let nId = nodes[i].id;
            let newD = (dist[left.id][nId] * left.size + dist[right.id][nId] * right.size) / newNode.size;
            dist[newNode.id][nId] = dist[nId][newNode.id] = newD;
        }
        
        nodes.splice(c2, 1); nodes.splice(c1, 1);
        nodes.push(newNode);
    }
    return nodes[0];
}

// --- App 10 (Dynamic View) Wrappers ---
function processMorphology(rawDataList) {
    const harmonics = 20;
    let featureMatrix = [];
    let efaCoeffsList = []; 
    rawDataList.forEach(rawStr => {
        let res = _parseChainCodeToFeatures(rawStr, harmonics);
        featureMatrix.push(res.features);
        efaCoeffsList.push({
            a: res.stdCoeffs.map(c=>c.a),
            b: res.stdCoeffs.map(c=>c.b),
            c: res.stdCoeffs.map(c=>c.c),
            d: res.stdCoeffs.map(c=>c.d)
        });
    });
    let clusters = runKMeans(featureMatrix, Math.min(3, featureMatrix.length));
    let pca = nipalsPCA(featureMatrix);
    pca.coeffsList = efaCoeffsList; 
    return { pca: pca, clusters: clusters };
}

function processGenetics(rawDataList) {
    const k = 3; 
    const kmerMap = {};
    let index = 0;
    const bases = ['A','T','G','C'];
    for(let b1 of bases) for(let b2 of bases) for(let b3 of bases) kmerMap[b1+b2+b3] = index++;

    let featureMatrix = [];
    rawDataList.forEach(fastaStr => {
        let seq = fastaStr.split('\n').filter(l => !l.startsWith('>')).join('').toUpperCase().replace(/[^ATGC]/g, '');
        let freq = new Array(64).fill(0);
        if (seq.length >= k) {
            for(let i=0; i<=seq.length - k; i++) {
                let kmer = seq.substring(i, i+k);
                if (kmerMap[kmer] !== undefined) freq[kmerMap[kmer]]++;
            }
            let total = seq.length - k + 1;
            freq = freq.map(v => v / total);
        }
        featureMatrix.push(freq);
    });
    let clusters = runKMeans(featureMatrix, Math.min(3, featureMatrix.length));
    let pca = nipalsPCA(featureMatrix);
    return { pca: pca, clusters: clusters };
}
