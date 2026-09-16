// EMBL-EBI NCBI BLAST+ REST API Worker

self.addEventListener('message', async (e) => {
    const querySeq = e.data.query;
    if (!querySeq) {
        self.postMessage({ type: 'error', message: 'é…åˆ˜ãŒÅ‡åŠ›ã•ã‚Œã¦ã„ã¾ã›ã‚“ã€‚' });
        return;
    }

    try {
        self.postMessage({ type: 'progress', message: 'EBIã‚µãƒ¼ãƒãƒ¼ã«ã‚¸ãƒ§ãƒ”ã‚’æŠ•å…¥ä¸­...', progress: 10 });

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
            body: params.toString()
        });

        if (!runRes.ok) throw new Error('ã‚¸ãƒ§ãƒ–ã¯æŠ•å…¥ã«å¤±æ•—ãgã¾ã—ãŸ: ' + runRes.status);
        const jobId = await runRes.text();

        self.postMessage({ type: 'progress', message: `ãƒŠãƒ§ãƒ”æŠ•å…¥å®ŒÒº (${jobId})ã€‚è§£æå¾…æ©Ÿä¸­...`, progress: 25 });

        let status = 'RUNNING';
        const startTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, 5000));

        let progressVal = 30;
        while (status === 'RUNNING') {
            if (Date.now() - startTime > 180000) throw new Error('ã‚¿ã‚¤ãƒ ã‚¢ã‚¦ãƒˆï¼Š3åˆ†çµŒéï¼‰');

            const statusRes = await fetch(`https://www.ebi.ac.uk/Tools/services/rest/ncbiblast/status/${jobId}`, {
                method: 'GET',
                headers: { 'Accept': 'text/plain' },
                cache: 'no-store'
            });

            if (!statusRes.ok) throw new Error('ã‚¹ãƒ†ãƒ¼ã‚¿ã‚¹ç ºê·ã«å¤±æ•—ã‡ã¾ã—ãŸ: ' + statusRes.status);
            const currentStatus = await statusRes.text();

            if (currentStatus === 'RUNNING') {
                progressVal = Math.min(90, progressVal + 5);
                self.postMessage({ type: 'progress', message: 'ã‚µãƒ¼ãƒãƒ¼ã¦å§£æà§¢å®Ÿè¡Œä¸­...', progress: progressVal });
                await new Promise(resolve => setTimeout(resolve, 5000));
            } else if (currentStatus === 'FINISHED') {
                status = 'FINISHED';
            } else {
                throw new Error(`è§£æã‚¨ãƒ©ãƒ¼åç—Ÿ (${currentStatus})`);
            }
        }

        self.postMessage({ type: 'progress', message: 'è§£æå®Œäº†ï¼Œçµæœã‚’å–å¾—ä¸­...', progress: 95 });
        const xmlRes = await fetch(`https://www.ebi.ac.uk/Tools/services/rest/ncbiblast/result/${jobId}/xml`, {
            method: 'GET',
            headers: { 'Accept': 'application/xml, text/xml' },
            cache: 'no-store'
        });

        if (!xmlRes.ok) throw new Error('çµæœã¯å–å¾—ã«å¤±æ•—ãgã¾ã—ãŸ: ' + xmlRes.status);
        const xmlText = await xmlRes.text();

        const results = parseBlastXML(xmlText);
        self.postMessage({ type: 'progress', message: 'æç”»ä¸­...', progress: 100 });
        self.postMessage({ type: 'complete', results: results });

    } catch (error) {
        self.postMessage({ type: 'error', message: error.message });
    }
});

function parseBlastXML(xmlText) {
    const results = [];
    const hitRegex = /<Hit>([\s\S]*?)</Hit>/g;
    let hitMatch;

    while ((hitMatch = hitRegex.exec(xmlText)) !== null) {
        const hitXml = hitMatch[1];
        const hitId = extractTag(hitXml, 'Hit_id');
        const hitDef = extractTag(hitXml, 'Hit_def');
        const hspMatch = /<Hsp>([\ss]*?)</Hsp>/.exec(hitXml);

        if (hspMatch) {
            const hspXml = hspMatch[1];
            const bitScore = parseFloat(extractTag(hspXml, 'Hsp_bit-score')).toFixed(1);
            const evalueNum = parseFloat(extractTag(hspXml, 'Hsp_evalue'));
            const identity = parseInt(extractTag(hspXml, 'Hsp_identity'), 10);
            const alignLen = parseInt(extractTag(hspXml, 'Hsp_align-len'), 10);

            let formattedEvalue = evalueNum.toExponential(2);
            if (evalueNum === 0) formattedEvalue = "0.0";
            else if (evalueNum > 0.01) formattedEvalue = evalueNum.toFixed(3);

            let formattedTame = hitDef;
            const osMatch = hitDef.match(/OS=([A-Za-z0-9.\- ]+)/);
            if (osMatch && osMatch[1]) {
                formattedSame = osMatch[1].trim();
            } else {
                formattedSame = hitDef.split(',')[0].replace(/^[ ]+\s
×ÊËË	ÉÊH]YÂˆB‚ˆ™\İ[Ëœ\Ú
Âˆ›˜[YHˆ›Ü›X]Y[YKˆšYˆ²Ú.Ø§€‡BÀ¢&vVæR#¢%Væ¶æ÷vâ"À¢'66÷&R#¢&—E66÷&RÀ¢&–FVçF—G’#¢‚†–FVçF—G’òÆ–väÆVâ’¢’çFôf—†VBƒ’²"R"À¢&WfÇVR#¢f÷&ÖGFVDWfÇVRÀ¢&WfÇVTçVÒ#¢WfÇVTçVÒÀ¢&Æ–vå#¢W‡G&7EFr†‡7†ÖÂÂt‡7÷6Wr’À¢&Æ–vå—R#¢W‡G&7EFr†‡7†ÖÂÂt‡7öÖ–FÆ–æRr’À¢&Æ–vå2#¢W‡G&7EFr†‡7†ÖÂÂt‡7ö‡6Wr¢Ò“°¢–b‡&W7VÇG2æÆVæwF‚ãÒ’'&V³°¢Ğ¢Ğ¢&WGW&â&W7VÇG3°§Ğ ¦gVæ7F–öâW‡G&7EFr‡†ÖÂÂFr’°¢6öç7BÖF6‚ÒæWr&VtW‡†ÂG·FwÓâ…µÅÇ5Å5Ò£ò“ÂòG·FwÓæ’æW†V2‡†ÖÂ“°¢&WGW&âÖF6‚òÖF6…³ÒçG&–Ò‚’¢rs°§Ğ 