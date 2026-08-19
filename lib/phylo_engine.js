const PhyloEngine = {
    parseAndCalculateMatrix: function(fastaText) {
        const lines = fastaText.split('\n');
        let seqs = []; let name = "", seq = "";
        
        lines.forEach(l => {
            if(l.startsWith('>')) { 
                if(name) seqs.push({name, seq}); 
                name = l.substring(1).trim(); 
                seq = ""; 
            } else {
                seq += l.toUpperCase().replace(/[^A-Z-]/g, '');
            }
        });
        if(name) seqs.push({name, seq});

        if(seqs.length < 3) { 
            return { success: false, message: "3つ以上の塩基配列/アミノ酸配列が必要です。" };
        }
        
        let len = seqs[0].seq.length;
        if(!seqs.every(s => s.seq.length === len)) { 
            return { success: false, error: 'LENGTH_MISMATCH' };
        }

        let hasDuplicate = false;
        let distanceMatrix = Array(seqs.length).fill(0).map(() => Array(seqs.length).fill(0));
        
        for(let i = 0; i < seqs.length; i++) {
            for(let j = i + 1; j < seqs.length; j++) {
                let m = 0, v = 0;
                for(let k = 0; k < len; k++) {
                    if(seqs[i].seq[k] !== '-' && seqs[j].seq[k] !== '-') { 
                        v++; 
                        if(seqs[i].seq[k] !== seqs[j].seq[k]) m++; 
                    }
                }
                distanceMatrix[i][j] = distanceMatrix[j][i] = v > 0 ? (m / v) * 100 : 0;
                if (distanceMatrix[i][j] === 0) hasDuplicate = true;
            }
        }

        return {
            success: true,
            seqs: seqs,
            names: seqs.map(s => s.name),
            distanceMatrix: distanceMatrix,
            hasDuplicate: hasDuplicate
        };
    }
};