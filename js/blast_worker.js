// NCBI Q-BLAST API Worker
self.addEventListener('message', async (e) => {
    const querySeq = e.data.query;
    if (!querySeq) {
        self.postMessage({ type: 'error', message: '配列が入力されていません。' });
        return;
    }

    try {
        self.postMessage({ type: 'progress', message: 'NCBIにリクエスト送信中...', progress: 10 });

        const putParams = new URLSearchParams({
            CMD: 'Put', PROGRAM: 'blastn', DATABASE: 'nt', QUERY: querySeq
        });
        const putResponse = await fetch('https://blast.ncbi.nlm.nih.gov/Blast.cgi', {
            method: 'POST', body: putParams,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        if (!putResponse.ok) throw new Error('リクエスト送信失敗');
        const putText = await putResponse.text();

        const ridMatch = putText.match(/RID = (.*)/);
        const rtoeMatch = putText.match(/RTOE = (.*)/);
        if (!ridMatch) throw new Error('RID取得失敗');

        const rid = ridMatch[1];
        const rtoe = rtoeMatch ? parseInt(rtoeMatch[1], 10) : 10;
        self.postMessage({ type: 'progress', message: `RID取得完了(${rid})。待機中...`, progress: 30 });

        let status = 'WAITING';
        const startTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, rtoe * 1000));

        while (status === 'WAITING') {
            if (Date.now() - startTime > 180000) throw new Error('タイムアウト（3分経過）');
            self.postMessage({ type: 'progress', message: '状態確認中...', progress: 50 });

            const infoRes = await fetch(`https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Get&FORMAT_OBJECT=SearchInfo&RID=${rid}`);
            const infoText = await infoRes.text();

            if (infoText.includes('Status=WAITING')) {
                self.postMessage({ type: 'progress', message: 'サーバーで処理中...', progress: 60 });
                await new Promise(resolve => setTimeout(resolve, 10000));
            } else if (infoText.includes('Status=FAILED')) {
                throw new Error('検索失敗');
            } else if (infoText.includes('Status=UNKNOWN')) {
                throw new Error('無効なRID');
            } else if (infoText.includes('Status=READY')) {
                status = 'READY';
                if (!infoText.includes('ThereAreHits=yes')) {
                    self.postMessage({ type: 'complete', results: [] });
                    return;
                }
            } else {
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
        }

        self.postMessage({ type: 'progress', message: '結果受信中...', progress: 80 });
        const resUrl = `https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Get&FORMAT_TYPE=XML&RID=${rid}`;
        const resultsResponse = await fetch(resUrl);
        const resultsText = await resultsResponse.text();

        const results = parseBlastXML(resultsText);
        self.postMessage({ type: 'progress', message: '完了！', progress: 100 });
        self.postMessage({ type: 'complete', results: results });

    } catch (error) {
        self.postMessage({ type: 'error', message: error.message });
    }
});

function parseBlastXML(xmlText) {
    const results = [];
    const hitRegex = /<Hit>([\s\S]*?)<\/Hit>/g;
    let hitMatch;
    
    while ((hitMatch = hitRegex.exec(xmlText)) !== null) {
        const hitXml = hitMatch[1];
        const hitId = extractTag(hitXml, 'Hit_id');
        const hitDef = extractTag(hitXml, 'Hit_def');
        const hspMatch = /<Hsp>([\s\S]*?)<\/Hsp>/.exec(hitXml);
        
        if (hspMatch) {
            const hspXml = hspMatch[1];
            const bitScore = parseFloat(extractTag(hspXml, 'Hsp_bit-score')).toFixed(1);
            const evalueNum = parseFloat(extractTag(hspXml, 'Hsp_evalue'));
            const identity = parseInt(extractTag(hspXml, 'Hsp_identity'), 10);
            const alignLen = parseInt(extractTag(hspXml, 'Hsp_align-len'), 10);
            
            let formattedEvalue = evalueNum.toExponential(2);
            if (evalueNum === 0) formattedEvalue = "0.0";
            else if (evalueNum > 0.01) formattedEvalue = evalueNum.toFixed(3);
            
            results.push({
                name: hitDef.split(',')[0] || hitDef,
                id: hitId,
                gene: "Unknown",
                score: bitScore,
                identity: ((identity / alignLen) * 100).toFixed(1) + "%",
                evalue: formattedEvalue,
                evalueNum: evalueNum,
                alignQ: extractTag(hspXml, 'Hsp_qseq'),
                alignPipe: extractTag(hspXml, 'Hsp_midline'),
                alignS: extractTag(hspXml, 'Hsp_hseq')
            });
            if (results.length >= 10) break;
        }
    }
    return results;
}

function extractTag(xml, tag) {
    const match = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`).exec(xml);
    return match ? match[1].trim() : '';
}
