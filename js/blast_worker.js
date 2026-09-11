// Bio-Edu Suite: BLAST Web Worker (Dual Engine Architecture)
// Guideline Section 7.6 / 14

const DB_SIZE = 10000000000;

self.onmessage = async function(event) {
    const data = event.data;
    if (!data || !data.mode) return;

    const { mode, query, localDB, match, mismatch, gap } = data;

    if (mode === 'local') {
        runLocalBlast(query, localDB, match, mismatch, gap);
    } else if (mode === 'ncbi') {
        runNcbiBlast(query);
    } else {
        self.postMessage({ error: true, fallbackTarget: 'local', message: '不明なモードが指定されました。' });
    }
};

function runLocalBlast(query, localDB, pMatch, pMismatch, pGap) {
    try {
        let currentResults = [];
        (localDB || []).forEach(dbSeq => {
            let res = smithWaterman(query, dbSeq.seq, pMatch, pMismatch, pGap);
            currentResults.push({ name: dbSeq.name, id: dbSeq.id, gene: dbSeq.gene, ...res });
        });

        currentResults.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.evalueNum - b.evalueNum;
        });

        self.postMessage({ mode: 'local', results: currentResults });
    } catch (err) {
        self.postMessage({ error: true, fallbackTarget: 'local', message: 'ローカル検索中にエラーが発生しました: ' + err.message });
    }
}

function smithWaterman(query, subject, match, mismatch, gap) {
    let m = query.length;
    let n = subject.length;
    let dp = Array.from({length: m + 1}, () => new Int32Array(n + 1));
    
    let maxScore = 0;
    let maxI = 0, maxJ = 0;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            let scoreDiag = dp[i-1][j-1] + (query[i-1] === subject[j-1] ? match : mismatch);
            let scoreUp = dp[i-1][j] + gap;
            let scoreLeft = dp[i][j-1] + gap;
            
            let currentMax = Math.max(0, scoreDiag, scoreUp, scoreLeft);
            dp[i][j] = currentMax;

            if (currentMax > maxScore) {
                maxScore = currentMax;
                maxI = i; maxJ = j;
            }
        }
    }

    let alignQ = "", alignS = "", alignPipe = "";
    let i = maxI, j = maxJ;
    let matches = 0, totalLen = 0;

    while (i > 0 && j > 0 && dp[i][j] > 0) {
        let current = dp[i][j];
        let diag = dp[i-1][j-1];
        let up = dp[i-1][j];
        let left = dp[i][j-1];
        let weight = query[i-1] === subject[j-1] ? match : mismatch;

        if (current === diag + weight) {
            alignQ = query[i-1] + alignQ;
            alignS = subject[j-1] + alignS;
            if (query[i-1] === subject[j-1]) { alignPipe = "|" + alignPipe; matches++; }
            else { alignPipe = " " + alignPipe; }
            i--; j--;
        } else if (current === left + gap) {
            alignQ = "-" + alignQ;
            alignS = subject[j-1] + alignS;
            alignPipe = " " + alignPipe;
            j--;
        } else {
            alignQ = query[i-1] + alignQ;
            alignS = "-" + alignS;
            alignPipe = " " + alignPipe;
            i--;
        }
        totalLen++;
    }

    let identity = totalLen > 0 ? ((matches / totalLen) * 100).toFixed(1) : 0;
    
    let bitScore = maxScore > 0 ? (maxScore * 1.5) : 0; 
    let evalue = (query.length * DB_SIZE) / Math.pow(2, bitScore);
    
    let evalueStr = "";
    if (maxScore === 0) evalueStr = "No Hit";
    else if (evalue < 1e-100) evalueStr = "0.0";
    else if (evalue < 0.01) evalueStr = evalue.toExponential(1);
    else if (evalue > 100) evalueStr = "> 100 (Random)";
    else evalueStr = evalue.toFixed(2);

    return { score: maxScore, identity, evalue, evalueNum: evalue, alignQ, alignPipe, alignS };
}

