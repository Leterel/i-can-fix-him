import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { resolve,join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createLocalServer } from '../server.mjs';
const {chromium}=await import(pathToFileURL(resolve(process.env.PLAYWRIGHT_MODULE||'../discord-alternative/node_modules/playwright/index.mjs')).href);
const output=resolve(process.env.GAME_OUTPUT||'test-results');await mkdir(output,{recursive:true});
const server=createLocalServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{
 browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}`);await page.locator('#game').focus();await page.waitForTimeout(250);
 await page.screenshot({path:join(output,'01-betonbezirk.png'),fullPage:true});
 const move=async(key,ms)=>{await page.keyboard.down(key);await page.waitForTimeout(ms);await page.keyboard.up(key);};
 const ronny=async()=>{await move('w',700);await move('a',500);await page.keyboard.press('e');await page.getByRole('heading',{name:'Ronny, 38',exact:true}).waitFor();};
 await ronny();await page.screenshot({path:join(output,'02-ronny-dialog.png'),fullPage:true});await page.keyboard.press('Escape');await page.keyboard.press('f');
 assert.equal(await page.locator('#suspicion-value').textContent(),'22');assert.match(await page.locator('#log li').first().textContent(),/stolpert/);
 await page.locator('#reset').click();assert.equal(await page.locator('#suspicion-value').textContent(),'0');
 await ronny();await page.keyboard.press('1');assert.equal(await page.locator('#money').textContent(),'30 €');
 await page.keyboard.press('e');await page.locator('#conversation[open]').waitFor();await page.keyboard.press('2');assert.equal(await page.locator('#boundaries').textContent(),'1 / 3');
 await move('w',900);await move('a',650);await page.keyboard.press('e');await page.getByRole('heading',{name:'Uwe, 47',exact:true}).waitFor();await page.keyboard.press('2');assert.equal(await page.locator('#boundaries').textContent(),'2 / 3');
 await move('s',2200);await page.keyboard.press('e');await page.getByRole('heading',{name:'Mara, 34',exact:true}).waitFor();await page.keyboard.press('3');
 await page.getByRole('heading',{name:'FEIERABEND IST EINE GRENZE',exact:true}).waitFor();await page.screenshot({path:join(output,'03-feierabend.png'),fullPage:true});
 await page.locator('#continue').click();assert.equal(await page.locator('#ending').evaluate(el=>el.open),false);
 await page.locator('#reset').click();assert.equal(await page.locator('#boundaries').textContent(),'0 / 3');assert.equal(await page.locator('#money').textContent(),'50 €');
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:join(output,'04-small-screen.png'),fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);console.log('PASS: real keyboard movement, dialogue, costs, shove consequences, reset, three distinct boundaries, ending, continue, small-screen layout.');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
