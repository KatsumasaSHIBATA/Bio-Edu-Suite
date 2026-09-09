import os

file_path = '10_integrative_taxonomy_studio.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '''    // ==========================================
    // Interaction & Morphing Logic
    // =========================================='''
end_marker = '    function animateMorph() {'

if start_marker not in content:
    raise ValueError("start_marker not found")
if end_marker not in content:
    raise ValueError("end_marker not found")

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)
rep_part1 = '''    // ==========================================
    // Interaction & Morphing Logic
    // ==========================================
    function handleNodeHover(nodeData) {
        // ハイライトリセット
        d3.selectAll('.node-tree').classed('highlighted', false);
        d3.selectAll('.link-mol').classed('highlighted', false).style('opacity', 1);
        d3.selectAll('.link-morph').classed('highlighted', false).style('opacity', 1);
        d3.selectAll('.tangle-line').classed('highlighted', false)
          .style('opacity', d => (isUntangled && d && d.isCrossing) ? 0.9 : 0.6)
          .style('stroke', d => (isUntangled && d && d.isCrossing) ? '#e67e22' : '#bdc3c7')
          .style('stroke-width', d => (isUntangled && d && d.isCrossing) ? 2.5 : 1.5);
        
        if (!nodeData) {
            currentHoveredNode = null;
            targetCoeffs = null;
            if(parsedMorphData.length > 0) drawPCA();
            return;
        }
        
        currentHoveredNode = nodeData;
        
        // ツリーパスを薄くする
        d3.selectAll('.link-mol').style('opacity', 0.2);
        d3.selectAll('.link-morph').style('opacity', 0.2);
        d3.selectAll('.tangle-line').style('opacity', 0.1);
        
        // 自身の親へ遡るリンクのハイライト
        let curr = nodeData;
        while(curr && curr.parent) {
            d3.select(`#link-${curr.parent.nodeId}-${curr.nodeId}`)
              .classed('highlighted', true)
              .style('opacity', 1);
            curr = curr.parent;
        }
        
        d3.select(`#${nodeData.nodeId}`).classed('highlighted', true);
        
        let leaves = nodeData.leavesList.map(l => normalizeId(l));
        
        // 反対側（および自ツリー）の該当リーフノードをハイライト
        d3.selectAll('.node-tree').filter(d => {
            if (!d.data || !d.data.name) return false;
            return leaves.includes(normalizeId(d.data.name));
        }).classed('highlighted', true);
        
        // タングルラインのハイライト
        d3.selectAll('.tangle-line')
            .filter(d => leaves.includes(normalizeId(d.mol.data.name)))
            .style('opacity', 1)
            .style('stroke', 'var(--phase-color)')
            .style('stroke-width', 2);
'''
rep_part2 = '''        // 形態データが存在する場合のみ、モーフィング用計算を実行
        if (parsedMorphData.length > 0) {
            let rootPC1 = 0, rootPC2 = 0, validRoot = 0;
            let targetPC1 = 0, targetPC2 = 0, validTarget = 0;
            let normTargetLeaves = nodeData.leavesList.map(l => normalizeId(l));
            
            parsedMorphData.forEach(d => {
                if (d.pc1 !== undefined && d.pc2 !== undefined) {
                    rootPC1 += d.pc1; rootPC2 += d.pc2; validRoot++;
                    if (normTargetLeaves.includes(normalizeId(d.id))) {
                        targetPC1 += d.pc1; targetPC2 += d.pc2; validTarget++;
                    }
                }
            });
            if (validRoot > 0) { rootPC1 /= validRoot; rootPC2 /= validRoot; }
            if (validTarget > 0) { targetPC1 /= validTarget; targetPC2 /= validTarget; }

            window.morphTimelineCache = [];

            if (currentMorphMethod === 'gpa') {
                let targetLandmarks = interpolateAncestralGPA(nodeData.leavesList);
                let rootLandmarks = interpolateAncestralGPA(globalTreeRoot.molRoot.leavesList);

                if (targetLandmarks && rootLandmarks) {
                    for (let step = 0; step <= 100; step++) {
                        let p = step / 100;
                        let interpolatedPoints = [];
                        for (let i = 0; i < targetLandmarks.length; i++) {
                            let rx = rootLandmarks[i][0], ry = rootLandmarks[i][1];
                            let tx = targetLandmarks[i][0], ty = targetLandmarks[i][1];
                            interpolatedPoints.push([rx + (tx - rx) * p, ry + (ty - ry) * p]);
                        }
                        window.morphTimelineCache.push({
                            type: 'gpa',
                            landmarks: interpolatedPoints,
                            pc1: rootPC1 + (targetPC1 - rootPC1) * p,
                            pc2: rootPC2 + (targetPC2 - rootPC2) * p
                        });
                    }
                }
            } else {
                let targetCoeffs = interpolateAncestralEFA(nodeData.leavesList);
                let rootCoeffs = interpolateAncestralEFA(globalTreeRoot.molRoot.leavesList);

                if (targetCoeffs && rootCoeffs) {
                    for (let step = 0; step <= 100; step++) {
                        let p = step / 100;
                        let cacheStep = {
                            type: 'efa',
                            coeffs: { a: [], b: [], c: [], d: [] },
                            pc1: rootPC1 + (targetPC1 - rootPC1) * p,
                            pc2: rootPC2 + (targetPC2 - rootPC2) * p
                        };
                        ['a', 'b', 'c', 'd'].forEach(key => {
                            for (let i = 0; i < targetCoeffs[key].length; i++) {
                                let startVal = rootCoeffs[key][i];
                                let targetVal = targetCoeffs[key][i];
                                cacheStep.coeffs[key].push(startVal + (targetVal - startVal) * p);
                            }
                        });
                        window.morphTimelineCache.push(cacheStep);
                    }
                }
            }

            if (window.morphTimelineCache && window.morphTimelineCache.length > 0) {
                const timelineContainer = document.getElementById('morph-timeline-container');
                const timelineInput = document.getElementById('morphTimeline');
                if (timelineContainer && timelineInput) {
                    timelineContainer.style.display = 'flex';
                    timelineInput.value = 0; // 進化の起点（0）からスタート
                }
                cancelAnimationFrame(animationFrameId);
                animateMorph();
            } else {
                window.morphTimelineCache = null;
                const timelineContainer = document.getElementById('morph-timeline-container');
                if (timelineContainer) timelineContainer.style.display = 'none';
                drawPCA();
            }
        }
    }
'''
rep_part3 = '''\n    function interpolateAncestralGPA(leafIds) {
        let normLeafIds = leafIds.map(id => normalizeId(id));
        let targets = parsedMorphData.filter(d => normLeafIds.includes(normalizeId(d.id)) && d.gpaCoordinates);
        
        if (targets.length === 0) return null;
        
        let coordLength = targets[0].gpaCoordinates.length;
        let avgCoords = new Array(coordLength).fill(0);
        
        for (let i = 0; i < coordLength; i++) {
            let sum = 0;
            targets.forEach(t => {
                sum += (t.gpaCoordinates[i] || 0);
            });
            avgCoords[i] = sum / targets.length;
        }
        
        // [ [x1, y1], [x2, y2], ... ] のペア形式に変換
        let landmarkPairs = [];
        for (let i = 0; i < coordLength; i += 2) {
            landmarkPairs.push([avgCoords[i], avgCoords[i + 1]]);
        }
        return landmarkPairs;
    }

    function interpolateAncestralEFA(leafIds) {
        let normLeafIds = leafIds.map(id => normalizeId(id));
        let targets = parsedMorphData.filter(d => normLeafIds.includes(normalizeId(d.id)) && d.fullCoeffs);
        
        if (targets.length === 0) return null;
        
        let a = [], b = [], c = [], d_arr = [];
        let harmonics = targets[0].fullCoeffs.length; 
        
        for (let i = 0; i < harmonics; i++) {
            let sumA = 0, sumB = 0, sumC = 0, sumD = 0;
            targets.forEach(t => {
                sumA += t.fullCoeffs[i].a || 0;
                sumB += t.fullCoeffs[i].b || 0;
                sumC += t.fullCoeffs[i].c || 0;
                sumD += t.fullCoeffs[i].d || 0;
            });
            a.push(sumA / targets.length);
            b.push(sumB / targets.length);
            c.push(sumC / targets.length);
            d_arr.push(sumD / targets.length);
        }
        
        return {a, b, c, d: d_arr};
    }

    function drawGPAShape(ctx, points, cx, cy, radius) {
        if (!points || points.length === 0) return;
        
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (let pt of points) {
            if (pt[0] < minX) minX = pt[0]; if (pt[0] > maxX) maxX = pt[0];
            if (pt[1] < minY) minY = pt[1]; if (pt[1] > maxY) maxY = pt[1];
        }
        
        let rangeX = maxX - minX || 1;
        let rangeY = maxY - minY || 1;
        let scale = (radius * 2) / Math.max(rangeX, rangeY);
        let midX = (minX + maxX) / 2;
        let midY = (minY + maxY) / 2;
        
        // 1. 輪郭ポリゴンの描画
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
            let px = cx + (points[i][0] - midX) * scale;
            let py = cy + (points[i][1] - midY) * scale;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(142, 68, 173, 0.15)";
        ctx.fill();
        ctx.strokeStyle = "rgba(142, 68, 173, 0.9)";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        
        // 2. 各ランドマーク相同点（ドット）の描画
        for (let i = 0; i < points.length; i++) {
            let px = cx + (points[i][0] - midX) * scale;
            let py = cy + (points[i][1] - midY) * scale;
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#e74c3c';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }\n\n'''

replacement = rep_part1 + rep_part2 + rep_part3
new_content = content[:start_idx] + replacement + content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully replaced morphing logic!")