async function runNcbiBlast(query) {
    try {
        const startTime = Date.now();
        const TIMEOUT_MS = 120000; // 2 minutes

        const putUrl = 'https://blast.ncbi.nlm.nih.gov/Blast.cgi';
        const putParams = new URLSearchParams({
            CMD: 'Put',
            PROGRAM: 'blastn',
            DATABASE: 'nt',
            QUERY: query
        });

        const putResponse = await fetch(putUrl, {
            method: 'POST',
            body: putParams
        });

        if (!putResponse.ok) {
            throw new Error(`NCBI API Put Error: ${putResponse.statusText}`);
        }

        const putText = await putResponse.text();
        const ridMatch = putText.match(/RID = (\w+)/);
        const rtoeMatch = putText.match(/RTOE = (\d+)/);

        if (!ridMatch) {
            throw new Error('NCBI APIからのRID取得に失敗しました。');
        }

        const rid = ridMatch[1];
        const rtoe = rtoeMatch ? parseInt(rtoeMatch[1], 10) : 10;

        await new Promise(resolve => setTimeout(resolve, Math.max(5, rtoe) * 1000));

        while (Date.now() - startTime < TIMEOUT_MS) {
            const checkUrl = `https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Get&FORMAT_OBJECT=SearchInfo&RID=${rid}`;
            const checkResponse = await fetch(checkUrl);
            if (!checkResponse.ok) {
                throw new Error(`NCBI API Check Error: ${checkResponse.statusText}`);
            }

            const checkText = await checkResponse.text();

            if (checkText.includes('Status=WAITING')) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }

            if (checkText.includes('Status=FAILED')) {
                throw new Error('NCBI検索処理が失敗しました。');
            }

            if (checkText.includes('Status=UNKNOWN')) {
                throw new Error('NCBI検索セッションの有効期限が切れました。');
            }

            if (checkText.includes('Status=READY')) {
                if (checkText.includes('ThereAreHits=yes')) {
                    const getUrl = `https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Get&FORMAT_TYPE=JSON2&RID=${rid}`;
                    let getResponse = await fetch(getUrl);
                    if (!getResponse.ok) {
                        getResponse = await fetch(`https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Get&FORMAT_TYPE=JSON&RID=${rid}`);
                    }
                    if (!getResponse.ok) {
                        throw new Error(`NCBI API Get Results Error: ${getResponse.statusText}`);
                    }

                    const jsonData = await getResponse.json();
                    const results = normalizeNcbiResults(jsonData);
                    self.postMessage({ mode: 'ncbi', results });
                    return;
                } else {
                    self.postMessage({ mode: 'ncbi', results: [] });
                    return;
                }
            }

            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        throw new Error('指定された時間（2分）を超過しました。');

    } catch (err) {
        self.postMessage({
            error: true,
            fallbackTarget: 'local',
            message: `NCBI APIがタイムアウトしました。ローカル検索に切り替えます。（詳細: ${err.message}）`
        });
    }
}

function normalizeNcbiResults(jsonData) {
    const results = [];
    try {
        let hits = [];
        if (jsonData.BlastOutput2 && jsonData.BlastOutput2[0] && jsonData.BlastOutput2[0].report) {
            const search = jsonData.BlastOutput2[0].report.results.search;
            hits = search.hits || [];
        } else if (jsonData.BlastOutput) {
            hits = jsonData.BlastOutput.BlastOutput_iterations?.Iteration?.Iteration_hits?.Hit || [];
        }

        hits.forEach(hit => {
            const hsps = (hit.hsps && hit.hsps[0]) || (hit.Hit_hsps && hit.Hit_hsps.Hsp && (Array.isArray(hit.Hit_hsps.Hsp) ? hit.Hit_hsps.Hsp[0] : hit.Hit_hsps.Hsp));
            if (!hsps) return;

            let name = 'Unknown';
            let id = '-';
            let gene = '-';

            if (hit.description && hit.description[0]) {
                const desc = hit.description[0];
                name = desc.sciname || desc.title || 'Unknown';
                id = desc.accession || desc.id || '-';
            } else if (hit.Hit_def) {
                name = hit.Hit_def;
                id = hit.Hit_accession || hit.Hit_id || '-';
            }

            const bitScore = Math.round(hsps.bit_score || hsps['Hsp_bit-score'] || 0);
            const score = hsps.score || hsps.Hsp_score || bitScore;
            const evalueNum = hsps.evalue !== undefined ? hsps.evalue : (hsps.Hsp_evalue !== undefined ? parseFloat(hsps.Hsp_evalue) : 0);
            const identityVal = hsps.identity !== undefined ? hsps.identity : (hsps.Hsp_identity || 0);
            const alignLen = hsps.align_len || hsps['Hsp_align-len'] || (hsps.qseq ? hsps.qseq.length : 1);
            const identity = alignLen > 0 ? ((identityVal / alignLen) * 100).toFixed(1) : '0.0';

            const qseq = hsps.qseq || hsps.Hsp_qseq || '';
            const hseq = hsps.hseq || hsps.Hsp_hseq || '';
            const midline = hsps.midline || hsps.Hsp_midline || generateAlignPipe(qseq, hseq);

            let evalueStr = "";
            if (score === 0) evalueStr = "No Hit";
            else if (evalueNum === 0) evalueStr = "0.0";
            else if (evalueNum < 0.01) evalueStr = evalueNum.toExponential(1);
            else if (evalueNum > 100) evalueStr = "> 100 (Random)";
            else evalueStr = evalueNum.toFixed(2);

            results.push({
                name: name,
                id: id,
                gene: gene,
                score: bitScore || score,
                identity: identity,
                evalue: evalueStr,
                evalueNum: evalueNum,
                alignQ: qseq,
                alignPipe: midline,
                alignS: hseq
            });
        });

        results.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.evalueNum - b.evalueNum;
        });

    } catch (e) {
        console.error('NCBI結果のパースエラー:', e);
    }
    return results;
}

function generateAlignPipe(qseq, hseq) {
    let pipe = "";
    const len = Math.min(qseq.length, hseq.length);
    for (let i = 0; i < len; i++) {
        if (qseq[i] === hseq[i] && qseq[i] !== '-') {
            pipe += "|";
        } else {
            pipe += " ";
        }
    }
    return pipe;
}
