import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createLocalServer} from '../server.mjs';
import {SAVE_KEY,decodeSave,encodeSave} from '../save.mjs';
import {createGame,interact,choose} from '../game.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(resolve(process.env.PLAYWRIGHT_MODULE)).href:'playwright');
const output=resolve(process.env.GAME_OUTPUT||'test-results/pause');await mkdir(output,{recursive:true});
const server=createLocalServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try {
 browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const origin=`http://127.0.0.1:${server.address().port}`;
 const move=async(key,ms)=>{await page.keyboard.down(key);await page.waitForTimeout(ms);await page.keyboard.up(key);};
 const saved=async()=>{await page.locator('#pause-save').click();return decodeSave(await page.evaluate(key=>localStorage.getItem(key),SAVE_KEY));};
 await page.goto(origin);await page.locator('#game').focus();await move('w',700);await move('a',500);await page.keyboard.press('f');await page.keyboard.press('p');
 await page.getByRole('heading',{name:'Schicht pausiert',exact:true}).waitFor();assert.equal(await page.locator('#resume').evaluate(el=>el===document.activeElement),true);
 const frozen=await saved();assert.equal(frozen.suspicion,22);assert.ok(frozen.cooldown>0);
 await page.keyboard.press('e');await page.keyboard.press('f');await page.keyboard.press('1');await move('d',300);await page.waitForTimeout(1400);assert.deepEqual(await saved(),frozen,'pause freezes time, cooldown, position and all consequences');
 await page.keyboard.press('p');await page.waitForTimeout(80);await page.locator('#pause').click();const resumed=await saved();assert.ok(resumed.time>frozen.time&&resumed.time-frozen.time<0.5,'resume has no catch-up jump');assert.deepEqual(resumed.player,frozen.player);
 await page.keyboard.press('p');await page.keyboard.down('d');await page.waitForTimeout(120);await page.keyboard.press('p');const held=await saved();await page.keyboard.press('p');await page.waitForTimeout(200);await page.keyboard.up('d');await page.locator('#pause').click();assert.deepEqual((await saved()).player,held.player,'held input cleared by pause');
 await page.keyboard.press('p');await page.keyboard.press('e');await page.locator('#conversation[open]').waitFor();await page.keyboard.press('p');const dialogue=await saved();assert.equal(dialogue.dialog,'ronny');await page.keyboard.press('1');assert.deepEqual(await saved(),dialogue,'paused digit cannot select a dialogue');
 const raw=await page.evaluate(key=>localStorage.getItem(key),SAVE_KEY);await page.keyboard.press('p');await page.keyboard.press('1');assert.equal(await page.locator('#money').textContent(),'30 €');await page.keyboard.press('p');
 await page.evaluate(({key,raw})=>localStorage.setItem(key,raw),{key:SAVE_KEY,raw});await page.locator('#pause-load').click();assert.equal(await page.locator('#pause-dialog').evaluate(el=>el.open),true);assert.deepEqual(await saved(),dialogue,'loading retains runtime pause and saved dialogue');
 await page.locator('#resume').press('Space');await page.locator('#conversation[open]').waitFor();assert.equal(await page.locator('#pause-dialog').evaluate(el=>el.open),false);assert.equal(await page.locator('#choices button').first().evaluate(el=>el===document.activeElement),true);await page.keyboard.press('Escape');
 // This automation environment keeps native tabs visible, even in headed mode.
 // Explicit synthetic visibility fixture tests the production listener only.
 await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'});document.dispatchEvent(new Event('visibilitychange'));});
 await page.evaluate(()=>{delete document.visibilityState;document.dispatchEvent(new Event('visibilitychange'));}); await page.locator('#pause-dialog[open]').waitFor();assert.match(await page.locator('#pause-reason').textContent(),/Tab verlassen/);const hidden=await saved();await page.waitForTimeout(250);assert.deepEqual(await saved(),hidden,'returning visible does not automatically resume');
 await page.screenshot({path:join(output,'10-pause-desktop.png'),fullPage:true});await page.reload();assert.equal(await page.locator('#pause-dialog').evaluate(el=>el.open),false,'pause itself is not persisted in V1 saves');
 const ending=createGame();for(const [id,choice]of [['ronny',1],['petra',2],['mara',2]]){const npc=ending.npcs.find(n=>n.id===id);ending.player={x:npc.x+20,y:npc.y+20};interact(ending);choose(ending,choice);}
 await page.evaluate(({key,content})=>localStorage.setItem(key,content),{key:SAVE_KEY,content:encodeSave(ending)});await page.reload();await page.locator('#ending[open]').waitFor();await page.keyboard.press('p');const pausedEnding=await saved();assert.equal(pausedEnding.ending,'FEIERABEND IST EINE GRENZE');await page.keyboard.press('1');assert.deepEqual(await saved(),pausedEnding);await page.keyboard.press('p');assert.equal(await page.locator('#ending').evaluate(el=>el.open),true);await page.locator('#continue').click();assert.equal(await page.locator('#ending').evaluate(el=>el.open),false); const mobile=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const touch=await mobile.newPage();touch.on('pageerror',e=>errors.push(e.message));await touch.goto(origin);await touch.locator('#pause').tap();await touch.locator('#pause-dialog[open]').waitFor();assert.equal(await touch.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await touch.screenshot({path:join(output,'11-pause-mobil.png'),fullPage:true});await touch.locator('#resume').tap();assert.equal(await touch.locator('#pause-dialog').evaluate(el=>el.open),false);await mobile.close();
 assert.deepEqual(errors,[]);console.log('PASS: pause freezes complete state and cooldown, clears held input, resumes without catch-up, preserves dialogue/save-load/ending, keyboard Space/P and touch buttons work; synthetic visibilitychange integration.');
} finally {await browser?.close();await new Promise(r=>server.close(r));}
