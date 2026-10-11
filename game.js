'use strict';
const KEY='mosslight-village-v1';
const fresh=()=>({wood:0,seeds:0,warmth:0,garden:0,bakery:false,pond:false,library:false,lanterns:0,last:Date.now()});
let state=fresh();
try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&typeof saved==='object'){for(const k of ['wood','seeds','warmth','garden','last'])if(Number.isFinite(saved[k])&&saved[k]>=0)state[k]=saved[k];state.garden=Math.min(5,Math.floor(state.garden));for(const k of ['bakery','pond','library'])state[k]=saved[k]===true;state.lanterns=Math.min(4,Math.max(0,Math.floor(Number(saved.lanterns)||0)));}}catch{}
const $=id=>document.getElementById(id);
function accrue(now){const seconds=Math.max(0,Math.min((now-state.last)/1000,28800));state.seeds+=seconds*(state.garden/5+(state.pond?.3:0));if(state.bakery){state.warmth+=seconds/10;state.wood+=seconds/8;}state.warmth+=seconds*((state.library?.2:0)+state.lanterns*.025);state.last=now;}
const away=Date.now()-state.last;accrue(Date.now());
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{toast('Saving unavailable. Keep this tab open to retain progress.');}}
function render(){
  for(const k of ['wood','seeds','warmth'])$(k).textContent=Math.floor(state[k]);
  const cost=6+state.garden*4;
  $('plant').disabled=state.garden>=5||state.wood<cost;
  $('plant').innerHTML=state.garden>=5?'Flowers flourishing <span>60 seeds / min</span>':`${state.garden?'Grow garden':'Plant flowers'} <span>${cost} wood · +12 seeds / min</span>`;
  $('restore').disabled=state.bakery||state.wood<24||state.seeds<12;
  $('restore').innerHTML=state.bakery?'Juniper’s bakery <span>+6 warmth / min</span>':'Restore bakery <span>24 wood · 12 seeds</span>';
  for(const [id,label,cost,requirement,income] of [['pond','Build pond',[35,20,8],'bakery','+18 seeds / min'],['library','Open bookshop',[60,35,20],'pond','+12 warmth / min']]){
    $(id).disabled=state[id]||!state[requirement]||state.wood<cost[0]||state.seeds<cost[1]||state.warmth<cost[2];
    $(id).innerHTML=state[id]?`${id==='pond'?'Fern’s pond':'Orla’s bookshop'} <span>${income}</span>`:`${label} <span>${state[requirement]?`${cost[0]} wood · ${cost[1]} seeds · ${cost[2]} ♡`:`First: ${requirement==='bakery'?'bakery':'pond'}`}</span>`;
  }
  $('lantern').disabled=!state.bakery||state.lanterns>=4||state.wood<10||state.warmth<5;
  $('lantern').innerHTML=state.lanterns>=4?'Lantern trail lit <span>+6 warmth / min</span>':`Add lantern (${state.lanterns}/4) <span>${state.bakery?'10 wood · 5 ♡':'First: bakery'}</span>`;
  $('neighbors').textContent=`${Number(state.bakery)+Number(state.pond)+Number(state.library)} / 3 neighbors`;
}

