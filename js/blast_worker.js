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
        localDB.forEach(dbSeq => {
            let res = smithWaterman(query, dbSeq.seq, pMatch, pMismatch, pGap);
            currentResults.push({ name: dbSeq.name, id: dbSeq.id, gene: dbSeq.gene, ...res });
        });

        currentResults        currentResults        currentResults        currentResults     a.score;
            return a.evalueNum - b.evalueNum;
        });

        self.postMessage({ mode: 'local', results: curre        self.postMessage({ mode: 'loca           selessage({ error: true, fallbackTarget: 'local', message:         self.postMessage({ mode: 'local', results: cur�。: ' + er        self.postMe
}

functfunctfunctfunctfunctfunctfunctfunctfunctfunctfunctfunct {
    let m = query.length;
    let n =    let n =    let n =et dp = Array.from({    let n =    let n =    let n =et dp = Array.from({    let n =    let n =    let n =et dp = Array.from({    let n =     i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            let scoreDiag = dp[i-1][j-1] + (query[i-1] === subject[j-            let scoreDiag =         let scoreUp = dp[i-1][j] + gap;
            let scoreLeft = dp[i][j-1] + gap;
            
            let currentMax = Math.max(0, scoreDiag, scoreUp, scoreLeft);
            dp[i][j] = currentMax;

            if (currentMax > maxScore) {
                maxScore = currentMax;
                maxI = i; maxJ = j;
            }
        }
    }

                                                                                                                                                                                                                                                   dp[i][j-1]; // Note: left logic from original
        let weight = query[i-1] === subject[j-1] ? mat        let weight = query[i-1] === subject[j-1] ? mat        let weight = query[i-1] === subject[j-1] ? mat        let weight = query[i-1] === subject[j-1] ? mat        let weight = -1]) { alignPipe = "|" + alignPipe; matches++;        let weight = query[i-1] === subject[j-1] ? mat        let weight = query[i-1] === subject[j-1] ? mat        let weight = q  alignQ = "-" + alignQ;
            alignS = subject[j-1] + align            alignS = subject[j-1] + align            alignS;
        } el        } el        }nQ = query[i-1] + alignQ;
            alignS = "-" + alignS;
            alignPipe = " " + alignPipe;
            i--;
        }
         otalLen++;
    }

    let identity = totalLen > 0 ? ((matches / totalLen) * 100).toFixed(1) : 0;
    
    let bitScore = maxScore > 0 ? (maxScore * 1.5) : 0; 
    let evalue = (query.length * DB_SIZE) / Math.pow(2, bitScore);
    
    let evalueStr = "";
    if (maxScore === 0) evalueStr = "No Hit";
    else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     else if     elsew();

                                                                                                      cgi';
        const putParams = new URLSearchParams({
                                    PROGRAM: 'blastn',
            DATABASE: 'nt',
            QUERY: query
        });

        const putResponse = await fetch(putUrl, {
            method: 'POST',
            body: putParams,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!putResponse.ok) {
            throw new Error(`NCBI API Put Err            throw new Error(`NCBI API Put Err            throw new Error(`NCBI API Put Err            throw new Error(`NCBI API Put Err            throw new Error(`NCBI API Put Err            throw new Error(`NCBI API Put Err            throw new Error(`NCBI API Put Err            throw new Error(`NCBI API Put Err            throw new Error(`NCBI API Put Err            throw new Error(`NCBI API Put Err            throw new Error(`NCBI API ch             throw new Error(`NCBI API Put Err            throw new Error(`NCBI API Put Err            tGet w            throw new Error(`NCBIt new Promise(r            throw new Error(`NCBI API Put Err     itial wait based on RTOE

                              artTime < TIMEO                              artTime < TIMEO   st               ov/Blast.cgi?CMD=Get&FORMAT_TYPE=JSON&RID=${rid}`;
            
                                                                 if (!getResponse.ok) {
                throw new Error(`NCBI A                throw new Error(`NCBI A                throw new Error(`NCBI A                throw new Error(`NCBI A                throw new Error(`NCBI A                throw new Error(`NCBI A                throw new Error(`NCBI A                throw new Error(`NCBI A                throw new Error(`NCBI A                throw new Error(`NCBI A                throw new Error(`NCBI A                throw new Error(`NCBI A                throw new Error(`NCBI A                throw new Error(`NCBI A                throw new Error(`NCBI A                throw new Error(`NCBI A                throw new Error(`NCBI A                throw new Error(`NCBI A                throw new Error(`NCBI A                thiRe                throw new Error(`NCBI A                throw new Error(`NCBI A                throw new Error(`NCBI A                throw new Error(`NC    } catch (e) {
                                                                                      �');
                }
            }

            // Unrecognized status but no timeout yet, keep waiting
            await new Promise(resolve => setTimeout(resolve, 10000));
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
        const report = jsonData.BlastOutput2[0].report;
        const hits = report.results.search.hits;

        hits.forEach(hit => {
            const hsps = hit.hsps[0];
            const desc = hit.description[0];
            
            const name = desc.sciname || desc.title || 'Unknown';
            const i            const i            const i            const i            const i               const score = hsps.bit_score;
                                                               entity =                                                                  
            let evalueStr = "";
            if (evalueNum === 0) evalueStr = "0.0";
            else if (evalueNum < 0.            elseevalueNum.toExponential(1);
                                 100) evalueStr = "> 100 (Random)";
            else evalueStr = evalueNum.toFixed(2);

            results.push({
                name: name,
                id: id,
                                            sco                           identity: id                                            s                                                    alignQ: h                          alignPipe: generateAlignPipe(hsps.qseq, hsps.hseq),
                alignS: hsps.hseq
            })            })            })            })            })CBI結果�            })            })            })            })            })CBI結果�            })            })            })            } (let            })            })            })            })            })CBI結果�            })            })            })                            })            })  
    return pipe;
}
