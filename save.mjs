import { createGame, canStand, WIDTH, HEIGHT } from './game.mjs';

export const MAX_SAVE_BYTES = 32768;
export const SAVE_KEY = 'betonbezirk.save.v1';
const mutable = ['player','npcs','chaos','suspicion','energy','money','boundaries','boundaryPeople','decisions','dialog','notice','log','time','cooldown','fineIssued','closed','ending'];
const npcFields = ['id','x','y','trust','pushes','visits'];
const endings = [null,'EMOTIONALE BAUSTELLE','FEIERABEND IST EINE GRENZE'];
function fail() { throw Error('Ungültiger Spielstand. Erwartet wird Betonbezirk Version 1 mit gültigen Werten und begehbaren Positionen.'); }
function fields(value, names) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail();
  const keys=Object.keys(value);
  if(keys.length!==names.length||keys.some(key=>!names.includes(key))) fail();
}
function number(value, min, max, integer=false) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer&&!Number.isInteger(value))) fail();
}
function text(value) {
  if (typeof value !== 'string' || !value.length || value.length>500 || !value.isWellFormed() || /[\u0000-\u001f\u007f]/.test(value)) fail();
}
function position(value) {
  number(value.x,35,WIDTH-35); number(value.y,35,HEIGHT-35);
  if (!canStand(value.x,value.y)) fail();
}

/** Validate completely before returning a fresh state. Never modifies a live game. */
export function decodeSave(serialized) {
  if (typeof serialized !== 'string' || new TextEncoder().encode(serialized).length > MAX_SAVE_BYTES) fail();
  let snapshot; try { snapshot=JSON.parse(serialized); } catch { fail(); }
  fields(snapshot,['format','version','state']);
  if(snapshot.format!=='betonbezirk-save'||snapshot.version!==1) fail();
  const data=snapshot.state, game=createGame();
  fields(data,mutable); fields(data.player,['x','y']); position(data.player);
  if(!Array.isArray(data.npcs)||data.npcs.length!==game.npcs.length) fail();
  const ids=game.npcs.map(n=>n.id), seen=new Set();
  for(const npc of data.npcs) {
    fields(npc,npcFields); if(!ids.includes(npc.id)||seen.has(npc.id)) fail(); seen.add(npc.id); position(npc);
    number(npc.pushes,0,1e9,true); number(npc.visits,0,1e9,true); number(npc.trust,-npc.pushes,1e9,true);
  }
  for(const key of ['chaos','suspicion','energy']) number(data[key],0,100,true);
  for(const key of ['money','decisions']) number(data[key],0,1e9,true);
  number(data.time,0,1e9); number(data.cooldown,0,1.3);
  if(!Array.isArray(data.boundaryPeople)||data.boundaryPeople.length>4||new Set(data.boundaryPeople).size!==data.boundaryPeople.length||data.boundaryPeople.some(id=>!ids.includes(id))) fail();
  number(data.boundaries,0,4,true); if(data.boundaries!==data.boundaryPeople.length) fail();
  if(typeof data.fineIssued!=='boolean'||typeof data.closed!=='boolean'||(data.chaos>=50&&!data.closed)||(data.suspicion>=60&&!data.fineIssued)) fail();
  if(!endings.includes(data.ending)) fail();
  if((data.energy===0)!==(data.ending==='EMOTIONALE BAUSTELLE')) fail();
  if(data.energy>0&&((data.boundaries>=3)!==(data.ending==='FEIERABEND IST EINE GRENZE'))) fail();
  if(data.dialog!==null) {
    const npc=data.npcs.find(n=>n.id===data.dialog);
    if(!npc||data.ending||Math.hypot(npc.x-data.player.x,npc.y-data.player.y)>=105) fail();
  }
  text(data.notice); if(!Array.isArray(data.log)||data.log.length<1||data.log.length>7) fail(); data.log.forEach(text);
  // Dialogue, names, choices and graphics come from this game, never the file.
  for(const key of mutable) if(key!=='npcs') game[key]=structuredClone(data[key]);
  game.npcs=game.npcs.map(n=>({...n,...data.npcs.find(saved=>saved.id===n.id)}));
  return game;
}

export function encodeSave(game) {
  const state=Object.fromEntries(mutable.map(key=>[key,key==='npcs'?game.npcs.map(n=>Object.fromEntries(npcFields.map(field=>[field,n[field]]))):game[key]]));
  const serialized=JSON.stringify({format:'betonbezirk-save',version:1,state});
  decodeSave(serialized); // Exports obey exactly the same validation as imports.
  return serialized;
}