let toastTimer;function toast(t){$('toast').textContent=t;$('toast').style.opacity=1;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').style.opacity=0,3500);}
$('gather').onclick=()=>{accrue(Date.now());state.wood+=3;render();save();toast('+3 wood · Thank you, forest.');};
$('plant').onclick=()=>{accrue(Date.now());const cost=6+state.garden*4;if(state.garden>=5||state.wood<cost)return;state.wood-=cost;state.garden++;render();save();toast('A little patch of possibility. Seeds will grow over time.');};
$('restore').onclick=()=>{accrue(Date.now());if(state.bakery||state.wood<24||state.seeds<12)return;state.wood-=24;state.seeds-=12;state.bakery=true;render();save();toast('Juniper has arrived. The village smells like warm bread.');};
for(const [id,cost,message] of [['pond',[35,20,8],'Fern has arrived. Listen for the frogs.'],['library',[60,35,20],'Orla opened the bookshop. Stay for a story.']]){
  $(id).onclick=()=>{accrue(Date.now());if(state[id]||!state[id==='pond'?'bakery':'pond']||state.wood<cost[0]||state.seeds<cost[1]||state.warmth<cost[2])return;state.wood-=cost[0];state.seeds-=cost[1];state.warmth-=cost[2];state[id]=true;render();save();toast(message);};
}
$('lantern').onclick=()=>{accrue(Date.now());if(!state.bakery||state.lanterns>=4||state.wood<10||state.warmth<5)return;state.wood-=10;state.warmth-=5;state.lanterns++;render();save();toast('One more light along the path.');};
let audioCtx, soundTimer; $('sound').onclick=async()=>{if(soundTimer){clearInterval(soundTimer);soundTimer=null;await audioCtx.suspend();$('sound').textContent='♫ Sound off';$('sound').setAttribute('aria-pressed','false');return;}try{audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();await audioCtx.resume();const note=()=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=[261.63,329.63,392,523.25,587.33][Math.floor(Math.random()*5)];g.gain.setValueAtTime(0,audioCtx.currentTime);g.gain.linearRampToValueAtTime(.035,audioCtx.currentTime+.2);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+2.8);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+3);};note();soundTimer=setInterval(note,2400);$('sound').textContent='♫ Sound on';$('sound').setAttribute('aria-pressed','true');}catch{toast('Sound is unavailable in this browser.');}};
const ctx=$('village').getContext('2d');
let pixelScale=1,pixelX=0,pixelY=0;
const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;const left=Math.round(x*pixelScale+pixelX),top=Math.round(y*pixelScale+pixelY);ctx.fillRect(left,top,Math.max(1,Math.round((x+w)*pixelScale+pixelX)-left),Math.max(1,Math.round((y+h)*pixelScale+pixelY)-top));};
function tree(x,y,s=1){rect(x-2*s,y,4*s,23*s,'#66513d');for(let i=0;i<4;i++){rect(x-(9+i*3)*s,y-(32-i*9)*s,(18+i*6)*s,12*s,i%2?'#365a42':'#294d3c');}rect(x-9*s,y-28*s,7*s,5*s,'#53704b');}
function house(x,y,bakery){rect(x+5,y+16,69,43,bakery?'#ba9b6a':'#a38b63');rect(x,y+57,81,5,'#5d5842');for(let i=0;i<8;i++)rect(x+35-i*5,y+i*3,12+i*10,4,bakery?'#91634f':'#6e7660');rect(x+53,y-2,7,16,'#7a7260');rect(x+34,y+35,15,24,'#594d3e');rect(x+38,y+40,6,10,'#d8b768');for(const wx of [x+13,x+57]){rect(wx,y+32,12,13,'#65523e');rect(wx+2,y+34,8,9,bakery?'#ffd88a':'#dfc47f');rect(wx+5,y+34,2,9,'#7e6c4e');}rect(x+29,y+60,25,4,'#b4a077');}
function drawVillage(t){rect(0,0,480,250,'#283d39');rect(0,70,480,180,'#52694a');for(let i=0;i<25;i++)tree(i*21,48+(i%4)*8,1.3);for(let i=0;i<25;i++)tree(i*22-8,67+(i%3)*7,1.1);for(let i=0;i<30;i++)tree(i*19-5,90+(i%4)*6,.9);rect(0,110,480,140,'#627c51');for(let i=0;i<150;i++){const x=(i*73)%480,y=115+(i*47)%135;rect(x,y,2,2,i%3?'#708a59':'#536d46');}for(let i=0;i<25;i++){rect(207-i,125+i*5,40+i*2,6,'#ae9f72');}rect(120,165,210,15,'#ae9f72');rect(68,172,94,9,'#ae9f72');house(125,92,false);if(state.bakery){house(286,102,true);rect(304,125,37,8,'#e0c78b');rect(309,128,3,2,'#816047');rect(317,128,20,2,'#816047');const f= Math.sin(t/1500)*5;rect(272+f,168,9,10,'#c48048');rect(269+f,163,12,9,'#dd9c56');rect(269+f,160,3,5,'#a75f35');rect(278+f,160,3,5,'#a75f35');rect(272+f,168,7,4,'#efe0b4');rect(270+f,166,2,2,'#303b30');rect(279+f,166,2,2,'#303b30');rect(280+f,174,8,4,'#bd753d');rect(286+f,174,3,4,'#ede1ba');for(let i=0;i<3;i++)rect(341+Math.sin(t/1800+i)*3,93-i*9-(t/300%9),7,5,'#a6b09a');}else{rect(291,128,63,36,'#686d54');for(let i=0;i<7;i++)rect(286+i*6,113+i%3*4,15,5,'#777560');rect(315,142,12,22,'#424e3d');rect(289,158,69,5,'#82905c');}rect(78,184,76,37,'#65563e');for(let i=0;i<5;i++){rect(81+i*14,187,10,30,'#827353');if(i<state.garden)for(let j=0;j<4;j++){const x=85+i*14,y=192+j*7;rect(x,y,2,6,'#577347');rect(x-2,y,6,3,['#e3b285','#e2d69c','#b7a4c0'][j%3]);}}for(const p of [[31,151,1.2],[53,130,1],[422,155,1.2],[451,183,1.4],[390,209,.8],[25,225,1]])tree(...p);rect(209,119,3,23,'#655842');rect(205,119,11,10,'#d7ac5e');rect(208,121,5,6,'#ffe8a0');for(let i=0;i<15;i++){const x=(i*37+Math.sin(t/1900+i)*8+40)%480,y=100+(i*23)%128+Math.cos(t/1700+i)*6;rect(x,y,2,2,Math.sin(t/800+i)>.3?'#e4d78b':'#829562');}drawAdditions(t);}
function drawAdditions(t){
  if(state.pond){
    rect(361,172,61,36,'#8c9564');rect(354,179,75,22,'#8c9564');rect(362,177,59,26,'#547f83');rect(357,184,69,13,'#547f83');
    for(let i=0;i<4;i++)rect(365+i*12,183+i%2*8,8,1,Math.sin(t/800+i)>0?'#95b9a4':'#6c9c9c');
    rect(398,181,9,4,'#91a260');rect(372,194,9,4,'#91a260');rect(407,166,10,9,'#91ac62');rect(407,164,3,4,'#bad38a');rect(414,164,3,4,'#bad38a');rect(408,165,1,2,'#263d35');rect(415,165,1,2,'#263d35');
    for(let i=0;i<3;i++){rect(355+i*5,174-i%2*3,1,9,'#a0a46b');rect(354+i*5,171-i%2*3,3,5,'#806646');}
  }
  if(state.library){
    house(22,92,false);rect(26,123,67,5,'#849d92');rect(27,128,65,5,'#698478');rect(35,125,8,2,'#e2d5a4');rect(48,125,32,2,'#e2d5a4');
    rect(99,158,10,12,'#997a5a');rect(98,154,12,9,'#b9a27a');rect(98,151,3,5,'#997a5a');rect(107,151,3,5,'#997a5a');rect(100,156,3,3,'#eedbb5');rect(106,156,3,3,'#eedbb5');rect(101,157,1,1,'#263d35');rect(107,157,1,1,'#263d35');rect(104,160,2,2,'#dda457');rect(97,165,7,5,'#698478');rect(104,165,7,5,'#e2d5a4');
  }
  for(let i=0;i<state.lanterns;i++){const x=180+i*24,y=184+i%2*17;rect(x,y,2,16,'#66513d');rect(x-3,y-5,8,8,'#a77d4b');rect(x-1,y-3,4,4,'#ffe4a0');rect(x-4,y+16,10,2,'#52694a');}
  // A small picnic spot makes warmth feel like life, rather than just a counter.
  if(state.warmth>=30){rect(255,205,28,16,'#c49b86');for(let i=0;i<4;i++)rect(255+i*7,205,3,16,'#dfc6a2');rect(261,209,8,5,'#b98052');rect(273,210,4,4,'#e5d2a0');}
}
function drawPortrait(t){
  rect(0,0,200,320,'#627c51');
  for(let i=0;i<100;i++)rect((i*73)%200,(i*47)%320,2,2,i%2?'#708a59':'#536d46');
  rect(90,60,20,260,'#ae9f72');rect(52,105,67,10,'#ae9f72');rect(87,164,60,10,'#ae9f72');rect(50,230,55,10,'#ae9f72');
  for(let i=0;i<12;i++)tree(i*19,22+(i%3)*5,.8);
  house(22,40,false);
  if(state.bakery){house(110,100,true);rect(131,125,31,5,'#e0c78b');rect(104,170,9,10,'#c48048');rect(101,164,12,9,'#dd9c56');rect(101,161,3,5,'#a75f35');rect(110,161,3,5,'#a75f35');rect(104,169,6,4,'#efe0b4');rect(103,166,2,2,'#303b30');rect(110,166,2,2,'#303b30');}else{rect(116,122,64,38,'#686d54');rect(110,114,76,10,'#777560');rect(140,143,12,17,'#424e3d');}
  if(state.library){house(14,176,false);rect(18,207,65,7,'#698478');rect(30,209,37,2,'#e2d5a4');rect(91,239,10,12,'#b9a27a');rect(90,235,12,9,'#b9a27a');rect(92,237,3,3,'#eedbb5');rect(98,237,3,3,'#eedbb5');rect(93,238,1,1,'#263d35');rect(99,238,1,1,'#263d35');}
  rect(20,261,70,35,'#65563e');for(let i=0;i<5;i++){rect(23+i*13,264,9,29,'#827353');if(i<state.garden)for(let j=0;j<4;j++){rect(26+i*13,268+j*6,2,5,'#577347');rect(24+i*13,268+j*6,6,2,['#e3b285','#e2d69c','#b7a4c0'][j%3]);}}
  if(state.pond){rect(127,250,59,34,'#8c9564');rect(121,257,70,20,'#547f83');rect(128,253,58,28,'#547f83');for(let i=0;i<4;i++)rect(130+i*12,260+i%2*9,8,1,'#95b9a4');rect(172,259,8,4,'#91a260');rect(174,242,10,8,'#91ac62');rect(174,240,3,3,'#bad38a');rect(181,240,3,3,'#bad38a');rect(175,241,1,1,'#263d35');rect(182,241,1,1,'#263d35');}
  for(const p of [[10,120,.7],[185,60,.8],[12,165,.6],[186,206,.7],[115,304,.6]])tree(...p);
  for(let i=0;i<=state.lanterns;i++){rect(105,88+i*43,2,13,'#66513d');rect(102,84+i*43,8,7,'#a77d4b');rect(104,86+i*43,4,3,'#ffe4a0');}
  for(let i=0;i<12;i++)rect(15+(i*37)%180+Math.sin(t/1900+i)*3,48+(i*23)%245,1,1,Math.sin(t/800+i)>.3?'#e4d78b':'#829562');
}
function draw(t){
  const canvas=$('village');
  const w=Math.max(1,Math.ceil(window.innerWidth/3)),h=Math.max(1,Math.ceil(window.innerHeight/3));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;ctx.imageSmoothingEnabled=false;}
  pixelScale=1;pixelX=0;pixelY=0;rect(0,0,w,h,'#52694a');
  // Recompose for portrait screens instead of cropping the village away.
  const top=window.innerWidth<=700?42:26,bottom=window.innerWidth<=700?63:48;
  const portrait=window.innerWidth<650&&window.innerHeight>window.innerWidth;
  const sceneW=portrait?200:480,sceneH=portrait?320:250;
  const scale=Math.min(w/sceneW,Math.max(1,h-top-bottom)/sceneH);
  const ox=(w-sceneW*scale)/2,oy=top+(h-top-bottom-sceneH*scale)/2;
  for(let i=0;i<Math.ceil(w/23)+1;i++)tree(i*23,25+(i%3)*4,.9);
  for(let i=0;i<100;i++)rect((i*73)%w,35+(i*43)%Math.max(1,h-35),2,2,i%2?'#627c51':'#58734b');
  pixelScale=scale;pixelX=Math.floor(ox);pixelY=Math.floor(oy);if(portrait)drawPortrait(t);else drawVillage(t);
  pixelScale=1;pixelX=0;pixelY=0;requestAnimationFrame(draw);
}

render();save();requestAnimationFrame(draw);setInterval(()=>{accrue(Date.now());render();save();},1000);document.addEventListener('visibilitychange',()=>{accrue(Date.now());render();save();});if(away>60000&&(state.garden||state.bakery))toast('Welcome back. Your village kept growing while you were away.');
