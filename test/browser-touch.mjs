import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createLocalServer} from '../server.mjs';
import {SAVE_KEY,decodeSave} from '../save.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(resolve(process.env.PLAYWRIGHT_MODULE)).href:'playwright');
const output=resolve(process.env.GAME_OUTPUT||'test-results/touch');await mkdir(output,{recursive:true});
const server=createLocalServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{
 browser=await chromium.launch({channel:'chrome',headless:true});const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));const cdp=await context.newCDPSession(page);
 await page.goto(`http://127.0.0.1:${server.address().port}`);await page.locator('.touch-controls').waitFor({state:'visible'});
 const hold=async(direction,duration,cancel=false)=>{const button=page.locator(`[data-direction=${direction}]`);await button.scrollIntoViewIfNeeded();const b=await button.boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2,id:1}]});await page.waitForTimeout(duration);await cdp.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});};
 const saved=async()=>{await page.locator('#save').tap();return decodeSave(await page.evaluate(key=>localStorage.getItem(key),SAVE_KEY));};
 await hold('up',700);await hold('left',500);await page.locator('#touch-talk').tap();await page.getByRole('heading',{name:'Ronny, 38',exact:true}).waitFor();await page.locator('#choices button').first().tap();assert.equal(await page.locator('#money').textContent(),'30 €');
 await page.locator('#touch-shove').tap();assert.equal(await page.locator('#suspicion-value').textContent(),'34');
 const before=await saved();assert.ok(before.player.y<520&&before.player.x<650,'held touch buttons actually move the player');
 await hold('right',200,true);await page.waitForTimeout(400);const canceled=await saved();assert.ok(canceled.player.x>before.player.x+15&&canceled.player.x<before.player.x+60,'pointer cancellation stops held movement');
 await page.waitForTimeout(300);const settled=await saved();assert.equal(settled.player.x,canceled.player.x);
 await page.reload();const restored=await saved();assert.deepEqual(restored.player,settled.player);assert.equal(restored.npcs[0].trust,-1);
 await page.locator('.touch-controls').scrollIntoViewIfNeeded();await page.screenshot({path:join(output,'07-touch-spiel.png'),fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);console.log('PASS: emulated native touch holds, dialogue taps, shove consequences, pointer cancellation, save/reload and 390px layout. No physical touchscreen used.');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
