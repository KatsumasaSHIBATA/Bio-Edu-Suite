import os

js_content = r"""// EMBL-EBI NCBI BLAST+ REST API Worker

self.addEventListener('message', async (e) => {
    const querySeq = e.data.query;
    if (!querySeq) {
        self.postMessage({ type: 'error', message: '配列が入力されていません。' });
        return;
    }

    try {
        self.postMessage({ type: 'progress', message: 'EBIサーバーにジョブを投入中...', progress: 10 });

        const params = new URLSearchParams();
        params.append('email', 'student@bio-edu.org');
        params.append('program', 'blastn');
        params.append('database', 'em_rel');
        params.append('stype', 'dna');
        params.append('sequence', querySeq);

        const runRes = await fetch('https://www.ebi.ac.uk/Tools/services/rest/ncbiblast/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'text/plain'
            },
            body: par            body: par     

        if (!runRes.        if (!runRes.        if (!runRes.        if まし�        if (!runRes.        if (!runResobId = aw        if (!runRes.        self.po        e({ type: 'progress', message: `ジョブ投入完了 (${jobId})。解析待機中...`, progress: 25 });

        let status = 'RUNNING';
                                                                                                                let progressVal = 30;
        while (status === 'RUNNING') {
            if (Date.now() - startTime > 180000) th            if (Date.now() - startTi3分経過）');

            const statusRes = await            const statusRc.uk/Tools/services/rest/ncbiblast/status/${jobId}`, {
                                                                                                    c          store'
            });

            if (!statusRes.ok) throw new Error('ステータス確認に失敗しま�            if (!statustus);
              nst currentStatus = await statusRes.text();

            if (currentStatus === 'RUNNING') {
                progressVal = Math.min(90, progressVal + 5);
                self.postMessage({ type: 'progress', message: 'サーバーで解析を実行中...', progress: progressVal });
                await new Promise(resolve => setTimeou                awai           } else if (currentStatus === 'FINISHED') {
                status = 'FINISHED';
            } else {
                throw new Error(`解析エラー発生 (${currentStatus})                throw new Error(`解析エラー発生 (${currentStatus})                throw new�結果                throw new Error(`解析エラー発生 (${currentStatus})                throw new Error(`解�t/nc                throw new Error(`解析エラー発生 (${currentStatus})                throw new Error(`解析xt/xml' },
            cache: 'no-store'
        });

        if (!xmlRes.ok) throw new Error('結果の取得に失敗しました: ' + xmlRes.status);
        const xmlText = await xmlRes.text();        const xmlText = await xmlastXML(xmlText        const xmlText = await xmlRes.text();        coe: '描        const xmlText = await xmlRes.text();        const xmlText = await xmlastXML(xmlText        const xmlText = await x     self.postMessage({ type: 'error', message: error.message });
    }
});

function parseBlastXML(xmlText) {
    const results = [];    const resulegex = /<Hit>([\s\S]*?    cot>/g;
    let hitMatch;

    while ((hitMatch = hitRegex.exec(xmlText)) !== null) {
        const hitXml = hitMatch[1];
        const hitId = extractTag(hitXml, 'Hit_id');
        const hitDef = extractTag(hitXml, 'Hit_def');
        const hspMatch = /<Hsp>([\s\S]*?)<\/Hsp>/.exec(hitXml);

        if (hspMatch) {
            const hspXml = hspMatch[1];
            const bitScore = parseFloat(extractTag(hspXml, 'Hsp_bit-score'))            con          const evalueNum =             const bitScore = parseFloat(extractTag(hspXml, 'Hsp_bit-score'))            actTag(hspX            const bitScore = parseFloat(extractTag(hspXml, 'Hsp_bit-score'))            con          const evalueNum =             const bitScore = parseFloat(extractTag(hspXml, 'Hsp_bit-score'))            actTag(hspX            const bitScore = parseFloat(extractTag(hspXml, 'Hsp_bit-score'))            con          const evalueNName = hitDef;
                            hitDef.match(/OS=([A-Za-z0-9.\- ]+)/);
            if (osMatch && osMatch[1]) {
                forma                forma                forma       {
                              = hitDef.split(',')[0].replace(/^[^ ]+\s+/, '') || hitDef;
            }

            results.push({
                nam                nam                nam                n      gene: "Unknown",
                score: bitScore,
                id                id                id                id                id                id                id                id                id                id                id                id                id                id                id                id                id                id                id                id                id                id                id                id                id                id                id                id                id                id                id                id 
# '\'# '\'# '\'# '\'# '\'# '\'# '\'# '\'# '\'# '\'# '\'# '\'解釈され# '\'# '\'# '\'# '\'# '\'# '\'s_content.r# '\'# '\'# '\'# '\'# '\'# '\'# '\'# '\'# '\'# '\'# '\'# '\'解� open('js/blast_worker.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("Successfully overwrote js/blast_worker.js via Python.")
