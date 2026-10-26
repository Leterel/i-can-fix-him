import {createGame,update,nearest,interact,choose,closeDialog,shove,continueSandbox,buildings,WIDTH,HEIGHT} from './game.mjs';
import {encodeSave,decodeSave,MAX_SAVE_BYTES,SAVE_KEY} from './save.mjs';
import {navigationStatus} from './navigation.mjs';
const $=s=>document.querySelector(s),canvas=$('#game'),ctx=canvas.getContext('2d');
let state=createGame(),keys={},camera={...state.player},last=performance.now(),signature='';
const W=1000,H=650;
const touchPointers=new Map();
let destination='ronny',paused=false;
function clearInput(){keys={};touchPointers.clear();}
function focusGame(){if(paused){$('#resume').focus();return;}if(state.dialog){$('#choices button')?.focus();return;}if(state.ending){(state.energy>0?$('#continue'):$('#restart')).focus();return;}canvas.focus();}
function setPaused(value,reason='Du hast die Schicht angehalten.'){
 if(value===paused)return;paused=value;clearInput();last=performance.now();
 $('#pause').setAttribute('aria-pressed',String(paused));
 if(paused){$('#pause-reason').textContent=reason;$('#pause-dialog').showModal();$('#resume').focus();}
 else{$('#pause-dialog').close();ui();focusGame();}
}
$('#pause').onclick=()=>setPaused(!paused);
$('#resume').onclick=()=>setPaused(false);
$('#pause-dialog').addEventListener('cancel',event=>{event.preventDefault();setPaused(false);});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')setPaused(true,'Tab verlassen: Die Schicht wartet, bis du bewusst fortsetzt.');});
const svgNode=(tag,attributes)=>{const node=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [name,value]of Object.entries(attributes))node.setAttribute(name,value);return node;};
const mapPeople=new Map(),mapButtons=new Map();
for(const b of buildings)$('#map-buildings').append(svgNode('rect',{x:b.x,y:b.y,width:b.w,height:b.h,class:'map-building'}));
for(const n of state.npcs){
 const group=svgNode('g',{}),dot=svgNode('circle',{r:27,class:'map-npc'}),letter=svgNode('text',{class:'map-initial',x:0,y:-40});letter.textContent=n.name[0];group.append(dot,letter);$('#map-people').append(group);mapPeople.set(n.id,group);
 const button=document.createElement('button');button.type='button';button.dataset.destination=n.id;button.textContent=n.name.split(',')[0];button.onclick=()=>{destination=n.id;updateNavigation();};$('#map-destinations').append(button);mapButtons.set(n.id,button);
}
$('#district-guide').open=matchMedia('(min-width: 721px)').matches;
function setText(selector,text){const node=$(selector);if(node.textContent!==text)node.textContent=text;}
function updateNavigation(){
 const guide=navigationStatus(state,destination);
 $('#map-player').setAttribute('cx',state.player.x);$('#map-player').setAttribute('cy',state.player.y);
 $('#map-target').setAttribute('cx',guide.target.x);$('#map-target').setAttribute('cy',guide.target.y);
 for(const n of state.npcs){mapPeople.get(n.id).setAttribute('transform',`translate(${n.x} ${n.y})`);mapButtons.get(n.id).setAttribute('aria-pressed',String(n.id===destination));}
 setText('#route-guide',`${guide.target.name}: ${guide.direction}`);
 setText('#goal-boundaries',`${guide.boundaries} / 3`);
 setText('#goal-remaining',guide.remaining.length?`Noch ohne gesetzte Grenze: ${guide.remaining.join(' · ')}.`:'Bei allen vier Personen eine Grenze gesetzt.');
 setText('#goal-kiosk',guide.kiosk);setText('#goal-fine',guide.fine);
}
function project(x,y,z=0){return {x:Math.round(x-camera.x+W/2),y:Math.round((y-camera.y)*.64+H/2-z)};}
function polygon(points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();}
function groundRect(x,y,w,h,color){const p=project(x,y),q=project(x+w,y+h);ctx.fillStyle=color;ctx.fillRect(p.x,p.y,q.x-p.x,q.y-p.y);}
function box(x,y,w,d,z,color){const a=project(x,y),b=project(x+w,y),c=project(x+w,y+d),e=project(x,y+d);const top=[a,b,c,e].map(p=>({x:p.x,y:p.y-z}));polygon([e,c,top[2],top[3]],color);polygon([b,c,top[2],top[1]],'#293e35');polygon(top,'#969a7b');return {a,b,c,e,top};}
function label(text,x,y,color='#e3e4bb',size=12){const p=project(x,y);ctx.fillStyle='#102018a8';ctx.font=`bold ${size}px monospace`;const width=ctx.measureText(text).width;ctx.fillRect(p.x-width/2-7,p.y-14,width+14,20);ctx.fillStyle=color;ctx.textAlign='center';ctx.fillText(text,p.x,p.y);}
function building(b){const {c,e}=box(b.x,b.y,b.w,b.h,b.z,b.color);ctx.fillStyle='#25302c';ctx.fillRect(e.x+32,e.y-65,35,65);ctx.fillStyle='#b0ae72';ctx.fillRect(e.x+38,e.y-54,23,22);for(let i=110;i<b.w-40;i+=65){ctx.fillStyle='#283e35';ctx.fillRect(e.x+i,e.y-68,36,28);ctx.fillStyle='#899481';ctx.fillRect(e.x+i+3,e.y-65,12,22);}ctx.strokeStyle='#28382f';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(e.x,e.y-10);ctx.lineTo(c.x,c.y-10);ctx.stroke();label(b.name,b.x+b.w/2,b.y+b.h-8,'#e9e0aa',11);box(b.x+30,b.y+20,65,55, b.z+17,'#607468');}
function person(n,player=false){const p=project(n.x,n.y),wave=Math.sin(state.time*2+(player?0:n.x))*.8;ctx.fillStyle='#17261d66';ctx.beginPath();ctx.ellipse(p.x+4,p.y+3,16,5,0,0,Math.PI*2);ctx.fill();const shift=player&&(keys.up||keys.down||keys.left||keys.right||touchPointers.size)?Math.sin(state.time*14)*3:0;
ctx.fillStyle='#1b2927';ctx.fillRect(p.x-8,p.y-20,6,20+shift);ctx.fillRect(p.x+3,p.y-20,6,20-shift);polygon([{x:p.x-13,y:p.y-45+wave},{x:p.x+11,y:p.y-45+wave},{x:p.x+14,y:p.y-18},{x:p.x-10,y:p.y-18}],player?'#d9e871':n.color);ctx.fillStyle='#bfa386';ctx.fillRect(p.x-8,p.y-61+wave,17,18);ctx.fillStyle=player?'#34372a':'#3b362b';ctx.fillRect(p.x-9,p.y-63+wave,18,6);ctx.fillStyle='#29382a';ctx.fillRect(p.x-2,p.y-53+wave,2,2);ctx.fillRect(p.x+5,p.y-53+wave,2,2);
if(!player){label(n.name,n.x,n.y-120,n.trust<0?'#f1a389':'#dce5b6',11);if(n.trust<0)label('!?',n.x,n.y-155,'#ffb38c',15);}else label('DU',n.x,n.y-120,'#d5e56b',10);
}
function render(){if(!paused){camera.x+=(state.player.x-camera.x)*.1;camera.y+=(state.player.y-camera.y)*.1;}ctx.fillStyle='#465443';ctx.fillRect(0,0,W,H);
groundRect(0,0,WIDTH,HEIGHT,'#78826b');groundRect(30,305,WIDTH-60,360,'#515d51');groundRect(400,30,430,HEIGHT-60,'#596356');
for(let i=0;i<550;i++){const x=(i*173)%WIDTH,y=(i*337)%HEIGHT,p=project(x,y);ctx.fillStyle=i%3?'#c4c5a313':'#1a2b241c';ctx.fillRect(p.x,p.y,2+i%6,1);}
for(let y=350;y<HEIGHT;y+=65)groundRect(790,y,5,25,'#c7c391');for(let x=80;x<WIDTH;x+=70)groundRect(x,600,30,5,'#c7c391');
groundRect(420,910,340,6,'#b4bb96');label('BETONPLATZ',650,890,'#c8cfb5',20);
const objects=[...buildings.map(b=>({y:b.y+b.h,draw:()=>building(b)})),...state.npcs.map(n=>({y:n.y,draw:()=>person(n)})),{y:state.player.y,draw:()=>person(state.player,true)},
{y:800,draw:()=>{box(625,780,100,24,25,'#7f6953');box(635,780,6,30,5,'#333d30');box(705,780,6,30,5,'#333d30');}},
{y:515,draw:()=>{box(180,470,120,50,28,'#8c7667');box(205,480,65,35,45,'#4b5c53');}},
{y:580,draw:()=>{box(1220,550,38,35,50,'#b0ac75');label('KEIN MÜLL?',1240,520,'#d9d4a1',9);}}];
objects.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
for(const [x,y]of [[440,590],[840,680]]){const p=project(x,y);ctx.fillStyle='#26382c';ctx.fillRect(p.x,p.y-100,5,100);ctx.fillRect(p.x,p.y-100,32,4);ctx.fillStyle='#d5dc9b';ctx.fillRect(p.x+23,p.y-100,13,7);}
if(state.closed)label('GESCHLOSSEN / ATMOSPHÄRE',250,300,'#ffb696',13);
const vignette=ctx.createRadialGradient(W/2,H/2,150,W/2,H/2,650);vignette.addColorStop(0,'#10231800');vignette.addColorStop(1,'#101b1666');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
ctx.fillStyle='#b6c796';ctx.font='10px monospace';ctx.textAlign='left';ctx.fillText(`BEZIRK 08 / ${Math.round(state.player.x)},${Math.round(state.player.y)} / KEIN PLAN IST AUCH EIN PLAN`,16,22);
const n=nearest(state);$('#prompt').textContent=n?`[ E ] ${n.name} · ${n.role}`:'WASD bewegen · Zu einer Person gehen · E reden';
}
function ui(){updateNavigation();for(const key of['energy','chaos','suspicion']){$('#'+key).value=state[key];$('#'+key+'-value').textContent=Math.round(state[key]);}$('#money').textContent=state.money+' €';$('#boundaries').textContent=state.boundaries+' / 3';
if(signature!==state.log.join('|')){signature=state.log.join('|');$('#log').replaceChildren(...state.log.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));}
const d=$('#conversation');if(!paused&&state.dialog&&!d.open){const npc=state.npcs.find(n=>n.id===state.dialog);$('#npc-name').textContent=npc.name;$('#npc-role').textContent=npc.role;$('#npc-line').textContent=npc.line;$('#npc-memory').textContent=`Vertrauen ${npc.trust} · Begegnung ${npc.visits}${npc.pushes?' · Erinnert sich an '+npc.pushes+' Schubsereien.':''}`;$('#choices').replaceChildren(...npc.choices.map((label,i)=>{const button=document.createElement('button');button.textContent=`${i+1} / ${label}`;button.onclick=()=>{choose(state,i);ui();canvas.focus();};return button;}));keys={};touchPointers.clear();d.showModal();}
if(!state.dialog&&d.open)d.close();const e=$('#ending');if(!paused&&state.ending&&!e.open){$('#ending-title').textContent=state.ending;$('#ending-text').textContent=state.notice;$('#continue').hidden=state.energy<=0;keys={};touchPointers.clear();e.showModal();}if(!state.ending&&e.open)e.close();}
function status(message){$('#save-status').textContent=message;$('#ending-save-status').textContent=message;$('#pause-save-status').textContent=message;}
function applyState(next){$('#conversation').close();$('#ending').close();state=next;keys={};touchPointers.clear();camera={...state.player};signature='';last=performance.now();ui();focusGame();}
function save(){try{localStorage.setItem(SAVE_KEY,encodeSave(state));status('Schicht lokal gespeichert. Fortsetzen lädt diesen Stand; Export sichert ihn als Datei.');}catch{status('Speichern nicht möglich. Browser-Speicher gesperrt oder Spielstand außerhalb der Grenzen. Deine laufende Schicht bleibt erhalten.');}}
function load(automatic=false){try{const stored=localStorage.getItem(SAVE_KEY);if(stored===null){if(!automatic)status('Noch kein lokaler Spielstand. Zuerst lokal speichern oder eine Datei importieren.');return;}const restored=decodeSave(stored);applyState(restored);status(paused?'Gespeicherter Stand geladen. Die Schicht bleibt pausiert.':'Gespeicherte Schicht fortgesetzt. Es wurde keine Zeit außerhalb des Spiels abgezogen.');}catch{status('Lokaler Spielstand nicht lesbar oder ungültig. Deine laufende Schicht bleibt unverändert.');}}
function exportFile(){try{const content=encodeSave(state),url=URL.createObjectURL(new Blob([content],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='betonbezirk-spielstand-v1.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Spielstand exportiert. Die Datei bleibt auf deinem Gerät.');}catch{status('Export nicht möglich. Deine laufende Schicht bleibt erhalten.');}}
$('#save').onclick=save;$('#load').onclick=()=>load();$('#export').onclick=exportFile;$('#import').onclick=()=>$('#import-file').click();
$('#import-file').onchange=async event=>{const file=event.target.files[0];event.target.value='';if(!file)return;try{if(file.size>MAX_SAVE_BYTES)throw Error();const restored=decodeSave(await file.text());applyState(restored);status('Datei importiert. Zum Behalten in diesem Browser jetzt lokal speichern.');}catch{status('Import abgelehnt: ungültige Datei, mehr als 32 KiB, falsche Version oder unbegehbare Position. Deine Schicht und dein gespeicherter Stand bleiben unverändert.');}};
$('#ending-save').onclick=save;$('#ending-export').onclick=exportFile;$('#pause-save').onclick=save;$('#pause-export').onclick=exportFile;$('#pause-load').onclick=()=>load();
function reset(){applyState(createGame());try{localStorage.removeItem(SAVE_KEY);status('Neue Schicht. Auch der lokale Spielstand wurde gelöscht. Bereits exportierte Dateien bleiben bei dir.');}catch{status('Neue Schicht. Der Browser hat das Löschen des lokalen Speicherplatzes verweigert.');}}
$('#reset').onclick=reset;$('#restart').onclick=reset;$('#continue').onclick=()=>{continueSandbox(state);ui();canvas.focus();};$('#leave').onclick=()=>{closeDialog(state);ui();canvas.focus();};$('#conversation').addEventListener('cancel',()=>{closeDialog(state);keys={};});$('#ending').addEventListener('cancel',event=>event.preventDefault());
window.addEventListener('keydown',e=>{const key=e.key.toLowerCase();if(key==='p'){e.preventDefault();if(!e.repeat)setPaused(!paused);return;}if(paused)return;if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','e','f','1','2','3'].includes(key))e.preventDefault();if(e.repeat)return;if(state.dialog){if(['1','2','3'].includes(key)){choose(state,Number(key)-1);ui();canvas.focus();}return;}if(state.ending)return;const mapping={w:'up',arrowup:'up',s:'down',arrowdown:'down',a:'left',arrowleft:'left',d:'right',arrowright:'right'};if(mapping[key])keys[mapping[key]]=true;if(key==='e'){interact(state);ui();}if(key==='f'){shove(state);ui();}});
window.addEventListener('keyup',e=>{const mapping={w:'up',arrowup:'up',s:'down',arrowdown:'down',a:'left',arrowleft:'left',d:'right',arrowright:'right'};if(mapping[e.key.toLowerCase()])keys[mapping[e.key.toLowerCase()]]=false;});window.addEventListener('blur',()=>{keys={};touchPointers.clear();});
function movementKeys(){const merged={...keys};for(const direction of touchPointers.values())merged[direction]=true;return merged;}
for(const button of document.querySelectorAll('[data-direction]')){
 button.addEventListener('pointerdown',event=>{event.preventDefault();if(paused||state.dialog||state.ending)return;button.setPointerCapture(event.pointerId);touchPointers.set(event.pointerId,button.dataset.direction);});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,event=>touchPointers.delete(event.pointerId));
}
$('#touch-talk').onclick=()=>{if(paused||state.dialog||state.ending)return;interact(state);ui();};
$('#touch-shove').onclick=()=>{if(paused||state.dialog||state.ending)return;shove(state);ui();};
function frame(now){if(!paused)update(state,(now-last)/1000,movementKeys());last=now;render();ui();requestAnimationFrame(frame);}load(true);ui();if(document.visibilityState==='hidden')setPaused(true,'Im Hintergrund geöffnet: Die Schicht wartet auf dich.');requestAnimationFrame(frame);
