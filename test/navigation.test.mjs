import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,interact,choose,shove,continueSandbox} from '../game.mjs';
import {encodeSave,decodeSave} from '../save.mjs';
import {navigationStatus,directionTo} from '../navigation.mjs';

test('guidance follows actual boundaries and preserves consequences through save and continue',()=>{
 const game=createGame();
 assert.equal(navigationStatus(game,'ronny').direction,'Nordwesten');
 for(const [id,choice]of [['ronny',1],['uwe',1],['mara',2]]){
  const npc=game.npcs.find(n=>n.id===id);game.player={x:npc.x+40,y:npc.y+40};
  interact(game);choose(game,choice);
 }
 const before=encodeSave(game),guide=navigationStatus(game,'ronny');
 assert.equal(guide.boundaries,3);assert.deepEqual(guide.remaining,['Petra, 51']);
 assert.equal(encodeSave(game),before,'guidance cannot mutate the running game');
 assert.deepEqual(navigationStatus(decodeSave(before),'ronny'),guide);
 continueSandbox(game);assert.equal(navigationStatus(game,'ronny').boundaries,0);
 const npc=game.npcs[0];game.player={x:npc.x+40,y:npc.y+40};
 for(let i=0;i<4;i++){game.player={x:npc.x+40,y:npc.y+40};game.cooldown=0;shove(game);}
 const saved=decodeSave(encodeSave(game));saved.chaos=0;
 assert.match(navigationStatus(saved,'ronny').kiosk,/geschlossen/);
 assert.match(navigationStatus(saved,'ronny').fine,/bereits kassiert/);
 assert.match(navigationStatus(saved,'ronny').direction,/gesperrt/);
 assert.ok(navigationStatus(saved,'ronny').remaining.some(name=>name.includes('verweigert Gespräche')));
});

test('directions distinguish cardinal routes and nearby conversation without moving player',()=>{
 const player={x:500,y:500};
 for(const [target,expected]of [[{x:500,y:200},'Nord'],[{x:800,y:500},'Osten'],[{x:200,y:800},'Südwesten'],[{x:520,y:530},'In Gesprächsreichweite · E oder Reden']])assert.equal(directionTo(player,target),expected);
 assert.deepEqual(player,{x:500,y:500});
});
