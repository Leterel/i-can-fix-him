import assert from 'node:assert/strict';
import {mkdir,readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createLocalServer} from '../server.mjs';
import {SAVE_KEY,decodeSave} from '../save.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(resolve(process.env.PLAYWRIGHT_MODULE)).href:'playwright');
const output=resolve(process.env.GAME_OUTPUT||'test-results/save');await mkdir(output,{recursive:true});
const server=createLocalServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{
 browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const origin=`http://127.0.0.1:${server.address().port}`;
 const move=async(key,ms)=>{await page.keyboard.down(key);await page.waitForTimeout(ms);await page.keyboard.up(key);};
 const local=()=>page.evaluate(key=>localStorage.getItem(key),SAVE_KEY);
 const upload=content=>page.locator('#import-file').setInputFiles({name:'test-save.json',mimeType:'application/json',buffer:Buffer.from(content)});
 await page.goto(origin);await page.locator('#game').focus();await move('w',700);await move('a',500);await page.keyboard.press('e');
 await page.getByRole('heading',{name:'Ronny, 38',exact:true}).waitFor();await page.keyboard.press('1');
 await page.locator('#save').click();assert.match(await page.locator('#save-status').textContent(),/lokal gespeichert/);
 await page.keyboard.press('e');await page.locator('#conversation[open]').waitFor();await page.keyboard.press('1');assert.equal(await page.locator('#money').textContent(),'10 €');await page.locator('#load').click();assert.equal(await page.locator('#money').textContent(),'30 €');
 await page.reload();assert.equal(await page.locator('#money').textContent(),'30 €');assert.equal(await page.locator('#energy-value').textContent(),'86');
 await page.keyboard.press('e');await page.locator('#conversation[open]').waitFor();await page.keyboard.press('Escape');await page.keyboard.press('f');await page.locator('#save').click();
 await page.reload();assert.equal(await page.locator('#suspicion-value').textContent(),'34');await page.keyboard.press('e');await page.locator('#conversation[open]').waitFor();assert.match(await page.locator('#npc-memory').textContent(),/Vertrauen -1.*1 Schubsereien/);await page.keyboard.press('Escape');
 const downloading=page.waitForEvent('download');await page.locator('#export').click();const download=await downloading;const filename=join(output,download.suggestedFilename());await download.saveAs(filename);
 const exported=await readFile(filename,'utf8');assert.equal(decodeSave(exported).money,30);assert.equal(decodeSave(exported).npcs[0].trust,-1);
 const stored=await local();
 for(const invalid of ['{',' '.repeat(32769),JSON.stringify({...JSON.parse(exported),version:99}),JSON.stringify({...JSON.parse(exported),state:{...JSON.parse(exported).state,player:{x:150,y:150}}})]){
  await upload(invalid);await page.locator('#save-status').filter({hasText:/^Import abgelehnt:/}).waitFor();assert.equal(await page.locator('#money').textContent(),'30 €');assert.equal(await local(),stored);
 }
 await page.screenshot({path:join(output,'05-import-abgelehnt.png'),fullPage:true});
 await page.locator('#reset').click();assert.equal(await page.locator('#money').textContent(),'50 €');assert.equal(await local(),null);
 await upload(exported);await page.locator('#save-status').filter({hasText:/^Datei importiert/}).waitFor();assert.equal(await page.locator('#money').textContent(),'30 €');assert.equal(await local(),null,'import does not silently overwrite local slot');
 await page.locator('#save').click();await page.reload();assert.equal(await page.locator('#suspicion-value').textContent(),'34');
 await page.keyboard.press('e');await page.locator('#conversation[open]').waitFor();await page.keyboard.press('2');
 await move('w',900);await move('a',650);await page.keyboard.press('e');await page.getByRole('heading',{name:'Uwe, 47',exact:true}).waitFor();await page.keyboard.press('2');
 await move('s',2200);await page.keyboard.press('e');await page.getByRole('heading',{name:'Mara, 34',exact:true}).waitFor();await page.keyboard.press('3');
 await page.locator('#ending[open]').waitFor();await page.locator('#ending-save').click();await page.reload();await page.getByRole('heading',{name:'FEIERABEND IST EINE GRENZE',exact:true}).waitFor();
 assert.equal(decodeSave(await local()).ending,'FEIERABEND IST EINE GRENZE');await page.screenshot({path:join(output,'06-gespeicherter-feierabend.png'),fullPage:true});
 await page.locator('#continue').click();await page.locator('#reset').click();await page.reload();assert.equal(await page.locator('#money').textContent(),'50 €');assert.equal(await page.locator('#boundaries').textContent(),'0 / 3');
 const denied=await browser.newPage();await denied.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')};});await denied.goto(origin);await denied.locator('#save').click();assert.match(await denied.locator('#save-status').textContent(),/Speichern nicht möglich/);assert.equal(await denied.locator('#money').textContent(),'50 €');await denied.close();
 assert.deepEqual(errors,[]);console.log('PASS: manual save, actual reload, NPC memory, JSON download/import, invalid imports atomic, reset clears slot, saved ending restores, blocked storage handled.');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
