export const WIDTH=1440, HEIGHT=1080;
export const buildings=[
  {x:100,y:80,w:310,h:180,z:105,name:'FIX-IT KIOSK',color:'#566764'},
  {x:830,y:70,w:420,h:220,z:130,name:'AMT FÜR ZWISCHENFÄLLE',color:'#746663'},
  {x:80,y:690,w:310,h:230,z:110,name:'SELBSTHILFE / SELBSTZAHLER',color:'#696580'},
  {x:940,y:720,w:350,h:210,z:85,name:'PARKHAUS DER GEFÜHLE',color:'#5e6b70'},
];
const templates=[
  {id:'ronny',name:'Ronny, 38',role:'Projekt mit Beinen',x:610,y:460,color:'#e68555',line:'Ich bin nicht toxisch. Ich habe nur eine schwierige Premium-Persönlichkeit.',choices:['20 € in sein Potenzial investieren','Klare Grenze setzen','Seine Ausrede als Werbeslogan verkaufen']},
  {id:'petra',name:'Petra, 51',role:'Sachbearbeitung für Sachbearbeitung',x:1020,y:390,color:'#a8b593',line:'Für Ihre Beschwerde fehlt die Bestätigung, dass Sie sich beschweren dürfen.',choices:['Formular 8B höflich ausfüllen','Einen Stempel mit Mundgeräuschen imitieren','Nein sagen und Feierabend beantragen']},
  {id:'mara',name:'Mara, 34',role:'Grenzbeauftragte ohne Dienstwagen',x:460,y:740,color:'#c39dc3',line:'Du musst kein Renovierungsprojekt daten. Setz dich. Die Bank ist gratis.',choices:['Pause machen und zuhören','Ihren Rat wegdiskutieren','Eine ehrliche Grenze üben']},
  {id:'uwe',name:'Uwe, 47',role:'Coach mit geliehenem Megafon',x:480,y:300,color:'#d8c582',line:'Für nur 15 Euro mache ich dein Problem zu meinem Geschäftsmodell.',choices:['Den Premium-Heilungsplan kaufen','Den Vertrag laut vorlesen','Sein Megafon mit Entenlauten beantworten']},
];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createGame(){return {player:{x:710,y:610},npcs:templates.map(n=>({...n,choices:[...n.choices],trust:0,pushes:0,visits:0})),chaos:0,suspicion:0,energy:100,money:50,boundaries:0,boundaryPeople:[],decisions:0,dialog:null,notice:'Einen schlechten Tag kann man auch gut beenden.',log:['Betonbezirk, 17:43. Alle hier sind erwachsen. Die Probleme auch.'],time:0,cooldown:0,fineIssued:false,closed:false,ending:null};}
export function log(s,message){s.notice=message;s.log.unshift(message);s.log=s.log.slice(0,7);}
export function nearest(s){return s.npcs.reduce((best,n)=>Math.hypot(n.x-s.player.x,n.y-s.player.y)<105&&(!best||Math.hypot(n.x-s.player.x,n.y-s.player.y)<Math.hypot(best.x-s.player.x,best.y-s.player.y))?n:best,null);}
export function canStand(x,y){return x>=35&&x<=WIDTH-35&&y>=35&&y<=HEIGHT-35&&!buildings.some(b=>x>b.x-16&&x<b.x+b.w+16&&y>b.y-12&&y<b.y+b.h+12);}
export function update(s,dt,keys={}){
  dt=clamp(Number.isFinite(dt)?dt:0,0,.05);s.time+=dt;s.cooldown=Math.max(0,s.cooldown-dt);
  if(!s.dialog&&!s.ending){let dx=Number(!!keys.right)-Number(!!keys.left),dy=Number(!!keys.down)-Number(!!keys.up),length=Math.hypot(dx,dy)||1;const speed=(s.energy<15?100:180)*dt;
    const nx=s.player.x+dx/length*speed,ny=s.player.y+dy/length*speed;
    if(canStand(nx,s.player.y))s.player.x=nx;if(canStand(s.player.x,ny))s.player.y=ny;
  }
}
export function interact(s){if(s.ending)return;const npc=nearest(s);if(!npc){log(s,'Niemand in Gesprächsreichweite. WASD: hingehen.');return;}s.dialog=npc.id;npc.visits++;}
export function closeDialog(s){s.dialog=null;}
export function consequences(s){s.chaos=clamp(s.chaos,0,100);s.suspicion=clamp(s.suspicion,0,100);s.energy=clamp(s.energy,0,100);s.money=Math.max(0,s.money);
  if(s.chaos>=50&&!s.closed){s.closed=true;log(s,'Der Kiosk schließt wegen „atmosphärischer Unzumutbarkeit“. Uwe verkauft jetzt nur noch Luft.');}
  if(s.suspicion>=60&&!s.fineIssued){s.fineIssued=true;s.money=Math.max(0,s.money-12);log(s,'Das Amt kassiert 12 € Unruhepauschale. Deine Quittung ist ein enttäuschter Blick.');}
  if(s.energy<=0){s.ending='EMOTIONALE BAUSTELLE';log(s,'Deine Energie ist aufgebraucht. Alle Projekte warten. Du darfst neu anfangen.');}
  else if(s.boundaries>=3){s.ending='FEIERABEND IST EINE GRENZE';log(s,'Drei klare Grenzen. Niemand wurde repariert. Du hast trotzdem gewonnen. Freies Weiterspielen oder Neustart.');}
}
export function choose(s,index){const n=s.npcs.find(n=>n.id===s.dialog);if(!n||!Number.isInteger(index)||index<0||index>2||s.ending)return;
  s.dialog=null;s.decisions++;
  const boundary=()=>{if(!s.boundaryPeople.includes(n.id)){s.boundaryPeople.push(n.id);s.boundaries++;}};
  if(n.trust<=-3){s.suspicion+=5;log(s,`${n.name} spricht nach deinen Schubsereien nur noch über die Gegensprechanlage. Ein anderer Weg bleibt offen.`);consequences(s);return;}
  const charge=cost=>{if(s.money<cost){log(s,'Zu wenig Geld. Zum ersten Mal schützt dich dein Kontostand.');return false;}s.money-=cost;s.energy-=14;return true;};
  if(n.id==='ronny'){
    if(index===0&&charge(20)){s.suspicion+=12;log(s,'Ronny investiert deine 20 € in ein „Entschuldigungs-Abo“. Deine Energie: −14.');}
    if(index===1){boundary();s.energy+=6;n.trust++;log(s,'Du bist kein Sanierungsunternehmen. Ronny schmollt, deine Grenze bleibt.');}
    if(index===2){s.chaos+=18;s.suspicion+=8;s.money+=5;log(s,'„Premium-Persönlichkeit“ steht jetzt auf der Amtstür. 5 € Honorar, deutlich mehr Chaos.');}
  }else if(n.id==='petra'){
    if(index===0){s.energy-=10;s.suspicion-=12;n.trust++;log(s,'Petra stempelt dein Formular: „Überraschend normal“. Misstrauen −12, Energie −10.');}
    if(index===1){s.chaos+=20;s.suspicion+=20;log(s,'Dein Mundstempel ist nicht ISO-zertifiziert. Das Amt eröffnet eine Akte.');}
    if(index===2){boundary();s.energy+=4;log(s,'Feierabend beantragt. Petra flüstert: „Guter Antrag.“');}
  }else if(n.id==='mara'){
    if(index===0){s.energy+=20;s.chaos-=15;s.suspicion-=8;n.trust++;log(s,'Eine Pause ohne Optimierungsziel. Energie +20, Chaos −15.');}
    if(index===1){s.energy-=12;s.suspicion+=8;log(s,'Du hältst einen Vortrag über das Zuhören. Mara wartet auf die Pointe.');}
    if(index===2){boundary();s.energy+=5;n.trust++;log(s,'„Nein, ich übernehme das nicht.“ Der Himmel fällt erstaunlich wenig herunter.');}
  }else{
    if(index===0){if(s.closed)log(s,'Uwe verkauft bei geschlossenem Kiosk keine Heilungspläne mehr.');else if(charge(15)){s.suspicion+=10;log(s,'Der Plan besteht aus „Denk positiv“ auf einem Kassenzettel. 15 € weg.');}}
    if(index===1){s.suspicion-=10;boundary();n.trust++;log(s,'Im Kleingedruckten steht nur „Uwe haftet nicht“. Du unterschreibst nicht.');}
    if(index===2){s.chaos+=22;s.suspicion+=12;log(s,'QUAK. Uwes Vortrag über Respekt bekommt eine sehr kurze Rezension.');}
  }
  consequences(s);
}
export function shove(s){if(s.dialog||s.ending||s.cooldown>0)return;const n=nearest(s);if(!n){log(s,'Du schubst Luft. Sie nimmt es professionell.');return;}s.cooldown=1.3;n.pushes++;n.trust--;s.energy-=8;s.chaos+=16;s.suspicion+=22;
  const dx=n.x-s.player.x,dy=n.y-s.player.y,len=Math.hypot(dx,dy)||1,nx=n.x+dx/len*34,ny=n.y+dy/len*34;
  if(canStand(nx,ny)){n.x=nx;n.y=ny;}log(s,`${n.name} stolpert theatralisch. Keine Verletzung, aber Vertrauen −1 und eine neue Beschwerde.`);consequences(s);}
export function continueSandbox(s){if(s.ending&&s.energy>0){s.ending=null;s.boundaries=0;s.boundaryPeople=[];log(s,'Feierabend verschoben. Deine Entscheidungen bleiben im Viertel gespeichert.');}}
