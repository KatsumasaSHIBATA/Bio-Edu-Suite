// lib/ebi_mafft_api.js

/**
 * EMBL-EBIのMAFFT APIを利用してアライメントを行うモジュール
 */
async function runMafftViaEBI(fastaText, userEmail) {
    const baseUrl = "https://www.ebi.ac.uk/Tools/services/rest/mafft";

    const submitParams = new URLSearchParams();
    submitParams.append("email", userEmail);     
    submitParams.append("sequence", fastaText);  
    submitParams.append("format", "fasta");      

    console.log("EBIサーバーへ計算依頼を送信中...");
    
    // 1. ジョブの送信
    const submitResponse = await fetch(`${baseUrl}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: submitParams.toString()
    });

    if (!submitResponse.ok) throw new Error("EBIサーバーへのリクエストに失敗しました。");
    
    const jobId = await submitResponse.text();
    console.log(`受付完了。JobID: ${jobId} / 計算待ち...`);

    // 2. ステータス監視（3秒ごとに確認）
    while (true) {
        await new Promise(resolve => setTimeout(resolve, 3000)); 
        const statusResponse = await fetch(`${baseUrl}/status/${jobId}`);
        const status = await statusResponse.text();

        if (status === "FINISHED") break;
        if (status === "ERROR" || status === "FAILURE" || status === "NOT_FOUND") {
            throw new Error(`EBIサーバーエラー: ${status}`);
        }
    }

    // 3. 結果の取得
    console.log("計算完了。結果を取得します。");
    const resultResponse = await fetch(`${baseUrl}/result/${jobId}/fasta`);
    
    if (!resultResponse.ok) {
         const outResponse = await fetch(`${baseUrl}/result/${jobId}/out`);
         return await outResponse.text();
    }

    return await resultResponse.text();
}
