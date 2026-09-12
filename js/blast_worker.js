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

async function fetchWithFallback(url, options = {}, timeoutMs = 8000) {
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

    // 1. 本家への直接アクセス
    try {
        const response = await fetchWithTimeout(url, fetchOptions);
        if (response.ok) return response;
    } catch (err) {
        // 直接通信失敗時はプロキシ試行へ移行
    }

    // 2. プロキシの試行（無限再帰の完全排除）
    const proxies = [
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    ];

    for (let proxyUrl of proxies) {
        try {
            const proxyRes = await fetchWithTimeout(proxyUrl, fetchOptions);
            if (proxyRes.ok) return proxyRes;
        } catch (err) {
            continue; // 失敗したら次のプロキシへ
        }
    }

    throw new Error('すべての通信経路（直接・プロキシ）が遮断されました。');
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
    const startTime = Date.now();
    const TIMEOUT_MS = 120000; // 120秒
    try {
        sendProgress(15, 'グローバルサーバー(EBI/NCBI)へ検索リクエスト送信中...');

        const runUrl = `https://www.ebi.ac.uk/Tools/services/rest/ncbiblast/run`;
        const params = new URLSearchParams({
            email: 'bio.edu.suite.service@gmail.com',
            program: 'blastn',
            stype: 'dna',
            database: 'em_rel_std',
            sequence: query
        });

        let runResponse;
        try {
            runResponse = await fetch(runUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            });
        } catch (e) {
            runResponse = await fetch(`https://corsproxy.io/?${encodeURIComponent(runUrl)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            });
        }

        if (!runResponse.ok) {
            let errorText = await runResponse.text();
            errorText = errorText.replace(/<[^>]*>?/gm, '').replace(/\n/g, ' ').replace(/\r/g, ''); // HTML/XMLタグ・改行除去
            throw new Error(`EBI API Run Error: ${errorText.trim() || runResponse.statusText || 'Unknown Error'}`);
        }

        const jobId = await runResponse.text(); // ジョブIDがプレーンテキストで返る
        if (!jobId || !jobId.includes('ncbiblast')) {
            throw new Error('EBI APIからのジョブID取得に失敗しました。');
        }

        sendProgress(35, `チケット発行完了 (Job ID: ${jobId}, 計算待ち...)`);
        
        await new Promise(resolve => setTimeout(resolve, 4000));

        let pollCount = 0;
        let isReady = false;

        while (Date.now() - startTime < TIMEOUT_MS) {
            pollCount++;
            let percent = 35 + Math.min((pollCount / 10) * 55, 55); 
            sendProgress(Math.floor(percent), `グローバル計算キューで解析中... (確認 ${pollCount}回目)`);

            const statusUrl = `https://www.ebi.ac.uk/Tools/services/rest/ncbiblast/status/${jobId}`;
            const statusResponse = await fetch(statusUrl);
            if (!statusResponse.ok) throw new Error(`EBI API Status Error`);
            const statusText = await statusResponse.text();

            if (statusText === 'RUNNING' || statusText === 'PENDING' || statusText === 'STARTED') {
                await new Promise(resolve => setTimeout(resolve, 4000));
                continue;
            }

            if (statusText === 'ERROR' || statusText === 'FAILURE' || statusText === 'NOT_FOUND') {
                throw new Error(`検索処理が失敗しました (Status: ${statusText})。塩基配列が短すぎる可能性があります。`);
            }

            if (statusText === 'FINISHED') {
                isReady = true;
                sendProgress(95, 'アライメントデータを受信・正規化中...');
                
                const resultUrl = `https://www.ebi.ac.uk/Tools/services/rest/ncbiblast/result/${jobId}/xml`;
                const resultResponse = await fetch(resultUrl);
                if (!resultResponse.ok) throw new Error(`EBI API Result Error`);
                
                const xmlText = await resultResponse.text();
                const results = normalizeNcbiXml(xmlText);
                
                sendProgress(100, '完了');
                self.postMessage({ mode: 'ncbi', results });
                return;
            }

            await new Promise(resolve => setTimeout(resolve, 4000));
        }

        if (!isReady) {
            throw new Error('検索タイムアウト（最大待機時間を超過しました）。');
        }

    } catch (err) {
        let errorMsg = `グローバルAPI通信エラーが発生しました。（詳細: ${err.message}）即座にローカル検索へ切り替えます。`;
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
