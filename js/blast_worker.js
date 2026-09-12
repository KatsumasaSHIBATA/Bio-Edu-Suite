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

function sendProgress(percent, stageText) {
    self.postMessage({ type: 'progress', percent: percent, stageText: stageText });
}

async function fetchWithFallback(url, options = {}, timeoutMs = 15000) {
    // タイムアウト付きのフェッチをラップするヘルパー
    const fetchWithTimeout = async (targetUrl, fetchOpts) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(targetUrl, { ...fetchOpts, signal: controller.signal });
            clearTimeout(id);
            return response;
        } catch (err) {
            clearTimeout(id);
            throw err;
        }
    };

    const fetchOptions = { ...options, cache: 'no-store' };
    try {
        const response = await fetchWithTimeout(url, fetchOptions);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        return response;
    } catch (err) {
        if (err.name === 'AbortError' || err.name === 'TypeError' || (err.message && err.message.includes('Failed to fetch'))) {
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            const proxyRes = await fetchWithTimeout(proxyUrl, fetchOptions);
            if (!proxyRes.ok) throw new Error(`Proxy HTTP Error: ${proxyRes.status}`);
            return proxyRes;
        }
        throw err;
    }
}

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
        sendProgress(15, 'NCBI QBLASTサーバーへ検索リクエスト送信中...');
        const startTime = Date.now();
        const TIMEOUT_MS = 120000; // 2 minutes

        const putUrl = `https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Put&PROGRAM=blastn&MEGABLAST=on&DATABASE=nt&QUERY=${encodeURIComponent(query)}&_t=${Date.now()}`;
        const putResponse = await fetchWithFallback(putUrl, {
            method: 'GET'
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

        sendProgress(35, `チケット発行完了 (RID: ${rid}, 推定所要時間: 約${rtoe}秒)`);

        await new Promise(resolve => setTimeout(resolve, Math.max(5, rtoe) * 1000));

        let pollCount = 0;
        let isReady = false;

        while (Date.now() - startTime < TIMEOUT_MS) {
            pollCount++;
            let percent = 35 + Math.min((pollCount / 10) * 55, 55); // 40~90%
            sendProgress(Math.floor(percent), `NCBI計算キューで解析中... (確認 ${pollCount}回目)`);

            const checkUrl = `https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Get&FORMAT_OBJECT=SearchInfo&RID=${rid}&_t=${Date.now()}`;
            const checkResponse = await fetchWithFallback(checkUrl);
            if (!checkResponse.ok) {
                throw new Error(`NCBI API Check Error: ${checkResponse.statusText}`);
            }

            const checkText = await checkResponse.text();

            if (checkText.includes('Status=WAITING')) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                continue;
            }

            if (checkText.includes('Status=FAILED')) {
                throw new Error('NCBI検索処理が失敗しました。');
            }

            if (checkText.includes('Status=UNKNOWN')) {
                throw new Error('NCBI検索セッションの有効期限が切れました。');
            }

            if (checkText.includes('Status=READY')) {
                isReady = true;
                if (checkText.includes('ThereAreHits=yes')) {
                    sendProgress(95, 'アライメントデータを受信・正規化中...');
                    const getUrl = `https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Get&FORMAT_TYPE=XML&RID=${rid}&_t=${Date.now()}`;
                    let getResponse = await fetchWithFallback(getUrl);
                    if (!getResponse.ok) {
                        throw new Error(`NCBI API Get Results Error: ${getResponse.statusText}`);
                    }

                    const xmlText = await getResponse.text();
                    const results = normalizeNcbiXml(xmlText);
                    sendProgress(100, '完了');
                    self.postMessage({ mode: 'ncbi', results });
                    return;
                } else {
                    sendProgress(100, '完了');
                    self.postMessage({ mode: 'ncbi', results: [] });
                    return;
                }
            }

            await new Promise(resolve => setTimeout(resolve, 10000));
        }

        if (!isReady) {
            const timeoutError = new Error('検索タイムアウト（最大待機時間を超過しました）。');
            timeoutError.name = 'TimeoutError';
            throw timeoutError;
        }

    } catch (err) {
        let isFetchError = err.name === 'TypeError' || (err.message && err.message.includes('Failed to fetch'));
        let isTimeout = err.name === 'TimeoutError' || (Date.now() - startTime >= 120000);
        
        let errorMsg = `NCBI APIエラーが発生しました。（詳細: ${err.message}）`;
        if (isFetchError) {
            errorMsg = `通信が遮断されました(CORS等)。プロキシでも解決できませんでした。ローカル検索に切り替えます。（詳細: ${err.message}）`;
        } else if (isTimeout) {
            errorMsg = `NCBI APIがタイムアウトしました。ローカル検索に切り替えます。`;
        }

        self.postMessage({
            error: true,
            fallbackTarget: 'local',
            message: errorMsg
        });
    }
}

function normalizeNcbiXml(xmlText) {
    const results = [];
    const hitRegex = /<Hit>([\s\S]*?)<\/Hit>/g;
    let hitMatch;
    while ((hitMatch = hitRegex.exec(xmlText)) !== null) {
        const block = hitMatch[1];
        const getTag = (tag) => {
            const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
            return m ? m[1].trim() : '';
        };
        const def = getTag('Hit_def');
        const acc = getTag('Hit_accession');
        const bitScore = Math.round(parseFloat(getTag('Hsp_bit-score')) || 0);
        const evalue = getTag('Hsp_evalue');
        const evalueNum = parseFloat(evalue) || 0;
        const identityVal = parseInt(getTag('Hsp_identity'), 10) || 0;
        const alignLen = parseInt(getTag('Hsp_align-len'), 10) || 1;
        const qseq = getTag('Hsp_qseq');
        const hseq = getTag('Hsp_hseq');
        const midline = getTag('Hsp_midline') || generateAlignPipe(qseq, hseq);

        let evalueStr = "";
        if (bitScore === 0) evalueStr = "No Hit";
        else if (evalueNum === 0) evalueStr = "0.0";
        else if (evalueNum < 0.01) evalueStr = evalueNum.toExponential(1);
        else if (evalueNum > 100) evalueStr = "> 100 (Random)";
        else evalueStr = evalueNum.toFixed(2);

        results.push({
            name: def || 'Unknown',
            id: acc || '-',
            gene: '-',
            score: bitScore,
            identity: ((identityVal / alignLen) * 100).toFixed(1),
            evalue: evalueStr,
            evalueNum: evalueNum,
            alignQ: qseq,
            alignPipe: midline,
            alignS: hseq
        });
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
