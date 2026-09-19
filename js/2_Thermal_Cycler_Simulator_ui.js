// --- グローバル・ドロワー制御（ガイドライン第5項） ---
 function toggleSidebar() {
   const sidebar = document.querySelector('.sidebar');
   const overlay = document.querySelector('.sidebar-overlay');
   if(sidebar) sidebar.classList.toggle('open');
   if(overlay) overlay.classList.toggle('open');
 }

 // === カセット方式対応のための状態・定義 ===
 let currentModelId = "thermogen";

 const CYCLER_MODELS = {
 thermogen: {
 id: "thermogen",
 name: "ThermoGen QuickBath",
 renderHardwareHTML: function() {
 return `
 <div class="lcd-bezel">
 <div class="lcd-screen" id="lcdScreen">
 <!-- JavaScriptで動的生成 -->
 </div>
 </div>

 <div class="hardware-panel" style="position: relative; width: 460px; height: 252px; margin: 0 auto; background: #e8ecef; border: 2px solid #bdc3c7; border-radius: 12px; box-shadow: inset 0 2px 4px rgba(255,255,255,0.8), 0 4px 8px rgba(0,0,0,0.1);">

 <!-- LID HEAT テキスト -->
 <span style="position: absolute; top: 25px; left: 15px; font-size: 10px; font-weight: bold; color: #2c3e50; background: white; padding: 2px 6px; border-radius: 10px; border: 1px solid #ccc; z-index: 2;">LID HEAT</span>
 
 <!-- LID HEATランプ -->
 <div id="lidHeatLed" style="position: absolute; top: 48px; left: 73px; width: 8px; height: 8px; background: #2c3e50; border-radius: 50%; box-shadow: inset 0 1px 2px rgba(0,0,0,0.5);"></div>

 <!-- PAUSE/RUN -->
 <button class="hw-btn" style="position: absolute; top: 15px; left: 110px; width: 50px; height: 50px; border-radius: 50%; background: #3498db; color: white; font-size: 10px; font-weight: bold; border: 2px solid #2980b9; box-shadow: 0 4px 0 #1f618d; display: flex; flex-direction: column; line-height: 1.1;" onclick="navBtn('PAUSE_RUN')" data-tooltip="一時停止 / 開始">PAUSE<div style="width: 99%; height: 1px; background: white; margin: 2px 0;"></div>RUN</button>

 <!-- STOP -->
 <button class="hw-btn" style="position: absolute; top: 80px; left: 80px; width: 48px; height: 48px; border-radius: 50%; background: var(--danger); color: white; font-size: 11px; font-weight: bold; border: 2px solid #c0392b; box-shadow: 0 4px 0 #922b21;" onclick="pressStop()" data-tooltip="初期化">STOP</button>

 <!-- EXT -->
 <button class="hw-btn" style="position: absolute; top: 15px; left: 190px; width: 55px; height: 36px; background: #f0f3f4; color: #2c3e50; font-size: 13px; font-weight: bold; border: 1px solid #bdc3c7; box-shadow: 0 3px 0 #95a5a6; border-radius: 6px;" onmousedown="event.preventDefault();" onclick="navBtn('EXT')" data-tooltip="戻る">EXT</button>

 <!-- SEL -->
 <button class="hw-btn" style="position: absolute; top: 80px; left: 190px; width: 55px; height: 36px; background: #f0f3f4; color: #2c3e50; font-size: 13px; font-weight: bold; border: 1px solid #bdc3c7; box-shadow: 0 3px 0 #95a5a6; border-radius: 6px; display: flex; flex-direction: column; line-height: 1;" onmousedown="event.preventDefault();" onclick="navBtn('SEL')" data-tooltip="選択切替">SEL<span style="font-size: 10px;">⏏</span></button>

 <!-- 十字キー (ツールチップを撤廃) -->
 <button class="hw-btn" style="position: absolute; top: 112px; left: 135px; width: 42px; height: 42px; background: #f0f3f4; color: #2c3e50; font-size: 16px; border-radius: 50%; border: 1px solid #bdc3c7; box-shadow: 0 3px 0 #95a5a6;" onmousedown="event.preventDefault();" onclick="navBtn('UP')"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 19V5M5 12l7-7 7 7"/></svg>︎</button>
 <button class="hw-btn" style="position: absolute; top: 162px; left: 85px; width: 42px; height: 42px; background: #f0f3f4; color: #2c3e50; font-size: 16px; border-radius: 50%; border: 1px solid #bdc3c7; box-shadow: 0 3px 0 #95a5a6;" onmousedown="event.preventDefault();" onclick="navBtn('LEFT')"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>︎</button>
 <button class="hw-btn" style="position: absolute; top: 162px; left: 135px; width: 42px; height: 42px; background: #f0f3f4; color: #2c3e50; font-size: 16px; border-radius: 50%; border: 1px solid #bdc3c7; box-shadow: 0 3px 0 #95a5a6;" onmousedown="event.preventDefault();" onclick="navBtn('DOWN')"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>︎</button>
 <button class="hw-btn" style="position: absolute; top: 162px; left: 185px; width: 42px; height: 42px; background: #f0f3f4; color: #2c3e50; font-size: 16px; border-radius: 50%; border: 1px solid #bdc3c7; box-shadow: 0 3px 0 #95a5a6;" onmousedown="event.preventDefault();" onclick="navBtn('RIGHT')"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14M12 5l7 7-7 7"/></svg>︎</button>

 <!-- テンキー (0〜9 のツールチップを撤廃) -->
 <button class="hw-btn" style="position: absolute; top: 15px; left: 265px; width: 42px; height: 42px; background: #f0f3f4; color: #2c3e50; font-size: 20px; font-weight: bold; border-radius: 50%; border: 1px solid #bdc3c7; box-shadow: 0 3px 0 #95a5a6;" onmousedown="event.preventDefault();" onclick="typeNum('7')">7</button>
 <button class="hw-btn" style="position: absolute; top: 15px; left: 315px; width: 42px; height: 42px; background: #f0f3f4; color: #2c3e50; font-size: 20px; font-weight: bold; border-radius: 50%; border: 1px solid #bdc3c7; box-shadow: 0 3px 0 #95a5a6;" onmousedown="event.preventDefault();" onclick="typeNum('8')">8</button>
 <button class="hw-btn" style="position: absolute; top: 15px; left: 365px; width: 42px; height: 42px; background: #f0f3f4; color: #2c3e50; font-size: 20px; font-weight: bold; border-radius: 50%; border: 1px solid #bdc3c7; box-shadow: 0 3px 0 #95a5a6;" onmousedown="event.preventDefault();" onclick="typeNum('9')">9</button>

 <button class="hw-btn" style="position: absolute; top: 75px; left: 265px; width: 42px; height: 42px; background: #f0f3f4; color: #2c3e50; font-size: 20px; font-weight: bold; border-radius: 50%; border: 1px solid #bdc3c7; box-shadow: 0 3px 0 #95a5a6;" onmousedown="event.preventDefault();" onclick="typeNum('4')">4</button>
 <button class="hw-btn" style="position: absolute; top: 75px; left: 315px; width: 42px; height: 42px; background: #f0f3f4; color: #2c3e50; font-size: 20px; font-weight: bold; border-radius: 50%; border: 1px solid #bdc3c7; box-shadow: 0 3px 0 #95a5a6;" onmousedown="event.preventDefault();" onclick="typeNum('5')">5</button>
 <button class="hw-btn" style="position: absolute; top: 75px; left: 365px; width: 42px; height: 42px; background: #f0f3f4; color: #2c3e50; font-size: 20px; font-weight: bold; border-radius: 50%; border: 1px solid #bdc3c7; box-shadow: 0 3px 0 #95a5a6;" onmousedown="event.preventDefault();" onclick="typeNum('6')">6</button>

 <button class="hw-btn" style="position: absolute; top: 135px; left: 265px; width: 42px; height: 42px; background: #f0f3f4; color: #2c3e50; font-size: 20px; font-weight: bold; border-radius: 50%; border: 1px solid #bdc3c7; box-shadow: 0 3px 0 #95a5a6;" onmousedown="event.preventDefault();" onclick="typeNum('1')">1</button>
 <button class="hw-btn" style="position: absolute; top: 135px; left: 315px; width: 42px; height: 42px; background: #f0f3f4; color: #2c3e50; font-size: 20px; font-weight: bold; border-radius: 50%; border: 1px solid #bdc3c7; box-shadow: 0 3px 0 #95a5a6;" onmousedown="event.preventDefault();" onclick="typeNum('2')">2</button>
 <button class="hw-btn" style="position: absolute; top: 135px; left: 365px; width: 42px; height: 42px; background: #f0f3f4; color: #2c3e50; font-size: 20px; font-weight: bold; border-radius: 50%; border: 1px solid #bdc3c7; box-shadow: 0 3px 0 #95a5a6;" onmousedown="event.preventDefault();" onclick="typeNum('3')">3</button>

 <!-- CとENTは役割が明確ではない場合があるためツールチップを残す -->
 <button class="hw-btn" style="position: absolute; top: 195px; left: 265px; width: 42px; height: 42px; background: #f0f3f4; color: #2c3e50; font-size: 16px; font-weight: bold; border-radius: 50%; border: 1px solid #bdc3c7; box-shadow: 0 3px 0 #95a5a6;" onmousedown="event.preventDefault();" onclick="clearNum()" data-tooltip="クリア">C</button>
 <button class="hw-btn" style="position: absolute; top: 195px; left: 315px; width: 42px; height: 42px; background: #f0f3f4; color: #2c3e50; font-size: 20px; font-weight: bold; border-radius: 50%; border: 1px solid #bdc3c7; box-shadow: 0 3px 0 #95a5a6;" onmousedown="event.preventDefault();" onclick="typeNum('0')">0</button>
 <button class="hw-btn" style="position: absolute; top: 195px; left: 365px; width: 42px; height: 42px; background: #2980b9; color: white; font-size: 13px; font-weight: bold; border-radius: 6px; border: 1px solid #1f618d; box-shadow: 0 3px 0 #154360;" onmousedown="event.preventDefault();" onclick="navBtn('ENT')" data-tooltip="決定 / 編集">ENT</button>
 </div>`;
 },
 renderDisplayHTML: function(lcdData, rawInput) {
 let html = '';
 const c_opt = (idx) => lcdData.cursor === idx ? '<span class="blink">■</span>' : ' _';
 const c_arr = (idx) => lcdData.cursor === idx ? '<span class="blink">↓</span>' : '↓';
 const c_blank = (idx) => lcdData.cursor === idx ? '<span class="blink">■</span>' : ' ';

 const getStoreName = (idx) => {
 const realIdx = (lcdData.storePage || 0) * 6 + idx;
 return lcdData.storedPrograms[realIdx] ? lcdData.storedPrograms[realIdx].padEnd(4, ' ') : ' ';
 };

 const pNum = (lcdData.storePage || 0) + 1;
 let arrwList = pNum === 1 ? '→' : (pNum === 3 ? '←' : '←→');

 const v = (idx, origValue, isNumOnly = false) => {
 if(lcdData.cursor === idx && lcdData.editing) {
 if (lcdData.view === 'PART3' && idx === 3 && rawInput === '9999') {
 return `<span class="editing"> ∞ </span>`;
 }
 let pad = isNumOnly ? 2 : (origValue.includes(':') ? 5 : 4);
 if(pad === 5 && rawInput.length === 4) return `<span class="editing">${rawInput.slice(0,2)}:${rawInput.slice(2,4)}</span>`;
 return `<span class="editing">${rawInput.padEnd(pad, '_')}</span>`;
 }
 return origValue;
 };

 switch(lcdData.view) {
 case 'HOME': {
 html = ` ============= HOME MENU =============\n` +
 ` ${c_opt(0)}Run-ProgName [ ${lcdData.progName} ]\n` +
 ` ${c_opt(1)}StoredPrg ${c_opt(2)}Template\n` +
 ` ${c_opt(3)}Utility ${c_opt(4)}System\n` +
 ` `;
 break;
 }
 case 'TEMPLATE': {
 html = ` =========== Template Program ============\n` +
 ` ${c_opt(0)}Incu ${c_opt(1)}ST ${c_opt(2)}RT\n` +
 ` ${c_opt(3)}2S Incu ${c_opt(4)}AN ${c_opt(5)}TD\n` +
 ` ${c_opt(6)}3S Incu ${c_opt(7)}Edit\n` +
 ` `;
 break;
 }
 case 'SETUP': {
 html = ` Program Name- [ ${lcdData.progName} ]\n` +
 ` Sample ${c_blank(0)} ${v(0, lcdData.vol.padStart(2,'0'), true)}ul & ${c_blank(1)} ${v(1, lcdData.pcs.padStart(2,'0'), true)}Pcs\n` +
 ` Lid Heat - Rapid\n` +
 ` \n` +
 ` →`;
 break;
 }
 case 'PART1':
 case 'RUNNING':
 case 'PAUSE': {
 if (lcdData.view === 'RUNNING' || lcdData.view === 'PAUSE') {
 let deg = lcdData.view === 'RUNNING' ? '<span class="blink">°</span>' : '°';
 let stLabel = lcdData.view === 'PAUSE' ? ' PAUSE' : ' RUN ';
 let t1_run = lcdData.p1.t.padStart(4, ' ');
 html = `「${lcdData.progName}」 SV ↓ ${t1_run}°\n` +
 ` TM ↓ ${lcdData.p1.m}\n` +
 ` PV . ${deg}\n` +
 ` \n` +
 ` ${stLabel} ←→`;
 } else {
 let t1_1 = lcdData.p1.t.padStart(4, ' ');
 html = `「${lcdData.progName}」 SV ${c_arr(0)} ${v(0, t1_1)}°\n` +
 ` TM ${c_arr(1)} ${v(1, lcdData.p1.m)}\n` +
 ` PV . °\n` +
 ` \n` +
 ` ${c_opt(2)}RUN ${c_opt(3)}Store ←→`;
 }
 break;
 }
 case 'PART2': {
 let t2_1 = lcdData.p2.t1.padStart(4, ' ');
 let t2_2 = lcdData.p2.t2.padStart(4, ' ');
 let t2_3 = lcdData.p2.t3.padStart(4, ' ');
 html = `SV ${c_arr(0)} ${v(0, t2_1)}° ${c_arr(2)} ${v(2, t2_2)}° ${c_arr(4)} ${v(4, t2_3)}°\n` +
 `TM ${c_arr(1)} ${v(1, lcdData.p2.m1)} ${c_arr(3)} ${v(3, lcdData.p2.m2)} ${c_arr(5)} ${v(5, lcdData.p2.m3)}\n` +
 `PV . ° . ° . °\n` +
 ` \n` +
 ` 1h07m ${c_blank(6)} N= /${v(6, lcdData.p2.n.padStart(2,'0'), true)} ←→`;
 break;
 }
 case 'PART3': {
 let t3_1 = lcdData.p3.t1.padStart(4, ' ');
 let t3_2 = lcdData.p3.t2.padStart(4, ' ');
 let inf = lcdData.p3.m2 === '∞' ? ' ∞ ' : lcdData.p3.m2.padStart(5, ' '); 
 html = `SV ${c_arr(0)} ${v(0, t3_1)}° ${c_arr(2)} ${v(2, t3_2)}°\n` +
 `TM ${c_arr(1)} ${v(1, lcdData.p3.m1)} ${c_arr(3)} ${v(3, inf)}\n` +
 `PV . ° . °\n` +
 ` \n` +
 ` ${c_opt(4)}RUN ${c_opt(5)}Store ←`;
 break;
 }
 case 'STORE_LIST':
 case 'STORE_SAVE_SELECT': {
 let padArrw = pNum === 1 ? ' ' : (pNum === 3 ? ' ' : ' ');
 let padArrwSel = pNum === 1 ? ' ' : (pNum === 3 ? ' ' : ' ');
 html = ` =========== Stored Program-${pNum} ============\n` +
 ` ${c_opt(0)} ${getStoreName(0)} ${c_opt(1)} ${getStoreName(1)}\n` +
 ` ${c_opt(2)} ${getStoreName(2)} ${c_opt(3)} ${getStoreName(3)}\n` +
 ` ${c_opt(4)} ${getStoreName(4)} ${c_opt(5)} ${getStoreName(5)}\n`;
 if(lcdData.view === 'STORE_LIST') {
 html += ` ${c_opt(6)}RUN ${c_opt(7)}Edit ${c_opt(8)}Del.${padArrw}${arrwList}`;
 } else {
 html += `${padArrwSel}${arrwList}`;
 }
 break;
 }
 case 'STORE_NAME_INPUT': {
 let nArr = lcdData.saveName.padEnd(4, '0').split('');
 let nDisp = nArr.map((c, i) => i === lcdData.saveNameCursor ? `<span class="blink">${c}</span>` : c).join('');
 html = ` ---------------- Store ----------------\n` +
 ` Program Name- ${nDisp}\n` +
 ` ex) AZ09 A→Z or Z→A\n` +
 ` \n` +
 ` Press ↑ / ↓ & No, →→ENT`;
 break;
 }
 case 'STORE_CONFIRM': {
 html = ` ---------------- Store ----------------\n` +
 ` Program Name- ${lcdData.progName}\n` +
 ` Overwrite ?\n` +
 ` \n` +
 ` ${c_opt(0)} Yes ${c_opt(1)} No`;
 break;
 }
 case 'STORE_DEL_CONFIRM': {
 html = ` ---------------- Delete ---------------\n` +
 ` Program Name- ${lcdData.storedPrograms[lcdData.selectedStoreSlot] || ''}\n` +
 ` Delete ?\n` +
 ` \n` +
 ` ${c_opt(0)} Yes ${c_opt(1)} No`;
 break;
 }
 case 'STANDBY_CONFIRM': {
 html = ` ***************************************\n` +
 ` Standby?\n` +
 ` \n` +
 ` ${c_opt(0)} Yes ${c_opt(1)} No\n` +
 ` ***************************************`;
 break;
 }
 case 'LID_HEATING': {
 let curTemp = lcdData.lidTemp.toFixed(1).padStart(5, ' ');
 html = ` ***************************************\n` +
 ` Please Wait\n` +
 ` Lid is heating ${curTemp}°\n` +
 ` _No Set Temp. 105.0°\n` +
 ` ***************************************`;
 break;
 }
 case 'STOP_CONFIRM': {
 html = ` ***************************************\n` +
 ` Stop ?\n` +
 ` \n` +
 ` ${c_opt(0)} Yes ${c_opt(1)} No\n` +
 ` ***************************************`;
 break;
 }
 }
 return `<div class="lcd-content">${html}</div>`;
 }
 },
 takara_dice: {
 id: "takara_dice",
 name: "TaKaRa Thermal Cycler Dice Type",
 renderHardwareHTML: function() {
 return `
 <div class="lcd-bezel" style="width: 480px; padding: 15px; background: #2f3640; border-radius: 12px; border: 2px solid #7f8fa6;">
 <!-- TaKaRa風のカラー液晶ディスプレイ領域 -->
 <div id="lcdScreen" style="background: #f5f6fa; width: 100%; height: 260px; border-radius: 8px; border: 2px solid #192a56; overflow: hidden; position: relative;">
 <!-- ここに renderDisplayHTML の結果が流し込まれる -->
 </div>
 </div>

 <div class="hardware-panel" style="width: 480px; height: 100px; margin: 15px auto 0; display: flex; justify-content: space-between; align-items: center; padding: 0 30px;">
 <div style="color: #7f8fa6; font-size: 14px; font-weight: bold;">TaKaRa Dice Type</div>
 
 <!-- 物理ボタンは少なく、大きなRUN/STOPボタンを配置 -->
 <div style="display: flex; gap: 15px;">
 <button class="hw-btn" style="width: 60px; height: 60px; border-radius: 50%; background: #44bd32; color: white; font-size: 12px; font-weight: bold; border: 2px solid #4cd137; box-shadow: 0 4px 0 #27ae60;" onclick="navBtn('PAUSE_RUN')">START</button>
 <button class="hw-btn" style="width: 60px; height: 60px; border-radius: 50%; background: #e84118; color: white; font-size: 12px; font-weight: bold; border: 2px solid #c23616; box-shadow: 0 4px 0 #c23616;" onclick="pressStop()">STOP</button>
 </div>
 </div>
 `;
 },
 renderDisplayHTML: function(lcdData, rawInput) {
 let status = (lcdData.view === 'RUNNING') ? '<span style="color: #e84118; animation: blinker 1s step-end infinite;">▶ RUNNING</span>' : '■ STANDBY';
 
 return `
 <div style="width: 100%; height: 100%; padding: 15px; color: #2f3640; font-family: sans-serif; display: flex; flex-direction: column;">
 <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #dcdde1; padding-bottom: 10px; margin-bottom: 10px;">
 <strong style="font-size: 16px;">Program: ${lcdData.progName}</strong>
 <strong style="font-size: 16px;">${status}</strong>
 </div>
 
 <div style="display: flex; gap: 10px; flex: 1; align-items: flex-end; padding-bottom: 20px;">
 <!-- 各ステップをブロック風に表示 -->
 <div style="background: #00a8ff; color: white; padding: 10px; border-radius: 6px; text-align: center; font-size: 12px;">
 <strong>INIT</strong><br>${lcdData.p1.t}℃<br>${lcdData.p1.m}
 </div>
 <div style="background: #e1b12c; color: white; padding: 10px; border-radius: 6px; text-align: center; font-size: 12px;">
 <strong>DENAT</strong><br>${lcdData.p2.t1}℃<br>${lcdData.p2.m1}
 </div>
 <div style="background: #4cd137; color: white; padding: 10px; border-radius: 6px; text-align: center; font-size: 12px;">
 <strong>ANNEAL</strong><br>${lcdData.p2.t2}℃<br>${lcdData.p2.m2}
 </div>
 <div style="background: #9c88ff; color: white; padding: 10px; border-radius: 6px; text-align: center; font-size: 12px;">
 <strong>EXTEND</strong><br>${lcdData.p2.t3}℃<br>${lcdData.p2.m3}
 </div>
 </div>
 
 <div style="text-align: right; font-size: 12px; color: #7f8fa6;">
 Cycles: ${lcdData.p2.n} / Volume: ${lcdData.vol}µL
 </div>
 
 <!-- ※次回のStep3でここにCanvasを埋め込みます -->
 <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(255,255,255,0.7); display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 20px; color: #2f3640; opacity: 0; pointer-events: none;">
 [ Next Phase: Interactive Graph ]
 </div>
 </div>
 `;
 }
 }
 };

 // --- カスタムツールチップ初期化（ガイドライン第5項④ 準拠 / ネイティブ title 属性は使用禁止） ---
 function initTooltips() {
 if (document.getElementById('__bes_tooltip')) return; // 二重初期化を防ぐ
 const tooltip = document.createElement('div');
 tooltip.id = '__bes_tooltip';
 tooltip.className = 'custom-tooltip';
 document.body.appendChild(tooltip);

 document.body.addEventListener('mouseover', (e) => {
 const target = e.target.closest('[data-tooltip]');
 if (target && !target.classList.contains('rationale-btn')) {
 tooltip.innerHTML = target.getAttribute('data-tooltip');
 tooltip.style.display = 'block';
 const rect = target.getBoundingClientRect();
 const ttRect = tooltip.getBoundingClientRect();
 let topPos = rect.top - ttRect.height - 8;
 let leftPos = rect.left + (rect.width / 2);
 let arrowClass = 'show-top';
 if (topPos < 0) { topPos = rect.bottom + 8; arrowClass = 'show-bottom'; }
 if (leftPos - ttRect.width / 2 < 5) leftPos = 5 + ttRect.width / 2;
 else if (leftPos + ttRect.width / 2 > window.innerWidth - 5) leftPos = window.innerWidth - ttRect.width / 2 - 5;
 tooltip.className = `custom-tooltip ${arrowClass}`;
 tooltip.style.top = topPos + 'px';
 tooltip.style.left = leftPos + 'px';
 tooltip.style.transform = 'translateX(-50%)';
 tooltip.style.opacity = '1';
 }
 });
 document.body.addEventListener('mouseout', (e) => {
 if (e.target.closest('[data-tooltip]')) {
 tooltip.style.opacity = '0';
 setTimeout(() => { if (tooltip.style.opacity === '0') tooltip.style.display = 'none'; }, 200);
 }
 });
 document.addEventListener('scroll', () => {
 tooltip.style.opacity = '0'; tooltip.style.display = 'none';
 }, true);
 }

 // --- トースト通知（ガイドライン第5項⑤ 準拠 / alert() は使用禁止） ---
 // type: ""(=成功/緑) | "error" | "warning" | "info"。'success' 等の未知値は既定の緑にフォールバックする
 function showToast(msg, type = "") {
 const toast = document.getElementById('toast');
 if (!toast) return;
 toast.innerText = msg;
 let className = "show";
 if (type === "error") className += " error";
 else if (type === "warning") className += " warning";
 else if (type === "info") className += " info";
 toast.className = "";
 void toast.offsetWidth; // リフローを挟み、連続表示でもアニメーションを再生させる
 toast.className = className;
 setTimeout(() => { toast.classList.remove("show"); }, 3000);
 }

 function handleVolInput(inputEl) {
 const valStr = inputEl.value;
 if (valStr.includes('.')) {
 const decimalPart = valStr.split('.')[1];
 if (decimalPart && decimalPart.length > 1) {
 showToast('手動ピペッティングでは誤差が大きいため、0.1µL単位を推奨します', 'error');
 }
 }
 calculateVol();
 }

 function handleVolChange(inputEl) {
 let val = parseFloat(inputEl.value);
 if (!isNaN(val)) {
 if (Number.isInteger(val) || val.toString().split('.')[1].length === 1) {
 inputEl.value = val.toFixed(1);
 }
 }
 calculateVol();
 }

 function importFromApp1() {
 try {
 const dataStr = localStorage.getItem('bio_edu_mm_data');
 if (dataStr) {
 const data = JSON.parse(dataStr);
 
 const enzymeMap = {
 'premix': 'KODOne',
 'buf5x': 'PrimeSTAR',
 'buf10x': 'ExTaq'
 };
 if (data.enzyme && enzymeMap[data.enzyme]) {
 document.getElementById('enzymeSelect').value = enzymeMap[data.enzyme];
 updateRecipe();
 }
 
 if (data.totalVol) {
 const targetVol = parseFloat(data.totalVol);
 const defaultVol = (data.enzyme === 'premix') ? 20 : 50;
 const ratio = targetVol / defaultVol; 

 const inputs = document.querySelectorAll('.reagent-input');
 inputs.forEach(input => {
 input.value = (parseFloat(input.value) * ratio).toFixed(2);
 });
 calculateVol();
 
 lcdData.vol = Math.round(targetVol).toString();
 if(lcdData.view === 'SETUP') renderLCD();
 }

 showToast(`アプリ1のデータを同期しました (酵素: ${enzymeMap[data.enzyme]}, 液量: ${data.totalVol}µL)`, 'success');
 } else {
 showToast('アプリ1の保存データが見つかりません。手動で入力してください。', 'error');
 }
 } catch(e) {
 showToast('データの読み込みに失敗しました', 'error');
 }
 }

 // --- 教育的UIモジュール①: 根拠ポップオーバー（ガイドライン第5項① 準拠 / フリップ計算付き絶対配置） ---
 function toggleRationale(event, id) {
 event.stopPropagation();
 const el = document.getElementById(id);
 const btn = event.currentTarget;
 const isShown = el.classList.contains('show');

 // 他のポップオーバーを閉じる
 document.querySelectorAll('.rationale-text').forEach(e => {
    e.classList.remove('show', 'arrow-top', 'arrow-bottom');
 });

 if(!isShown) {
 if (el.parentNode !== document.body) document.body.appendChild(el);
 el.style.top = '0px'; el.style.left = '0px';
 el.classList.add('show');

 // フリップ計算による絶対配置 (offsetWidthを用いた親要素追従)
 const elHeight = el.offsetHeight;
 const elWidth = el.offsetWidth;
 const rect = btn.getBoundingClientRect(); 

 let topPos = rect.bottom + 12;
 let arrowClass = 'arrow-top';

 // 画面下端に見切れる場合は上側に配置
 if (rect.bottom + elHeight + 20 > window.innerHeight) {
 topPos = rect.top - elHeight - 12;
 arrowClass = 'arrow-bottom';
 }
 el.classList.add(arrowClass);
 el.style.top = topPos + 'px';

 // 左右位置の調整 (offsetWidth を使用してはみ出し防止)
 let leftPos = rect.left - (elWidth / 2) + (rect.width / 2);
 if (leftPos + elWidth > window.innerWidth) leftPos = window.innerWidth - elWidth - 10;
 if (leftPos < 10) leftPos = 10;
 el.style.left = leftPos + 'px';

 // 尻尾の水平位置をボタン中央に合わせるカスタムプロパティ
 const arrowOffset = rect.left - leftPos + (rect.width / 2) - 6;
 el.style.setProperty('--arrow-left', arrowOffset + 'px');
 }
 }

 // 外部クリック・スクロールで閉じる
 document.addEventListener('click', (e) => {
 if (!e.target.closest('.rationale-text') && !e.target.closest('.rationale-btn')) {
 document.querySelectorAll('.rationale-text').forEach(el => {
    el.classList.remove('show', 'arrow-top', 'arrow-bottom');
 });
 }
 });

 document.addEventListener('scroll', () => {
 document.querySelectorAll('.rationale-text').forEach(el => {
    el.classList.remove('show', 'arrow-top', 'arrow-bottom');
 });
 }, true);

 const recipes = {
 KODOne: {
 guide: "標準反応液量: 20 µL (Master Mix仕様)",
 items: [
 { id: 'rDw', label: 'DW (滅菌水):', default: 6.0 },
 { id: 'rMix', label: '2x KOD Master Mix:', default: 10.0 },
 { id: 'rPriF', label: 'Primer F (10µM):', default: 1.0 },
 { id: 'rPriR', label: 'Primer R (10µM):', default: 1.0 },
 { id: 'rDna', label: 'DNA (抽出液):', default: 2.0 }
 ]
 },
 PrimeSTAR: {
 guide: "標準反応液量: 50 µL (個別添加仕様)",
 items: [
 { id: 'rDw', label: 'DW (滅菌水):', default: 31.0 },
 { id: 'rBuf', label: '5x GXL Buffer:', default: 10.0 },
 { id: 'rDntp', label: 'dNTP Mixture:', default: 4.0 },
 { id: 'rPriF', label: 'Primer F (10µM):', default: 1.0 },
 { id: 'rPriR', label: 'Primer R (10µM):', default: 1.0 },
 { id: 'rEnz', label: 'PrimeSTAR 酵素:', default: 1.0 },
 { id: 'rDna', label: 'DNA (抽出液):', default: 2.0 }
 ]
 },
 ExTaq: {
 guide: "標準反応液量: 50 µL (個別添加仕様)",
 items: [
 { id: 'rDw', label: 'DW (滅菌水):', default: 36.75 },
 { id: 'rBuf', label: '10x ExTaq Buffer:', default: 5.0 },
 { id: 'rDntp', label: 'dNTP Mixture:', default: 4.0 },
 { id: 'rPriF', label: 'Primer F (10µM):', default: 1.0 },
 { id: 'rPriR', label: 'Primer R (10µM):', default: 1.0 },
 { id: 'rEnz', label: 'Ex Taq 酵素:', default: 0.25 },
 { id: 'rDna', label: 'DNA (抽出液):', default: 2.0 }
 ]
 }
 };

 function updateRecipe() {
 const val = document.getElementById('enzymeSelect').value;
 const annealHintEl = document.getElementById('annealHintText');
 const guideEl = document.getElementById('volGuideText');
 const gridEl = document.getElementById('reagentGrid');
 
 if(val === 'KODOne') {
 lcdData.progName = 'ST00';
 annealHintEl.innerHTML = "KOD Oneは、アニーリング基準値(Tm平均)と同じ温度に設定します。";
 } else if(val === 'PrimeSTAR') {
 lcdData.progName = 'PR00';
 annealHintEl.innerHTML = "Taq系酵素は、アニーリング基準値(Tm平均)を参考にしつつ55〜60℃に設定します。";
 } else if(val === 'ExTaq') {
 lcdData.progName = 'EX00';
 annealHintEl.innerHTML = "一般的なTaqは、アニーリング基準値(Tm平均)を参考にしつつ50〜60℃に設定します。";
 }

 const rData = recipes[val];
 guideEl.innerText = rData.guide;
 
 let html = '';
 rData.items.forEach(item => {
 html += `<span>${item.label}</span><input type="number" step="0.1" class="reagent-input" value="${Number(item.default).toFixed(1)}" oninput="handleVolInput(this)" onchange="handleVolChange(this)" inputmode="decimal">`;
 });
 html += `<span class="reagent-total">合計液量:</span><div class="reagent-total" id="rTotal">-- µL</div>`;
 gridEl.innerHTML = html;
 
 calculateVol(); 
 renderLCD();
 updateAssistPanel();
 }

 function calculateVol() {
 const inputs = document.querySelectorAll('.reagent-input');
 let total = 0;
 inputs.forEach(input => { total += parseFloat(input.value) || 0; });
 document.getElementById('rTotal').innerText = total.toFixed(2) + " µL";
 updateAssistPanel();
 return total;
 }

 function updateCycleHint() {
 const val = document.getElementById('sampleSelect').value;
 const hintEl = document.getElementById('cycleHintText');
 if(val === 'meat_mt') {
 hintEl.innerHTML = "mtDNAは細胞内に多コピー存在します。増えすぎを防ぐため 25〜30回 が推奨です。";
 } else if(val === 'genomic') {
 hintEl.innerHTML = "ゲノムDNAはターゲットの割合が非常に低いため、30〜35回 しっかり回す必要があります。";
 } else if(val === 'plasmid') {
 hintEl.innerHTML = "プラスミドはターゲット濃度が極めて高いため、20〜25回 の少ないサイクルで十分です。";
 }
 updateAssistPanel();
 }

 function calculateTm() {
 
 let tmF = window.BioMath.calculateTmWallace(document.getElementById('primerF').value.toUpperCase().replace(/[^ATGC]/g, ''));
 let tmR = window.BioMath.calculateTmWallace(document.getElementById('primerR').value.toUpperCase().replace(/[^ATGC]/g, ''));
 let avg = (tmF + tmR) / 2;
 
 document.getElementById('tmValueDisplay').innerText = `F: ${tmF > 0 ? tmF.toFixed(1) : '--.-'}℃ / R: ${tmR > 0 ? tmR.toFixed(1) : '--.-'}℃`;
 document.getElementById('tmAvgDisplay').innerText = avg > 0 ? `${avg.toFixed(1)} ℃` : "--.- ℃";

 const primerData = {
 primerF: document.getElementById('primerF').value.trim(),
 primerR: document.getElementById('primerR').value.trim()
 };
 localStorage.setItem('bio_edu_primer_data', JSON.stringify(primerData));
 updateAssistPanel();
 }

 function switchAssistTab(tabId) {
 document.querySelectorAll('.assist-tab').forEach(btn => btn.classList.remove('active'));
 document.querySelectorAll('.assist-tab-content').forEach(content => {
 content.classList.remove('active');
 content.style.display = 'none';
 });
 
 event.currentTarget.classList.add('active');
 const target = document.getElementById('tab-' + tabId);
 target.classList.add('active');
 target.style.display = 'flex';
 }

 function updateAssistPanel() {
 const enz = document.getElementById('enzymeSelect').value;
 const len = parseInt(document.getElementById('targetLength').value) || 0;
 const sample = document.getElementById('sampleSelect').value;
 const avgTm = parseFloat(document.getElementById('tmAvgDisplay').innerText) || 0;

 let denat, anneal, extend, cycle;

 if (enz === 'KODOne') {
 denat = '98.0℃ / 00:10';
 anneal = (avgTm > 0 ? avgTm.toFixed(1) : 'Tm平均') + '℃ / 00:05';
 let extSec = Math.max(1, Math.ceil(len / 1000));
 extend = '68.0℃ / 00:' + extSec.toString().padStart(2, '0');
 } else if (enz === 'PrimeSTAR') {
 denat = '98.0℃ / 00:10';
 anneal = (avgTm > 0 ? `55〜60℃ (目安${avgTm.toFixed(1)}℃)` : '55〜60℃') + ' / 00:15〜';
 let extMin = Math.ceil(len / 1000);
 extend = '68.0℃ / ' + extMin.toString().padStart(2, '0') + ':00';
 } else {
 denat = '94〜98℃ / 00:10〜30';
 anneal = (avgTm > 0 ? `50〜60℃ (目安${avgTm.toFixed(1)}℃)` : '50〜60℃') + ' / 00:30';
 let extMin = Math.ceil(len / 1000);
 extend = '72.0℃ / ' + extMin.toString().padStart(2, '0') + ':00';
 }

 if (sample === 'meat_mt') cycle = '25〜30 回';
 else if (sample === 'genomic') cycle = '30〜35 回';
 else cycle = '20〜25 回';

 const elInit = document.getElementById('ast-init');
 if(elInit) elInit.innerText = 'DENATと同じ℃ / 02:00等';
 const elDenat = document.getElementById('ast-denat');
 if(elDenat) elDenat.innerText = denat;
 const elAnn = document.getElementById('ast-ann');
 if(elAnn) elAnn.innerText = anneal;
 const elExt = document.getElementById('ast-ext');
 if(elExt) elExt.innerText = extend;
 const elCyc = document.getElementById('ast-cyc');
 if(elCyc) elCyc.innerText = cycle;
 const elFin = document.getElementById('ast-fin');
 if(elFin) elFin.innerText = 'EXTENDと同じ℃ / 01:00〜05:00';
 }

 let lcdData = {
 view: 'HOME', // HOME, TEMPLATE, SETUP, PART1, PART2, PART3
 cursor: 0, // 初期カーソルをRun-ProgName(0)に設定
 editing: false,
 justEnteredEdit: false, // 編集モードに入った直後かどうかのフラグ
 progName: 'ST00',
 saveName: 'ST00',
 saveNameCursor: 0,
 selectedStoreSlot: 0,
 storePage: 0,
 storedPrograms: ['SK57', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
 vol: "20", pcs: "01",
 p1: { t: "94.0", m: "02:00" },
 p2: { t1: "98.0", m1: "00:10", t2: "60.0", m2: "00:05", t3: "68.0", m3: "00:05", n: "30" },
 p3: { t1: "68.0", m1: "02:00", t2: "4.0", m2: "∞" },
 lidTemp: 25.0,
 lidHeatingDone: false
 };
 
 let rawInput = ""; 
 let runTimer = null;
 let lidTimer = null;

 window.onload = function() { 
 initTooltips(); // ツールチップ初期化を必ず呼ぶ（ガイドライン第6項）
 updateRecipe(); 
 calculateTm(); 
 const hwContainer = document.getElementById('cycler-hardware-container');
 if(hwContainer) {
 hwContainer.innerHTML = CYCLER_MODELS[currentModelId].renderHardwareHTML();
 }
 renderLCD();
 updateAssistPanel();
 };

 function renderLCD() {
 const screen = document.getElementById('lcdScreen');
 if(!screen) return;
 const model = CYCLER_MODELS[currentModelId];
 screen.innerHTML = model.renderDisplayHTML(lcdData, rawInput);
 }

 function switchModel(modelId) {
 if (!CYCLER_MODELS[modelId]) return;
 currentModelId = modelId;
 
 const hwContainer = document.getElementById('cycler-hardware-container');
 if(hwContainer) {
 hwContainer.innerHTML = CYCLER_MODELS[currentModelId].renderHardwareHTML();
 }
 
 renderLCD();
 showToast(`${CYCLER_MODELS[modelId].name} に切り替えました`, 'success');
 }

 const getTarget = () => {
 const t = (path, type) => ({path, type}); 
 if(lcdData.view === 'SETUP') {
 return lcdData.cursor === 0 ? t(['vol'],'num') : (lcdData.cursor === 1 ? t(['pcs'],'num') : null);
 }
 if(lcdData.view === 'PART1') {
 return lcdData.cursor === 0 ? t(['p1','t'],'temp') : (lcdData.cursor === 1 ? t(['p1','m'],'time') : null);
 }
 if(lcdData.view === 'PART2') {
 const m = [t(['p2','t1'],'temp'), t(['p2','m1'],'time'), t(['p2','t2'],'temp'), t(['p2','m2'],'time'), t(['p2','t3'],'temp'), t(['p2','m3'],'time'), t(['p2','n'],'num')];
 return m[lcdData.cursor] || null;
 }
 if(lcdData.view === 'PART3') {
 const m = [t(['p3','t1'],'temp'), t(['p3','m1'],'time'), t(['p3','t2'],'temp'), t(['p3','m2'],'time')];
 return m[lcdData.cursor] || null;
 }
 return null;
 }

 function saveValue(target, val) {
 if(!val) return;
 let formatted = val;
 let type = target.type;
 
 if (target.path[0] === 'p3' && target.path[1] === 'm2' && val === '9999') {
 formatted = '∞';
 } else if(type === 'temp') {
 if(val.length <= 2) formatted = val + ".0";
 else formatted = val.slice(0, -1) + "." + val.slice(-1);
 } else if (type === 'time') {
 if (val === '∞') {
 formatted = '∞';
 } else {
 let padded = val.padStart(4, '0');
 formatted = padded.slice(0,2) + ":" + padded.slice(2,4);
 }
 } else {
 formatted = val;
 }

 if(target.path.length === 1) lcdData[target.path[0]] = formatted;
 else if(target.path.length === 2) lcdData[target.path[0]][target.path[1]] = formatted;
 }

 function navBtn(dir) {
 if (dir === 'PAUSE_RUN') {
 if (lcdData.view === 'LID_HEATING') return;
 if (lcdData.view === 'PAUSE') {
 if (!lcdData.lidHeatingDone) {
 resumeLidHeating();
 } else {
 lcdData.view = 'RUNNING';
 renderLCD();
 runTimer = setTimeout(runPCR, 2000);
 }
 return;
 } else if (lcdData.view === 'RUNNING') {
 lcdData.view = 'PAUSE';
 if(runTimer) clearTimeout(runTimer);
 renderLCD();
 return;
 } else if (['PART1', 'PART2', 'PART3', 'HOME', 'STORE_LIST', 'SETUP'].includes(lcdData.view)) {
 lcdData.view = 'STANDBY_CONFIRM';
 lcdData.cursor = 1;
 renderLCD();
 return;
 }
 return;
 }
 
 if (dir === 'EXT') {
 if(lcdData.view === 'LID_HEATING') return;
 if(lcdData.editing) return;
 if(lcdData.view === 'PART3') { lcdData.view = 'PART2'; lcdData.cursor = 0; }
 else if(lcdData.view === 'PART2') { lcdData.view = 'PART1'; lcdData.cursor = 0; }
 else if(lcdData.view === 'PART1') { lcdData.view = 'SETUP'; lcdData.cursor = 0; }
 else if(lcdData.view === 'SETUP') { lcdData.view = 'TEMPLATE'; lcdData.cursor = 0; } 
 else if(lcdData.view === 'TEMPLATE') { lcdData.view = 'HOME'; lcdData.cursor = 0; }
 else if(lcdData.view === 'STORE_SAVE_SELECT') { lcdData.view = 'PART1'; lcdData.cursor = 3; }
 else if(lcdData.view === 'STORE_NAME_INPUT') { lcdData.view = 'STORE_SAVE_SELECT'; lcdData.cursor = 0; }
 else if(lcdData.view === 'STORE_CONFIRM') { lcdData.view = 'STORE_NAME_INPUT'; lcdData.saveNameCursor = 0; }
 else if(lcdData.view === 'STORE_LIST' || lcdData.view === 'STORE_DEL_CONFIRM') { lcdData.view = 'HOME'; lcdData.cursor = 1; }
 else if(lcdData.view === 'STANDBY_CONFIRM') { lcdData.view = 'HOME'; lcdData.cursor = 0; }
 else if(lcdData.view === 'STOP_CONFIRM') { lcdData.view = 'PAUSE'; }
 renderLCD();
 return;
 }

 if (dir === 'SEL') {
 if(lcdData.view === 'LID_HEATING') return;
 if(lcdData.editing) return;
 if(lcdData.view === 'HOME') {
 lcdData.cursor = lcdData.cursor === 2 ? 1 : 2;
 } else if (lcdData.view === 'TEMPLATE') {
 lcdData.cursor = lcdData.cursor === 7 ? 1 : 7;
 } else if (lcdData.view === 'PART1') {
 lcdData.cursor = lcdData.cursor === 3 ? 2 : 3;
 } else if (lcdData.view === 'PART3') {
 lcdData.cursor = lcdData.cursor === 5 ? 4 : 5;
 } else if (lcdData.view === 'STORE_SAVE_SELECT') {
 lcdData.cursor = (lcdData.cursor + 1) % 6;
 } else if (lcdData.view === 'STORE_LIST') {
 if (lcdData.cursor <= 5) {
 lcdData.cursor = (lcdData.cursor + 1) % 6;
 } else {
 lcdData.cursor = lcdData.cursor === 4 ? 2 : lcdData.cursor + 1;
 }
 } else if (lcdData.view === 'STORE_CONFIRM' || lcdData.view === 'STORE_DEL_CONFIRM' || lcdData.view === 'STANDBY_CONFIRM' || lcdData.view === 'STOP_CONFIRM') {
 lcdData.cursor = lcdData.cursor === 0 ? 1 : 0;
 }
 renderLCD();
 return;
 }

 if(dir === 'ENT') {
 if(lcdData.view === 'HOME') {
 if(lcdData.cursor === 0) { 
 lcdData.view = 'STANDBY_CONFIRM'; lcdData.cursor = 1; 
 }
 else if(lcdData.cursor === 2) { lcdData.view = 'TEMPLATE'; lcdData.cursor = 0; }
 else if(lcdData.cursor === 1) { 
 lcdData.view = 'STORE_LIST'; 
 lcdData.cursor = 0; 
 lcdData.storePage = 0;
 }
 else showToast('シミュレーターでは「Template」または「StoredPrg」を選択してください', 'error');
 } else if(lcdData.view === 'TEMPLATE') {
 if(lcdData.cursor === 7) { 
 lcdData.view = 'SETUP'; lcdData.cursor = 0; 
 } else {
 const tempNames = ['Incu', 'ST', 'RT', '2S Incu', 'AN', 'TD', '3S Incu'];
 showToast(`テンプレート「${tempNames[lcdData.cursor]}」を選択しました。続いて「Edit」を選択して決定してください`, 'success');
 }
 } else {
 const target = getTarget();
 if(target) {
 if(lcdData.editing) {
 saveValue(target, rawInput);
 lcdData.editing = false;
 rawInput = "";
 } else {
 lcdData.editing = true;
 lcdData.justEnteredEdit = true; // ENTを押して編集モードに入った直後フラグを立てる
 let curVal = target.path.length === 1 ? lcdData[target.path[0]] : lcdData[target.path[0]][target.path[1]];
 rawInput = curVal.replace(/\.|:/g, '');
 if(rawInput === '∞') rawInput = '';
 }
 } else {
 if(lcdData.view === 'PART1' && lcdData.cursor === 2) { lcdData.view = 'STANDBY_CONFIRM'; lcdData.cursor = 1; }
 else if(lcdData.view === 'PART1' && lcdData.cursor === 3) { 
 lcdData.view = 'STORE_SAVE_SELECT'; 
 lcdData.cursor = 0; 
 lcdData.storePage = 0; 
 }
 else if(lcdData.view === 'PART3' && lcdData.cursor === 4) { lcdData.view = 'STANDBY_CONFIRM'; lcdData.cursor = 1; }
 else if(lcdData.view === 'PART3' && lcdData.cursor === 5) { 
 lcdData.view = 'STORE_SAVE_SELECT'; 
 lcdData.cursor = 0; 
 lcdData.storePage = 0; 
 }
 
 else if(lcdData.view === 'STORE_SAVE_SELECT') {
 lcdData.selectedStoreSlot = (lcdData.storePage || 0) * 6 + lcdData.cursor;
 lcdData.view = 'STORE_NAME_INPUT';
 lcdData.saveName = lcdData.progName.padEnd(4, '0').substring(0,4);
 lcdData.saveNameCursor = 0;
 }
 else if(lcdData.view === 'STORE_NAME_INPUT') {
 lcdData.view = 'STORE_CONFIRM';
 lcdData.cursor = 0;
 }
 else if(lcdData.view === 'STORE_CONFIRM') {
 if(lcdData.cursor === 0) {
 showToast(`プログラム「${lcdData.saveName}」を保存しました`, 'success');
 lcdData.progName = lcdData.saveName;
 lcdData.storedPrograms[lcdData.selectedStoreSlot] = lcdData.saveName;
 }
 lcdData.view = 'HOME'; lcdData.cursor = 0;
 }

 else if(lcdData.view === 'STORE_LIST') {
 if(lcdData.cursor >= 0 && lcdData.cursor <= 5) {
 lcdData.selectedStoreSlot = (lcdData.storePage || 0) * 6 + lcdData.cursor;
 lcdData.cursor = 6; 
 showToast('対象プログラムを選択しました', 'success');
 }
 else if(lcdData.cursor === 6) {
 if(lcdData.storedPrograms[lcdData.selectedStoreSlot]) {
 lcdData.progName = lcdData.storedPrograms[lcdData.selectedStoreSlot];
 lcdData.view = 'STANDBY_CONFIRM'; lcdData.cursor = 1;
 } else showToast('空のスロットです', 'error');
 }
 else if(lcdData.cursor === 7) {
 if(lcdData.storedPrograms[lcdData.selectedStoreSlot]) {
 lcdData.progName = lcdData.storedPrograms[lcdData.selectedStoreSlot];
 lcdData.view = 'SETUP'; lcdData.cursor = 0;
 } else showToast('空のスロットです', 'error');
 }
 else if(lcdData.cursor === 8) {
 if(lcdData.storedPrograms[lcdData.selectedStoreSlot]) {
 lcdData.view = 'STORE_DEL_CONFIRM'; lcdData.cursor = 0;
 } else showToast('空のスロットです', 'error');
 }
 }
 else if(lcdData.view === 'STORE_DEL_CONFIRM') {
 if(lcdData.cursor === 0) {
 showToast('プログラムを消去しました', 'success');
 lcdData.storedPrograms[lcdData.selectedStoreSlot] = null;
 }
 lcdData.view = 'STORE_LIST'; lcdData.cursor = 0;
 }
 else if(lcdData.view === 'STANDBY_CONFIRM') {
 if(lcdData.cursor === 1) { // No (すぐ開始)
 startLidHeating();
 } else { // Yes (待機する)
 lcdData.view = 'PAUSE';
 renderLCD();
 }
 }
 else if(lcdData.view === 'STOP_CONFIRM') {
 if(lcdData.cursor === 0) {
 lcdData.view = 'HOME';
 lcdData.cursor = 0;
 resetSimulation();
 } else {
 if(!lcdData.lidHeatingDone && lcdData.lidTemp > 0) {
 resumeLidHeating();
 } else {
 lcdData.view = 'PAUSE';
 }
 }
 renderLCD();
 }
 else showToast('この項目はシミュレーターでは機能しません', 'error');
 }
 }
 } else if (dir === 'RIGHT') {
 if(lcdData.view === 'LID_HEATING') {
 if(lidTimer) clearInterval(lidTimer);
 finishLidHeating();
 return;
 }
 if(lcdData.view === 'STORE_NAME_INPUT') {
 lcdData.saveNameCursor = Math.min(3, lcdData.saveNameCursor + 1);
 } else if(lcdData.view === 'STORE_SAVE_SELECT' || lcdData.view === 'STORE_LIST') {
 lcdData.storePage = ((lcdData.storePage || 0) + 1) % 3;
 } else if(lcdData.editing) return;
 else if(lcdData.view === 'SETUP') { lcdData.view = 'PART1'; lcdData.cursor = 0; }
 else if(lcdData.view === 'PART1') { lcdData.view = 'PART2'; lcdData.cursor = 0; }
 else if(lcdData.view === 'PART2') { lcdData.view = 'PART3'; lcdData.cursor = 0; }
 else if(lcdData.view === 'PART3') { lcdData.view = 'SETUP'; lcdData.cursor = 0; } 
 else if(lcdData.view === 'HOME') { lcdData.cursor = Math.min(4, lcdData.cursor + 1); }
 else if(lcdData.view === 'TEMPLATE') { lcdData.cursor = Math.min(7, lcdData.cursor + 1); }
 } else if (dir === 'LEFT') {
 if(lcdData.view === 'STORE_NAME_INPUT') {
 lcdData.saveNameCursor = Math.max(0, lcdData.saveNameCursor - 1);
 } else if(lcdData.view === 'STORE_SAVE_SELECT' || lcdData.view === 'STORE_LIST') {
 lcdData.storePage = ((lcdData.storePage || 0) + 2) % 3;
 } else if(lcdData.editing) return;
 else if(lcdData.view === 'PART3') { lcdData.view = 'PART2'; lcdData.cursor = 0; }
 else if(lcdData.view === 'PART2') { lcdData.view = 'PART1'; lcdData.cursor = 0; }
 else if(lcdData.view === 'PART1') { lcdData.view = 'SETUP'; lcdData.cursor = 0; }
 else if(lcdData.view === 'SETUP') { lcdData.view = 'PART3'; lcdData.cursor = 0; } 
 else if(lcdData.view === 'HOME') { lcdData.cursor = Math.max(0, lcdData.cursor - 1); }
 else if(lcdData.view === 'TEMPLATE') { lcdData.cursor = Math.max(0, lcdData.cursor - 1); }
 } else if (dir === 'DOWN') {
 if(lcdData.view === 'STORE_NAME_INPUT') {
 if(lcdData.saveNameCursor < 2) {
 let c = lcdData.saveName.charCodeAt(lcdData.saveNameCursor);
 c = c === 65 ? 90 : c - 1; 
 let arr = lcdData.saveName.split('');
 arr[lcdData.saveNameCursor] = String.fromCharCode(c);
 lcdData.saveName = arr.join('');
 renderLCD();
 }
 return;
 }
 if(lcdData.editing) return;
 let max = 0;
 if(lcdData.view==='HOME') max=4; if(lcdData.view==='TEMPLATE') max=7;
 if(lcdData.view==='SETUP') max=1; if(lcdData.view==='PART1') max=3;
 if(lcdData.view==='PART2') max=6; if(lcdData.view==='PART3') max=5;
 if(lcdData.view==='STORE_LIST') max=8; if(lcdData.view==='STORE_CONFIRM' || lcdData.view==='STORE_DEL_CONFIRM' || lcdData.view==='STANDBY_CONFIRM' || lcdData.view==='STOP_CONFIRM') max=1;
 lcdData.cursor = Math.min(max, lcdData.cursor + 1);
 } else if (dir === 'UP') {
 if(lcdData.view === 'STORE_NAME_INPUT') {
 if(lcdData.saveNameCursor < 2) {
 let c = lcdData.saveName.charCodeAt(lcdData.saveNameCursor);
 c = c === 90 ? 65 : c + 1; 
 let arr = lcdData.saveName.split('');
 arr[lcdData.saveNameCursor] = String.fromCharCode(c);
 lcdData.saveName = arr.join('');
 renderLCD();
 }
 return;
 } else if(lcdData.editing) return;
 else lcdData.cursor = Math.max(0, lcdData.cursor - 1);
 }
 renderLCD();
 }

 function typeNum(char) {
 if(lcdData.view === 'STORE_NAME_INPUT') {
 if (lcdData.saveNameCursor >= 2 && /[0-9]/.test(char)) {
 let arr = lcdData.saveName.split('');
 arr[lcdData.saveNameCursor] = char;
 lcdData.saveName = arr.join('');
 lcdData.saveNameCursor = Math.min(3, lcdData.saveNameCursor + 1);
 renderLCD();
 }
 return;
 }

 if(!lcdData.editing) { showToast('ENTキーを押して編集モード(↓点滅)にしてください', 'error'); return; }
 
 // 編集モードに入った直後の最初の入力なら、前の値をクリアする
 if (lcdData.justEnteredEdit) {
 rawInput = "";
 lcdData.justEnteredEdit = false;
 }
 
 let target = getTarget();
 let maxLen = (target && target.type === 'num') ? 2 : 4;
 
 if(rawInput.length < maxLen) rawInput += char.replace('.', '');

 if(lcdData.view === 'PART3' && target && target.path[1] === 'm2' && rawInput === '9999') {
 rawInput = '∞';
 }

 renderLCD();
 }

 function clearNum() {
 if(lcdData.view === 'STORE_NAME_INPUT') {
 lcdData.saveNameCursor = 0;
 renderLCD();
 return;
 }
 if(lcdData.editing) { rawInput = ""; renderLCD(); }
 }

 function pressStop() {
 if (lcdData.view === 'RUNNING' || lcdData.view === 'PAUSE' || lcdData.view === 'LID_HEATING') {
 lcdData.view = 'STOP_CONFIRM';
 lcdData.cursor = 0;
 if(runTimer) clearTimeout(runTimer);
 if(lidTimer) clearInterval(lidTimer);
 renderLCD();
 } else if (lcdData.view === 'STOP_CONFIRM') {
 // Nothing to do, handled by ENT key
 } else {
 location.reload();
 }
 }

 function resumeLidHeating() {
 lcdData.view = 'LID_HEATING';
 document.getElementById('lidHeatLed').className = 'led-blink';
 if (lidTimer) clearInterval(lidTimer);
 renderLCD();
 lidTimer = setInterval(() => {
 lcdData.lidTemp += 3.5; 
 if (lcdData.lidTemp >= 105.0) {
 lcdData.lidTemp = 105.0;
 clearInterval(lidTimer);
 finishLidHeating();
 } else {
 renderLCD();
 }
 }, 200);
 }

 function startLidHeating() {
 lcdData.lidTemp = 25.0; 
 resumeLidHeating();
 }

 function finishLidHeating() {
 lcdData.lidHeatingDone = true;
 document.getElementById('lidHeatLed').className = 'led-on';
 lcdData.view = 'RUNNING';
 renderLCD();
 if(runTimer) clearTimeout(runTimer);
 runTimer = setTimeout(runPCR, 2000);
 }

 function resetSimulation() {
 document.getElementById('lidHeatLed').className = '';
 lcdData.lidHeatingDone = false;
 if(lidTimer) clearInterval(lidTimer);
 if(runTimer) clearTimeout(runTimer);
 }

 function closeModal(id) { document.getElementById(id).style.display = 'none'; }

 function window.BioMath.parseTempStr(valStr) {
 if (!valStr || valStr === "∞") return 0;
 let val = parseFloat(valStr);
 if (val >= 100 && !valStr.includes('.')) return val / 10;
 return val;
 }

 function window.BioMath.parseTimeStr(timeStr) {
 if (!timeStr || timeStr === "∞") return Infinity;
 if (timeStr.includes(':')) {
 let parts = timeStr.split(':');
 return parseInt(parts[0] || 0) * 60 + parseInt(parts[1] || 0);
 } else {
 let str = timeStr.padStart(4, '0'); 
 return parseInt(str.substring(0, 2) || 0) * 60 + parseInt(str.substring(2, 4) || 0);
 }
 }

 function drawFinalGraph(canvasId) {
 const canvas = document.getElementById(canvasId);
 const ctx = canvas.getContext('2d');
 const w = canvas.width;
 const h = canvas.height;
 ctx.clearRect(0, 0, w, h);

 const temps = [
 window.BioMath.parseTempStr(lcdData.p1.t),
 window.BioMath.parseTempStr(lcdData.p2.t1),
 window.BioMath.parseTempStr(lcdData.p2.t2),
 window.BioMath.parseTempStr(lcdData.p2.t3),
 window.BioMath.parseTempStr(lcdData.p3.t1) // FINAL
 ];
 const times = [
 lcdData.p1.m,
 lcdData.p2.m1,
 lcdData.p2.m2,
 lcdData.p2.m3,
 lcdData.p3.m1
 ];
 
 const labels = ["1: INIT", "2: DENAT", "3: ANNEAL", "4: EXTEND", "5: FINAL"];
 
 const getY = (t) => (h - 40) - (t / 110) * (h - 110);
 
 const startX = 50;
 const stepW = (w - 100) / 5;

 ctx.strokeStyle = '#2c3e50';
 ctx.lineWidth = 2;
 ctx.beginPath();
 ctx.moveTo(startX, 20); ctx.lineTo(startX, h - 30); 
 ctx.lineTo(w - 20, h - 30); 
 ctx.stroke();

 ctx.fillStyle = '#2c3e50';
 ctx.font = 'bold 12px sans-serif';
 ctx.textAlign = 'left';
 ctx.fillText('温度(℃)', 5, 15);
 ctx.textAlign = 'right';
 ctx.fillText('時間 (Time)', w - 20, h - 10);

 ctx.strokeStyle = '#2980b9';
 ctx.lineWidth = 3;
 ctx.beginPath();
 ctx.moveTo(startX, getY(25)); 

 let points = [];
 let cx = startX;
 for(let i=0; i < 5; i++) {
 cx += stepW * 0.3;
 let y = getY(temps[i]);
 ctx.lineTo(cx, y);
 points.push({x: cx, y: y});
 
 cx += stepW * 0.7;
 ctx.lineTo(cx, y);
 points.push({x: cx, y: y});
 }
 ctx.stroke();

 let lastX = points[9].x;
 let holdY = getY(window.BioMath.parseTempStr(lcdData.p3.t2) || 4); // HOLD Temp
 ctx.beginPath();
 ctx.moveTo(lastX, points[9].y);
 ctx.lineTo(lastX + stepW * 0.2, holdY);
 ctx.lineTo(w - 20, holdY);
 ctx.strokeStyle = '#95a5a6';
 ctx.setLineDash([4, 4]);
 ctx.stroke();
 ctx.setLineDash([]);
 
 ctx.fillStyle = '#7f8c8d';
 ctx.font = 'bold 11px sans-serif';
 ctx.fillText(`${lcdData.p3.t2}℃ HOLD`, w - 45, holdY - 8);

 ctx.textAlign = 'center';
 for(let i=0; i < 5; i++) {
 let midX = points[i*2].x + (points[i*2+1].x - points[i*2].x)/2;
 ctx.fillStyle = '#2c3e50';
 ctx.font = 'bold 11px sans-serif';
 ctx.fillText(labels[i], midX, points[i*2].y - 25);
 ctx.fillStyle = 'var(--danger)';
 ctx.font = 'bold 13px sans-serif';
 ctx.fillText(`${temps[i].toFixed(1)}℃`, midX, points[i*2].y - 10);
 ctx.fillStyle = '#27ae60';
 ctx.font = 'bold 12px sans-serif';
 ctx.fillText(times[i], midX, points[i*2].y + 15);
 }

 const cyc = lcdData.p2.n || "30";
 let maxCycleTemp = Math.max(temps[1], temps[2], temps[3]);
 let cycleY = getY(maxCycleTemp) - 45; 
 
 ctx.strokeStyle = '#e67e22';
 ctx.lineWidth = 2;
 ctx.setLineDash([4, 4]);
 ctx.beginPath();
 ctx.moveTo(points[2].x, cycleY); ctx.lineTo(points[7].x, cycleY);
 ctx.stroke();
 
 ctx.beginPath();
 ctx.moveTo(points[2].x, cycleY - 5); ctx.lineTo(points[2].x, cycleY + 5);
 ctx.moveTo(points[7].x, cycleY - 5); ctx.lineTo(points[7].x, cycleY + 5);
 ctx.stroke();
 ctx.setLineDash([]);
 
 ctx.fillStyle = '#d35400';
 ctx.font = 'bold 13px sans-serif';
 ctx.fillText(`2〜4 を ${cyc} 回ループ`, (points[2].x + points[7].x)/2, cycleY - 8);

 ctx.setLineDash([2, 2]);
 ctx.strokeStyle = '#bdc3c7';
 ctx.lineWidth = 1;
 ctx.textAlign = 'right';
 [98, 72, 60, 55].forEach(t => {
 let y = getY(t);
 ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(w-20, y); ctx.stroke();
 ctx.fillStyle = '#7f8c8d';
 ctx.font = '10px sans-serif';
 ctx.fillText(t, startX - 5, y + 4);
 });
 ctx.setLineDash([]);
 }

 function runPCR() {
 if(lcdData.editing) navBtn('ENT');

 const enzyme = document.getElementById('enzymeSelect').value;
 const targetLen = parseInt(document.getElementById('targetLength').value);
 const sample = document.getElementById('sampleSelect').value;
 let avgTm = parseFloat(document.getElementById('tmAvgDisplay').innerText) || 55.0;
 
 const correctVol = calculateVol();
 const inputVol = parseInt(lcdData.vol || 0);
 
 const t1 = window.BioMath.parseTempStr(lcdData.p1.t);
 const t2 = window.BioMath.parseTempStr(lcdData.p2.t1);
 const t3 = window.BioMath.parseTempStr(lcdData.p2.t2);
 const t4 = window.BioMath.parseTempStr(lcdData.p2.t3);
 const t5 = window.BioMath.parseTempStr(lcdData.p3.t1);
 const m4 = lcdData.p2.m3;
 const m5 = lcdData.p3.m1;
 const cyc = parseInt(lcdData.p2.n || 0);

 let hints = [];

 if (inputVol !== Math.round(correctVol)) hints.push({ label: "反応液量 (VOL)", text: `機器に入力された液量(${inputVol}µL)が、パネルで計算した試薬の合計量(${correctVol}µL)と一致していません。機器のヒーター加熱パワー（熱容量の計算）が狂い、温度制御に失敗します。` });

 if (Math.abs(t1 - t2) > 1.0 && t1 < 94.0) hints.push({ label: "1: INIT 温度", text: "初期変性は、通常その後の DENAT と同じ温度（または94℃以上）に設定し、2本鎖DNAを初回解離・酵素を活性化させます。" });
 if (Math.abs(t5 - t4) > 1.0) hints.push({ label: "5: FINAL 温度", text: "最終伸長は、EXTEND と同じ至適温度に設定して合成を完結させます。異なる温度では働きません。" });
 if (window.BioMath.parseTimeStr(m5) < 60) hints.push({ label: "5: FINAL 時間", text: "未完成の鎖を末端まで完全に合成させるため、最終伸長は「1〜5分」程度長めにとることが推奨されます。" });

 if (enzyme === "KODOne" || enzyme === "PrimeSTAR") {
 if (t2 < 97.0) hints.push({ label: "2: DENAT 温度", text: "強力な酵素は、DNAをしっかり解離させるために98℃（機器のブレを考慮し最低97℃）の設定が推奨されます。" });
 if (Math.abs(t4 - 68.0) > 1.0) hints.push({ label: "4: EXTEND 温度", text: "高正確性酵素の至適温度は68℃です。72℃等では酵素が失活しやすくなります。" });
 } else {
 if (t2 < 94.0 || t2 > 98.0) hints.push({ label: "2: DENAT 温度", text: "標準Taqの変性温度は94〜98℃の許容範囲内に設定してください。" });
 if (Math.abs(t4 - 72.0) > 1.0) hints.push({ label: "4: EXTEND 温度", text: "標準Taqの至適温度は72℃です。" });
 }

 if (enzyme === "KODOne") {
 if (Math.abs(t3 - avgTm) > 3.0) hints.push({ label: "3: アニーリング (ANNEAL) 温度", text: `アニーリング基準値(${avgTm.toFixed(1)}℃)と同じ温度を推奨します。±3℃以上ズレると特異性が低下し、ノイズが出ます。` });
 } else {
 if (t3 < 50.0 || t3 > 60.0) hints.push({ label: "3: アニーリング (ANNEAL) 温度", text: `通常50℃〜60℃の間に設定します。これより低いと非特異的増幅が起き、高いとプライマーが結合しません。` });
 }

 if (enzyme === "KODOne") {
 let req = Math.max(1, Math.ceil(targetLen / 1000));
 let setTime = window.BioMath.parseTimeStr(m4);
 if (setTime < req) hints.push({ label: "4: EXTEND 時間", text: `計算上は短いですが、機器の制約と確実な合成のため最低 ${req}秒（または余裕を見て数秒）は設定してください。` });
 if (setTime > req + 15) hints.push({ label: "4: EXTEND 時間", text: `設定時間が長すぎます。KOD Oneは超高速のため、無駄な時間（酵素へのダメージ）となります。` });
 } else {
 let req = Math.ceil(targetLen / 1000 * 60);
 if (window.BioMath.parseTimeStr(m4) < req - 5) hints.push({ label: "4: EXTEND 時間", text: `1分/kbの酵素の場合、${targetLen}bp(塩基対)には約 ${req}秒 必要です。短すぎると未完成のDNAになります。` });
 }

 if (sample === 'meat_mt') {
 if (cyc < 25 || cyc > 32) hints.push({ label: "CYCLE N (サイクル数)", text: "ミトコンドリアDNAはターゲットが非常に豊富です。増えすぎによる非特異的ノイズを防ぐため「25〜30回」程度が最適です。" });
 } else if (sample === 'genomic') {
 if (cyc < 30 || cyc > 40) hints.push({ label: "CYCLE N (サイクル数)", text: "ゲノムDNAはターゲット割合が低いため、しっかり「30〜35回」回して指数関数的増幅を完了させる必要があります。" });
 } else if (sample === 'plasmid') {
 if (cyc < 20 || cyc > 28) hints.push({ label: "CYCLE N (サイクル数)", text: "プラスミドはターゲット濃度が極めて高いため、「20〜25回」の少ないサイクルで十分です。回しすぎは不要です。" });
 }

 const modal = document.getElementById('runModal');
 const msgDiv = document.getElementById('runMessage');
 modal.style.display = 'flex';

 if (hints.length > 0) {
 let errorHtml = `<div class="feedback-box"><div class="feedback-title"><svg class="svg-danger" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -3px; margin-right: 6px;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>論理的エラー：設定の科学的根拠を見直してください</div><ul class="hint-list">`;
 hints.forEach(h => errorHtml += `<li><span class="hint-label"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px; margin-right:4px;"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>${h.label} について</span>${h.text}</li>`);
 errorHtml += '</ul></div>';
 msgDiv.innerHTML = errorHtml;
 } else {
 msgDiv.innerHTML = `
 <div class="success-box">
 <div class="success-title"><svg style="color: #27ae60; margin-right: 6px;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>PCRプログラム大成功！</div>
 <div style="font-size:13px; margin-bottom:12px; color:#2c3e50;">全パラメーターが科学的根拠に基づいて設定されました。以下が実行された温度プロファイルです。</div>
 <div class="graph-outer"><canvas id="finalGraph" width="700" height="300"></canvas></div>
 </div>`;
 setTimeout(() => { drawFinalGraph('finalGraph'); }, 100);
 }
 }

// --- Global Bindings for HTML ---
window.toggleSidebar = toggleSidebar;
window.updateRecipe = updateRecipe;
window.handleVolInput = handleVolInput;
window.handleVolChange = handleVolChange;
window.importFromApp1 = importFromApp1;
window.toggleRationale = toggleRationale;
window.calculateTm = calculateTm;
window.switchAssistTab = switchAssistTab;
window.switchModel = switchModel;
window.navBtn = navBtn;
window.typeNum = typeNum;
window.clearNum = clearNum;
window.pressStop = pressStop;
window.closeModal = closeModal;
window.updateAssistPanel = updateAssistPanel;
window.updateCycleHint = updateCycleHint;
