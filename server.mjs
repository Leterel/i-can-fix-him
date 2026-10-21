import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname,join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const files=new Map([['/',['index.html','text/html; charset=utf-8']],['/style.css',['style.css','text/css']],['/app.mjs',['app.mjs','text/javascript']],['/game.mjs',['game.mjs','text/javascript']]]);
export function createLocalServer(){return createServer(async(req,res)=>{const item=files.get(new URL(req.url,'http://localhost').pathname);res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'");if(!item||!['GET','HEAD'].includes(req.method)){res.writeHead(404);return res.end();}try{const body=await readFile(join(root,item[0]));res.writeHead(200,{'Content-Type':item[1],'Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:body);}catch{res.writeHead(500);res.end('Datei konnte nicht geladen werden.');}});}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){const server=createLocalServer();server.listen(8841,'127.0.0.1',()=>console.log('I Can Fix Him: http://127.0.0.1:8841'));}
