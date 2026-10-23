import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,interact,choose,shove,update} from '../game.mjs';
import {encodeSave,decodeSave,MAX_SAVE_BYTES} from '../save.mjs';
const meet=(s,id)=>{const n=s.npcs.find(n=>n.id===id);s.player={x:n.x+30,y:n.y+30};interact(s);};

test('save roundtrip retains NPC memory, cooldown, positions, money and every consequence',()=>{
 const state=createGame();
 for(let i=0;i<4;i++){meet(state,'uwe');choose(state,2);}
 meet(state,'ronny');state.dialog=null;shove(state);
 assert.ok(state.cooldown>0);assert.equal(state.fineIssued,true);assert.equal(state.closed,true);
 const restored=decodeSave(encodeSave(state));assert.deepEqual(restored,state);
 const pushes=restored.npcs[0].pushes;shove(restored);assert.equal(restored.npcs[0].pushes,pushes,'cooldown survives import');
 update(restored,.05);assert.ok(restored.cooldown>0);restored.npcs[0].pushes++;
 assert.equal(state.npcs[0].pushes,pushes,'restored object does not alias old game');
});

test('open dialogue and both endings survive versioned snapshots',()=>{
 const dialog=createGame();meet(dialog,'petra');assert.deepEqual(decodeSave(encodeSave(dialog)),dialog);
 const done=createGame();meet(done,'ronny');choose(done,1);meet(done,'uwe');choose(done,1);meet(done,'mara');choose(done,2);
 assert.equal(decodeSave(encodeSave(done)).ending,'FEIERABEND IST EINE GRENZE');
 const tired=createGame();for(let i=0;i<9;i++){meet(tired,'mara');choose(tired,1);}
 assert.equal(decodeSave(encodeSave(tired)).ending,'EMOTIONALE BAUSTELLE');
});

test('malformed and inconsistent snapshots are rejected without modifying live state',()=>{
 const live=createGame(),before=structuredClone(live),valid=JSON.parse(encodeSave(live));
 const changes=[x=>x.version=2,x=>x.extra=true,x=>delete x.state.cooldown,
 x=>x.state.player.x=-1,x=>x.state.player={x:150,y:150},x=>x.state.player.extra='x',
 x=>x.state.npcs[0].x=-1,x=>{x.state.npcs[0].x=150;x.state.npcs[0].y=150;},
 x=>x.state.npcs[0].id='someone',x=>x.state.npcs[1].id='ronny',x=>x.state.npcs.pop(),
 x=>x.state.npcs[0].choices=['foreign code'],x=>x.state.npcs[0].pushes=-1,x=>x.state.npcs[0].trust=-1,
 x=>x.state.energy=101,x=>x.state.energy=0,x=>x.state.money='50',x=>x.state.money=1.5,
 x=>x.state.cooldown=1.31,x=>x.state.time=null,x=>x.state.log=['\u0000'],x=>x.state.log=Array(8).fill('x'),
 x=>x.state.boundaryPeople=['ronny','ronny'],x=>x.state.boundaries=1,x=>x.state.ending='foreign ending',
 x=>x.state.ending='FEIERABEND IST EINE GRENZE',x=>x.state.dialog='ronny',x=>x.state.chaos=80,x=>x.state.closed='yes',
 ];
 for(const mutate of changes){const candidate=structuredClone(valid);mutate(candidate);assert.throws(()=>decodeSave(JSON.stringify(candidate)));assert.deepEqual(live,before);}
 for(const text of ['{','null','[]',' '.repeat(MAX_SAVE_BYTES+1)])assert.throws(()=>decodeSave(text));
 const utf=structuredClone(valid);utf.state.notice='€'.repeat(200);utf.state.log=Array(7).fill('€'.repeat(200));
 const oversized=JSON.stringify(utf)+' '.repeat(MAX_SAVE_BYTES-JSON.stringify(utf).length);assert.throws(()=>decodeSave(oversized),'UTF-8 bytes bounded, not only JS characters');
});
