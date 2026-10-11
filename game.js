'use strict';
const KEY='mosslight-village-v1';
const fresh=()=>({wood:0,seeds:0,warmth:0,garden:0,bakery:false,pond:false,library:false,lanterns:0,orchard:false,workshop:false,teahouse:false,tools:0,festivalAt:0,square:0,completed:false,upgrades:{bakery:0,pond:0,library:0,orchard:0,workshop:0,teahouse:0},last:Date.now()});
let state=fresh();
try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&typeof saved==='object'){for(const k of ['wood','seeds','warmth','garden','last'])if(Number.isFinite(saved[k])&&saved[k]>=0)state[k]=saved[k];state.garden=Math.min(5,Math.floor(state.garden));for(const k of ['bakery','pond','library','orchard','workshop','teahouse'])state[k]=saved[k]===true;state.lanterns=Math.min(4,Math.max(0,Math.floor(Number(saved.lanterns)||0)));state.tools=Math.min(5,Math.max(0,Math.floor(Number(saved.tools)||0)));state.festivalAt=Number.isFinite(saved.festivalAt)&&saved.festivalAt>=0?saved.festivalAt:0;state.square=Math.min(3,Math.max(0,Math.floor(Number(saved.square)||0)));state.completed=saved.completed===true&&state.square===3;for(const id of Object.keys(state.upgrades)){const level=Number(saved.upgrades?.[id]);if(state[id]&&Number.isFinite(level))state.upgrades[id]=Math.min(3,Math.max(0,Math.floor(level)));}}}catch{}
const $=id=>document.getElementById(id);
const buildings={
  bakery:{name:'Bakery',rates:{wood:7.5,warmth:6},costScale:1,details:['Bread stall','Striped awning','Sunlit kitchen']},
  pond:{name:'Pond',rates:{seeds:18},costScale:1.2,details:['Lily beds','Waterside bench','Flowered banks']},
  library:{name:'Bookshop',rates:{warmth:12},costScale:1.4,details:['Reading bench','Book shelves','Story corner']},
  orchard:{name:'Orchard',rates:{seeds:30},costScale:1.6,details:['Fruit baskets','Harvest baskets','Blossom grove']},
  workshop:{name:'Workshop',rates:{wood:24},costScale:1.8,details:['Lumber rack','Tool bench','Covered workyard']},
  teahouse:{name:'Tea garden',rates:{warmth:24},costScale:2,details:['Flower pots','Garden planters','Lantern canopy']}
};
function buildingRates(id,level=state.upgrades[id]){return Object.fromEntries(Object.entries(buildings[id].rates).map(([resource,rate])=>[resource,rate*(1+level*.5)]));}
function incomePerMinute(){const rates={wood:0,seeds:state.garden*12,warmth:state.lanterns*1.5};for(const id of Object.keys(buildings))if(state[id])for(const [resource,rate] of Object.entries(buildingRates(id)))rates[resource]+=rate;return rates;}
function incomeLabel(rates){return Object.entries(rates).map(([resource,rate])=>`${Number(rate.toFixed(2))} ${resource==='warmth'?'♡':resource}/min`).join(' · ');}
function upgradeCost(id){const level=state.upgrades[id],scale=buildings[id].costScale;return [Math.round([60,180,450][level]*scale),Math.round([15,45,100][level]*scale),Math.round([25,90,240][level]*scale)];}
function accrue(now){const seconds=Math.max(0,Math.min((now-state.last)/1000,28800));const rates=incomePerMinute();for(const resource of ['wood','seeds','warmth'])state[resource]+=seconds*rates[resource]/60;state.last=now;}
const away=Date.now()-state.last;accrue(Date.now());
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{toast('Saving unavailable. Keep this tab open to retain progress.');}}
const projects=[
  {id:'orchard',label:'Plant orchard',resident:'Clover’s orchard',cost:[120,100,120],requires:'library',income:'+30 seeds / min'},
  {id:'workshop',label:'Build workshop',resident:'Alder’s workshop',cost:[220,160,220],requires:'orchard',income:'+24 wood / min'},
  {id:'teahouse',label:'Open tea garden',resident:'Hazel’s tea garden',cost:[350,250,350],requires:'workshop',income:'+24 warmth / min'}
];
function canAfford(cost){return state.wood>=cost[0]&&state.seeds>=cost[1]&&state.warmth>=cost[2];}
function spend(cost){state.wood-=cost[0];state.seeds-=cost[1];state.warmth-=cost[2];}
function costLabel(cost){return [cost[0]&&`${cost[0]} wood`,cost[1]&&`${cost[1]} seeds`,cost[2]&&`${cost[2]} ♡`].filter(Boolean).join(' · ');}
const residentKeys=['bakery','pond','library','orchard','workshop','teahouse'];
const squareStages=[
  {label:'Lay square stones',cost:[500,300,900],message:'Alder laid the stones. There’s room for everyone.'},
  {label:'Plant square flowers',cost:[300,600,1500],message:'Clover and Fern filled the square with flowers.'},
  {label:'Raise the Mosslight',cost:[600,400,2200],message:'The village lantern is ready for its first festival.'}
];
const finaleCost=[400,600,3800];
function finaleReady(){return residentKeys.every(k=>state[k])&&state.garden===5&&state.lanterns===4&&state.square===3&&residentKeys.every(k=>state.upgrades[k]>=1);}
function renderFinale(){
  const neighbors=residentKeys.filter(k=>state[k]).length;
  const stage=squareStages[state.square];
  $('square').disabled=!residentKeys.every(k=>state[k])||!stage||!canAfford(stage.cost);
  $('square').innerHTML=stage?`${stage.label} <span>${neighbors===6?costLabel(stage.cost):'First: all 6 neighbors'}</span>`:'Square restored <span>The Mosslight is ready</span>';
  $('mosslight').disabled=state.completed||!finaleReady()||!canAfford(finaleCost);
  $('mosslight').innerHTML=state.completed?'Festival complete <span>Welcome home ♡</span>':`Host Mosslight Festival <span>${finaleReady()?costLabel(finaleCost):'Finish the milestones below'}</span>`;
  $('memories').disabled=!state.completed;
  $('memories').innerHTML=`Festival memories <span>${state.completed?'Read the ending again':'First: Mosslight Festival'}</span>`;
  $('milestones').innerHTML=[['Neighbors',neighbors,6],['Flowers',state.garden,5],['Lanterns',state.lanterns,4],['Square',state.square,3],['Upgrades',residentKeys.filter(k=>state.upgrades[k]>=1).length,6]].map(([name,value,total])=>`<span class="${value===total?'done':''}">${value===total?'✓':'○'} ${name} ${value}/${total}</span>`).join('');
  $('goal').textContent=state.completed?'Mosslight Festival complete':neighbors<6?'Welcome all 6 neighbors':!finaleReady()?'Prepare the village for the festival':'Ready for the Mosslight Festival';
}
function render(){
  for(const k of ['wood','seeds','warmth']){const amount=Math.floor(state[k]);$(k).textContent=amount>=1000000?`${Number((amount/1000000).toFixed(1))}m`:amount>=10000?`${Number((amount/1000).toFixed(1))}k`:amount;$(k).title=`${amount} ${k}`;}
  const cost=6+state.garden*4;
  $('plant').disabled=state.garden>=5||state.wood<cost;
  $('plant').innerHTML=state.garden>=5?'Flowers flourishing <span>60 seeds / min</span>':`${state.garden?'Grow garden':'Plant flowers'} <span>${cost} wood · +12 seeds / min</span>`;
  $('restore').disabled=state.bakery||state.wood<24||state.seeds<12;
  $('restore').innerHTML=state.bakery?`Juniper’s bakery <span>${incomeLabel(buildingRates('bakery'))}</span>`:'Restore bakery <span>24 wood · 12 seeds</span>';
  for(const [id,label,cost,requirement,income] of [['pond','Build pond',[35,20,8],'bakery','+18 seeds / min'],['library','Open bookshop',[60,35,20],'pond','+12 warmth / min']]){
    $(id).disabled=state[id]||!state[requirement]||state.wood<cost[0]||state.seeds<cost[1]||state.warmth<cost[2];
    $(id).innerHTML=state[id]?`${id==='pond'?'Fern’s pond':'Orla’s bookshop'} <span>${incomeLabel(buildingRates(id))}</span>`:`${label} <span>${state[requirement]?`${cost[0]} wood · ${cost[1]} seeds · ${cost[2]} ♡`:`First: ${requirement==='bakery'?'bakery':'pond'}`}</span>`;
  }
  $('lantern').disabled=!state.bakery||state.lanterns>=4||state.wood<10||state.warmth<5;
  $('lantern').innerHTML=state.lanterns>=4?'Lantern trail lit <span>+6 warmth / min</span>':`Add lantern (${state.lanterns}/4) <span>${state.bakery?'10 wood · 5 ♡':'First: bakery'}</span>`;
  $('neighbors').textContent=`${['bakery','pond','library','orchard','workshop','teahouse'].filter(k=>state[k]).length} / 6 neighbors`;
  $('gather').innerHTML=`Gather wood <span>+${3+state.tools*2} wood</span>`;
  for(const project of projects){
    const {id,label,resident,cost,requires,income}=project;
    $(id).disabled=state[id]||!state[requires]||!canAfford(cost);
    $(id).innerHTML=state[id]?`${resident} <span>${incomeLabel(buildingRates(id))}</span>`:`${label} <span>${state[requires]?costLabel(cost):'First: '+({library:'bookshop',orchard:'orchard',workshop:'workshop'}[requires])}</span>`;
  }
  const toolCost=[25+state.tools*20,0,8+state.tools*8];
  $('tools').disabled=!state.workshop||state.tools>=5||!canAfford(toolCost);
  $('tools').innerHTML=state.tools>=5?'Tools mastered <span>+13 wood / tap</span>':`Improve tools (${state.tools}/5) <span>${state.workshop?costLabel(toolCost):'First: workshop'}</span>`;
  $('trade').disabled=!state.orchard||state.seeds<30;
  $('trade').innerHTML=`Trade seeds <span>${state.orchard?'30 seeds → 15 wood':'First: orchard'}</span>`;
  const wait=Math.max(0,Math.ceil((state.festivalAt-Date.now())/1000));
  $('festival').disabled=!state.teahouse||!canAfford([20,40,0])||wait>0;
  const rates=incomePerMinute();
  for(const resource of ['wood','seeds','warmth'])$(`${resource}-income`).textContent=`+${Number(rates[resource].toFixed(2))}/min`;
  for(const id of residentKeys){const level=state.upgrades[id],b=buildings[id];$(`upgrade-${id}`).disabled=!state[id]||level>=3||!canAfford(upgradeCost(id));$(`upgrade-${id}`).innerHTML=`${b.name} ${level}/3 <span>${!state[id]?'First: '+b.name.toLowerCase():level===3?incomeLabel(buildingRates(id)):'Next: '+incomeLabel(buildingRates(id,level+1))}</span>${state[id]&&level<3?`<span>${costLabel(upgradeCost(id))}</span>`:''}`;$(`upgrade-${id}`).title=state[id]&&level<3?`${b.details[level]} · Next: ${incomeLabel(buildingRates(id,level+1))}`:'';}
  renderFinale();
  $('festival').innerHTML=`Host tea picnic <span>${!state.teahouse?'First: tea garden':wait?`Ready in ${Math.floor(wait/60)}:${String(wait%60).padStart(2,'0')}`:'20 wood · 40 seeds → 40 ♡'}</span>`;

}

let toastTimer;function toast(t){$('toast').textContent=t;$('toast').style.opacity=1;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').style.opacity=0,3500);}
$('gather').onclick=()=>{accrue(Date.now());const amount=3+state.tools*2;state.wood+=amount;render();save();toast(`+${amount} wood`);};
$('plant').onclick=()=>{accrue(Date.now());const cost=6+state.garden*4;if(state.garden>=5||state.wood<cost)return;state.wood-=cost;state.garden++;render();save();toast('A little patch of possibility. Seeds will grow over time.');};
$('restore').onclick=()=>{accrue(Date.now());if(state.bakery||state.wood<24||state.seeds<12)return;state.wood-=24;state.seeds-=12;state.bakery=true;render();save();toast('Juniper has arrived. The village smells like warm bread.');};
for(const [id,cost,message] of [['pond',[35,20,8],'Fern has arrived. Listen for the frogs.'],['library',[60,35,20],'Orla opened the bookshop. Stay for a story.']]){
  $(id).onclick=()=>{accrue(Date.now());if(state[id]||!state[id==='pond'?'bakery':'pond']||state.wood<cost[0]||state.seeds<cost[1]||state.warmth<cost[2])return;state.wood-=cost[0];state.seeds-=cost[1];state.warmth-=cost[2];state[id]=true;render();save();toast(message);};
}
$('lantern').onclick=()=>{accrue(Date.now());if(!state.bakery||state.lanterns>=4||state.wood<10||state.warmth<5)return;state.wood-=10;state.warmth-=5;state.lanterns++;render();save();toast('One more light along the path.');};
for(const project of projects)$(project.id).onclick=()=>{
  accrue(Date.now());if(state[project.id]||!state[project.requires]||!canAfford(project.cost))return;
  spend(project.cost);state[project.id]=true;render();save();toast(`${project.resident} is open. Welcome home!`);
};
$('tools').onclick=()=>{accrue(Date.now());const cost=[25+state.tools*20,0,8+state.tools*8];if(!state.workshop||state.tools>=5||!canAfford(cost))return;spend(cost);state.tools++;render();save();toast('Alder made your gathering tools a little better.');};
$('trade').onclick=()=>{accrue(Date.now());if(!state.orchard||state.seeds<30)return;state.seeds-=30;state.wood+=15;render();save();toast('Clover traded your seeds for 15 wood.');};
$('festival').onclick=()=>{accrue(Date.now());if(!state.teahouse||state.festivalAt>Date.now()||!canAfford([20,40,0]))return;spend([20,40,0]);state.warmth+=40;state.festivalAt=Date.now()+300000;render();save();toast('Everyone came for tea. +40 warmth');};
for(const id of residentKeys)$(`upgrade-${id}`).onclick=()=>{accrue(Date.now());if(!state[id]||state.upgrades[id]>=3)return;const cost=upgradeCost(id);if(!canAfford(cost))return;spend(cost);state.upgrades[id]++;render();save();toast(`${buildings[id].details[state.upgrades[id]-1]} added. ${incomeLabel(buildingRates(id))}`);};
$('square').onclick=()=>{accrue(Date.now());const stage=squareStages[state.square];if(!stage||!residentKeys.every(k=>state[k])||!canAfford(stage.cost))return;spend(stage.cost);state.square++;render();save();toast(stage.message);};
$('mosslight').onclick=()=>{accrue(Date.now());if(state.completed||!finaleReady()||!canAfford(finaleCost))return;spend(finaleCost);state.completed=true;render();save();toast('The Mosslight Festival has begun. Welcome home.');showEnding();};
function showEnding(){if(!$('ending').open)$('ending').showModal();}
$('memories').onclick=()=>{if(state.completed)showEnding();};
$('keep-playing').onclick=()=>$('ending').close();
const actionPages=[['village-tab','village-actions'],['expand-tab','expansion-actions'],['square-tab','square-actions'],['upgrade-tab','upgrade-actions']];
for(const [id,panel] of actionPages)$(id).onclick=()=>{
  for(const [button,page] of actionPages){$(page).hidden=page!==panel;$(button).setAttribute('aria-pressed',String(button===id));}
};
let audioCtx, soundTimer; $('sound').onclick=async()=>{if(soundTimer){clearInterval(soundTimer);soundTimer=null;await audioCtx.suspend();$('sound').textContent='♫ Sound off';$('sound').setAttribute('aria-pressed','false');return;}try{audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();await audioCtx.resume();const note=()=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=[261.63,329.63,392,523.25,587.33][Math.floor(Math.random()*5)];g.gain.setValueAtTime(0,audioCtx.currentTime);g.gain.linearRampToValueAtTime(.035,audioCtx.currentTime+.2);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+2.8);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+3);};note();soundTimer=setInterval(note,2400);$('sound').textContent='♫ Sound on';$('sound').setAttribute('aria-pressed','true');}catch{toast('Sound is unavailable in this browser.');}};
const ctx=$('village').getContext('2d');
let pixelScale=1,pixelX=0,pixelY=0;
const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;const left=Math.round(x*pixelScale+pixelX),top=Math.round(y*pixelScale+pixelY);ctx.fillRect(left,top,Math.max(1,Math.round((x+w)*pixelScale+pixelX)-left),Math.max(1,Math.round((y+h)*pixelScale+pixelY)-top));};
function tree(x,y,s=1){rect(x-2*s,y,4*s,23*s,'#66513d');for(let i=0;i<4;i++){rect(x-(9+i*3)*s,y-(32-i*9)*s,(18+i*6)*s,12*s,i%2?'#365a42':'#294d3c');}rect(x-9*s,y-28*s,7*s,5*s,'#53704b');}
function house(x,y,bakery){rect(x+5,y+16,69,43,bakery?'#ba9b6a':'#a38b63');rect(x,y+57,81,5,'#5d5842');for(let i=0;i<8;i++)rect(x+35-i*5,y+i*3,12+i*10,4,bakery?'#91634f':'#6e7660');rect(x+53,y-2,7,16,'#7a7260');rect(x+34,y+35,15,24,'#594d3e');rect(x+38,y+40,6,10,'#d8b768');for(const wx of [x+13,x+57]){rect(wx,y+32,12,13,'#65523e');rect(wx+2,y+34,8,9,bakery?'#ffd88a':'#dfc47f');rect(wx+5,y+34,2,9,'#7e6c4e');}rect(x+29,y+60,25,4,'#b4a077');}
function drawVillage(t){rect(0,0,480,250,'#283d39');rect(0,70,480,180,'#52694a');for(let i=0;i<25;i++)tree(i*21,48+(i%4)*8,1.3);for(let i=0;i<25;i++)tree(i*22-8,67+(i%3)*7,1.1);for(let i=0;i<30;i++)tree(i*19-5,90+(i%4)*6,.9);rect(0,110,480,140,'#627c51');for(let i=0;i<150;i++){const x=(i*73)%480,y=115+(i*47)%135;rect(x,y,2,2,i%3?'#708a59':'#536d46');}for(let i=0;i<25;i++){rect(207-i,125+i*5,40+i*2,6,'#ae9f72');}rect(120,165,210,15,'#ae9f72');rect(68,172,94,9,'#ae9f72');house(125,92,false);if(state.bakery){house(286,102,true);rect(304,125,37,8,'#e0c78b');rect(309,128,3,2,'#816047');rect(317,128,20,2,'#816047');if(!state.completed){const f= Math.sin(t/1500)*5;rect(272+f,168,9,10,'#c48048');rect(269+f,163,12,9,'#dd9c56');rect(269+f,160,3,5,'#a75f35');rect(278+f,160,3,5,'#a75f35');rect(272+f,168,7,4,'#efe0b4');rect(270+f,166,2,2,'#303b30');rect(279+f,166,2,2,'#303b30');rect(280+f,174,8,4,'#bd753d');rect(286+f,174,3,4,'#ede1ba');}for(let i=0;i<3;i++)rect(341+Math.sin(t/1800+i)*3,93-i*9-(t/300%9),7,5,'#a6b09a');}else{rect(291,128,63,36,'#686d54');for(let i=0;i<7;i++)rect(286+i*6,113+i%3*4,15,5,'#777560');rect(315,142,12,22,'#424e3d');rect(289,158,69,5,'#82905c');}rect(78,184,76,37,'#65563e');for(let i=0;i<5;i++){rect(81+i*14,187,10,30,'#827353');if(i<state.garden)for(let j=0;j<4;j++){const x=85+i*14,y=192+j*7;rect(x,y,2,6,'#577347');rect(x-2,y,6,3,['#e3b285','#e2d69c','#b7a4c0'][j%3]);}}for(const p of [[31,151,1.2],[53,130,1],[422,155,1.2],[451,183,1.4],[390,209,.8],[25,225,1]])tree(...p);rect(209,119,3,23,'#655842');rect(205,119,11,10,'#d7ac5e');rect(208,121,5,6,'#ffe8a0');for(let i=0;i<15;i++){const x=(i*37+Math.sin(t/1900+i)*8+40)%480,y=100+(i*23)%128+Math.cos(t/1700+i)*6;rect(x,y,2,2,Math.sin(t/800+i)>.3?'#e4d78b':'#829562');}drawAdditions(t);drawExpansion(t,false);drawSquare(t,false);drawUpgrades(false);}
function drawAdditions(t){
  if(state.pond){
    rect(361,172,61,36,'#8c9564');rect(354,179,75,22,'#8c9564');rect(362,177,59,26,'#547f83');rect(357,184,69,13,'#547f83');
    for(let i=0;i<4;i++)rect(365+i*12,183+i%2*8,8,1,Math.sin(t/800+i)>0?'#95b9a4':'#6c9c9c');
    rect(398,181,9,4,'#91a260');rect(372,194,9,4,'#91a260');if(!state.completed){rect(407,166,10,9,'#91ac62');rect(407,164,3,4,'#bad38a');rect(414,164,3,4,'#bad38a');rect(408,165,1,2,'#263d35');rect(415,165,1,2,'#263d35');
    }
    for(let i=0;i<3;i++){rect(355+i*5,174-i%2*3,1,9,'#a0a46b');rect(354+i*5,171-i%2*3,3,5,'#806646');}
  }
  if(state.library){
    house(22,92,false);rect(26,123,67,5,'#849d92');rect(27,128,65,5,'#698478');rect(35,125,8,2,'#e2d5a4');rect(48,125,32,2,'#e2d5a4');
    if(!state.completed){rect(99,158,10,12,'#997a5a');rect(98,154,12,9,'#b9a27a');rect(98,151,3,5,'#997a5a');rect(107,151,3,5,'#997a5a');rect(100,156,3,3,'#eedbb5');rect(106,156,3,3,'#eedbb5');rect(101,157,1,1,'#263d35');rect(107,157,1,1,'#263d35');rect(104,160,2,2,'#dda457');rect(97,165,7,5,'#698478');rect(104,165,7,5,'#e2d5a4');}
  }
  for(let i=0;i<state.lanterns;i++){const x=180+i*24,y=184+i%2*17;rect(x,y,2,16,'#66513d');rect(x-3,y-5,8,8,'#a77d4b');rect(x-1,y-3,4,4,'#ffe4a0');rect(x-4,y+16,10,2,'#52694a');}
  // A small picnic spot makes warmth feel like life, rather than just a counter.
  if(state.warmth>=30&&!state.square){rect(255,205,28,16,'#c49b86');for(let i=0;i<4;i++)rect(255+i*7,205,3,16,'#dfc6a2');rect(261,209,8,5,'#b98052');rect(273,210,4,4,'#e5d2a0');}
}
function fruitTree(x,y,t){
  tree(x,y,1);for(let i=0;i<5;i++){rect(x-12+(i*7)%24,y-21+(i%3)*7,3,3,'#dca073');rect(x-11+(i*7)%24,y-22+(i%3)*7,1,1,'#f0c18b');}
  rect(x-10,y+22,20,2,'#52694a');
}
function neighbor(x,y,kind,t,atFestival=false){
  if(state.completed&&!atFestival)return;
  const bob=Math.sin(t/650)>0?1:0;y+=bob;
  const color=kind==='rabbit'?'#d1bf9b':kind==='beaver'?'#99704f':'#b78c63';
  if(kind==='rabbit'){rect(x+1,y-9,3,10,color);rect(x+8,y-9,3,10,color);rect(x+2,y-7,1,6,'#dfaaa0');}
  if(kind==='hedgehog'){rect(x-3,y+1,17,12,'#6b5646');for(let i=0;i<4;i++)rect(x-3+i*4,y-2,3,5,'#6b5646');}
  rect(x,y,12,9,color);rect(x+2,y+9,8,7,color);rect(x+2,y+3,2,2,'#283d39');rect(x+8,y+3,2,2,'#283d39');rect(x+5,y+6,3,2,'#efdab3');
  if(kind==='beaver'){rect(x+10,y+12,7,4,'#6b5646');rect(x+5,y+7,2,3,'#efdab3');}
}
function workshop(x,y){
  rect(x+3,y+10,45,29,'#a38660');rect(x,y+5,51,7,'#718479');rect(x+5,y,41,6,'#718479');rect(x+20,y+21,13,18,'#5e5142');rect(x+7,y+18,9,9,'#ddbb78');rect(x+35,y+18,9,9,'#ddbb78');rect(x-2,y+39,55,3,'#5b6245');rect(x+16,y+11,21,5,'#d6b780');rect(x+25,y+10,2,8,'#6b5646');rect(x+21,y+12,10,2,'#6b5646');
  rect(x+42,y+36,13,5,'#876747');rect(x+45,y+33,13,4,'#ba9260');
}
function gazebo(x,y,t){
  for(let i=0;i<4;i++)rect(x+22-i*7,y+i*3,12+i*14,4,'#9d7860');
  rect(x+4,y+13,3,28,'#d2b788');rect(x+47,y+13,3,28,'#d2b788');rect(x+1,y+40,53,4,'#b9a077');rect(x+16,y+26,22,4,'#be9f78');rect(x+19,y+30,3,10,'#876747');rect(x+32,y+30,3,10,'#876747');rect(x+22,y+22,4,4,'#e7d8b1');rect(x+30,y+22,4,4,'#e7d8b1');
  if(state.festivalAt>Date.now()){for(let i=0;i<5;i++)rect(x+5+i*9,y+15+i%2*2,4,3,['#dca073','#c8cf8a','#adbbbc'][i%3]);}
}
function drawExpansion(t,portrait){
  if(portrait){
    rect(90,315,20,105,'#ae9f72');
    if(state.orchard){fruitTree(27,339,t);fruitTree(58,352,t);neighbor(63,373,'rabbit',t);rect(25,378,12,7,'#a78354');}
    if(state.workshop){workshop(130,321);neighbor(119,365,'beaver',t);}
    if(state.teahouse){gazebo(117,376,t);neighbor(172,402,'hedgehog',t);}
    if(state.festivalAt>Date.now()){rect(38,398,34,15,'#c49b86');rect(42,401,8,5,'#dfc6a2');rect(58,402,4,4,'#e7d8b1');}
  }else{
    if(state.orchard){fruitTree(389,91,t);fruitTree(440,103,t);neighbor(412,118,'rabbit',t);rect(444,126,12,7,'#a78354');}
    if(state.workshop){rect(118,76,51,10,'#ae9f72');workshop(83,30);neighbor(141,73,'beaver',t);}
    if(state.teahouse){rect(213,76,34,18,'#ae9f72');gazebo(221,28,t);neighbor(281,79,'hedgehog',t);}
  }
}
function festivalResident(x,y,kind,t){
  if(['rabbit','beaver','hedgehog'].includes(kind)){neighbor(x,y,kind,t,true);return;}
  if(kind==='fox'){
    rect(x,y,12,9,'#dd9c56');rect(x,y-3,3,5,'#a75f35');rect(x+9,y-3,3,5,'#a75f35');rect(x+3,y+6,6,4,'#efe0b4');rect(x+2,y+3,2,2,'#303b30');rect(x+9,y+3,2,2,'#303b30');rect(x+2,y+10,8,7,'#c48048');rect(x+10,y+13,7,3,'#bd753d');rect(x+15,y+13,3,3,'#ede1ba');
  }else if(kind==='frog'){
    rect(x,y,11,9,'#91ac62');rect(x,y-3,3,5,'#bad38a');rect(x+8,y-3,3,5,'#bad38a');rect(x+1,y-2,1,2,'#263d35');rect(x+9,y-2,1,2,'#263d35');rect(x-1,y+9,13,4,'#91ac62');
  }else{
    rect(x,y,12,13,'#b9a27a');rect(x,y-3,3,5,'#997a5a');rect(x+9,y-3,3,5,'#997a5a');rect(x+2,y+2,3,3,'#eedbb5');rect(x+8,y+2,3,3,'#eedbb5');rect(x+3,y+3,1,1,'#263d35');rect(x+9,y+3,1,1,'#263d35');rect(x+6,y+6,2,2,'#dda457');
  }
}
function drawSquare(t,portrait){
  if(!state.square)return;
  const x=portrait?78:186,y=portrait?291:185,w=portrait?48:62,h=portrait?40:53;
  rect(x-3,y-3,w+6,h+6,'#747b63');rect(x,y,w,h,'#bbb395');
  for(let row=0;row<Math.ceil(h/7);row++)for(let col=0;col<Math.ceil(w/9);col++)rect(x+col*9,y+row*7,Math.min(8,w-col*9),Math.min(6,h-row*7),(row+col)%2?'#b1ab8e':'#c4bda0');
  if(state.square>=2)for(let i=0;i<6;i++){rect(x+i*(w/6),y+h-4,5,5,'#6e8251');rect(x+1+i*(w/6),y+h-5,3,2,['#e3b285','#e2d69c','#b7a4c0'][i%3]);}
  if(state.square>=3){const cx=x+w/2;rect(cx-6,y+13,13,5,'#8c856b');rect(cx-1,y-2,3,16,'#735d43');rect(cx-5,y-11,11,10,'#a77d4b');rect(cx-3,y-9,7,6,state.completed?'#ffe8a0':'#c3b37c');rect(cx-6,y-13,13,2,'#66513d');}
  if(state.completed){
    for(let i=0;i<8;i++){const bx=x-4+i*(w+8)/8;rect(bx,y-16,1,2,'#a6a481');rect(bx,y-14,4,4,['#dca073','#c8cf8a','#adbbbc'][i%3]);}
    const kinds=['fox','frog','owl','rabbit','beaver','hedgehog'];
    for(let i=0;i<6;i++)festivalResident(x-12+(i%3)*(w/2+5),y+4+Math.floor(i/3)*22,kinds[i],t);
    for(let i=0;i<6;i++){const lx=x+(i*13)%w,ly=y-20-((t/500+i*7)%35);rect(lx,ly,3,4,'#c8995b');rect(lx+1,ly+1,1,2,'#ffe8a0');}
  }
}
function drawUpgrades(portrait){
  const positions=portrait?{bakery:[110,100],pond:[127,250],library:[14,176],orchard:[27,339],workshop:[130,321],teahouse:[117,376]}:{bakery:[286,102],pond:[361,172],library:[22,92],orchard:[389,91],workshop:[83,30],teahouse:[221,28]};
  for(const id of residentKeys){const level=state.upgrades[id];if(!state[id]||!level)continue;const [x,y]=positions[id];
    if(id==='bakery'){rect(x+7,y+59,23,7,'#a77d4b');rect(x+5,y+57,27,3,'#d2b788');for(let i=0;i<level+1;i++)rect(x+9+i*5,y+54,4,3,'#e2ba79');if(level>=2){rect(x+9,y+44,18,3,'#c48a76');rect(x+9,y+47,18,3,'#ddc29b');}if(level===3)rect(x+18,y+28,35,3,'#dbb477');}
    if(id==='pond'){for(let i=0;i<level+1;i++){rect(x+9+i*8,y+7,5,3,'#91a260');rect(x+10+i*8,y+6,3,2,'#d7b8aa');}if(level>=2){rect(x+1,y+30,24,3,'#ad8d64');rect(x+4,y+33,2,4,'#735d43');rect(x+20,y+33,2,4,'#735d43');}}
    if(id==='library'){rect(x+8,y+61,22,3,'#ad8d64');rect(x+10,y+64,2,4,'#735d43');rect(x+26,y+64,2,4,'#735d43');if(level>=2){rect(x+59,y+51,12,11,'#735d43');for(let i=0;i<5;i++)rect(x+60+i*2,y+53,1,7,['#adbbbc','#e2ba79','#c48a76'][i%3]);}if(level===3){rect(x+8,y+52,6,6,'#708651');rect(x+9,y+50,4,3,'#d7b8aa');}}
    if(id==='orchard'){for(let i=0;i<level;i++){rect(x-8+i*10,y+26,8,6,'#a78354');rect(x-6+i*10,y+24,4,3,'#dca073');}if(level===3)for(let i=0;i<4;i++)rect(x-13+i*7,y-14+i%2*5,3,2,'#d7b8aa');}
    if(id==='workshop'){for(let i=0;i<level;i++){rect(x-6,y+34-i*4,14,3,'#ba9260');rect(x-6,y+34-i*4,2,3,'#d5b888');}if(level>=2){rect(x+37,y+31,15,3,'#ad8d64');rect(x+39,y+34,2,7,'#735d43');rect(x+48,y+34,2,7,'#735d43');}if(level===3)rect(x+2,y+12,47,2,'#c4b68c');}
    if(id==='teahouse'){for(let i=0;i<level;i++){rect(x+5+i*18,y+39,5,5,'#ad8d64');rect(x+5+i*18,y+37,5,3,'#708651');rect(x+6+i*18,y+36,3,2,'#d7b8aa');}if(level===3)for(let i=0;i<5;i++){rect(x+7+i*9,y+16,3,4,'#a77d4b');rect(x+8+i*9,y+17,1,2,'#ffe8a0');}}
  }
}
function drawPortrait(t){
  rect(0,0,200,420,'#627c51');
  for(let i=0;i<100;i++)rect((i*73)%200,(i*47)%320,2,2,i%2?'#708a59':'#536d46');
  rect(90,60,20,260,'#ae9f72');rect(52,105,67,10,'#ae9f72');rect(87,164,60,10,'#ae9f72');rect(50,230,55,10,'#ae9f72');
  for(let i=0;i<12;i++)tree(i*19,22+(i%3)*5,.8);
  house(22,40,false);
  if(state.bakery){house(110,100,true);rect(131,125,31,5,'#e0c78b');if(!state.completed){rect(104,170,9,10,'#c48048');rect(101,164,12,9,'#dd9c56');rect(101,161,3,5,'#a75f35');rect(110,161,3,5,'#a75f35');rect(104,169,6,4,'#efe0b4');rect(103,166,2,2,'#303b30');rect(110,166,2,2,'#303b30');}}else{rect(116,122,64,38,'#686d54');rect(110,114,76,10,'#777560');rect(140,143,12,17,'#424e3d');}
  if(state.library){house(14,176,false);rect(18,207,65,7,'#698478');rect(30,209,37,2,'#e2d5a4');if(!state.completed){rect(91,239,10,12,'#b9a27a');rect(90,235,12,9,'#b9a27a');rect(92,237,3,3,'#eedbb5');rect(98,237,3,3,'#eedbb5');rect(93,238,1,1,'#263d35');rect(99,238,1,1,'#263d35');}}
  rect(20,261,70,35,'#65563e');for(let i=0;i<5;i++){rect(23+i*13,264,9,29,'#827353');if(i<state.garden)for(let j=0;j<4;j++){rect(26+i*13,268+j*6,2,5,'#577347');rect(24+i*13,268+j*6,6,2,['#e3b285','#e2d69c','#b7a4c0'][j%3]);}}
  if(state.pond){rect(127,250,59,34,'#8c9564');rect(121,257,70,20,'#547f83');rect(128,253,58,28,'#547f83');for(let i=0;i<4;i++)rect(130+i*12,260+i%2*9,8,1,'#95b9a4');rect(172,259,8,4,'#91a260');if(!state.completed){rect(174,242,10,8,'#91ac62');rect(174,240,3,3,'#bad38a');rect(181,240,3,3,'#bad38a');rect(175,241,1,1,'#263d35');rect(182,241,1,1,'#263d35');}}
  for(const p of [[10,120,.7],[185,60,.8],[12,165,.6],[186,206,.7],[115,304,.6]])tree(...p);
  for(let i=0;i<=state.lanterns;i++){rect(105,88+i*43,2,13,'#66513d');rect(102,84+i*43,8,7,'#a77d4b');rect(104,86+i*43,4,3,'#ffe4a0');}
  drawExpansion(t,true);drawSquare(t,true);drawUpgrades(true);
  for(let i=0;i<12;i++)rect(15+(i*37)%180+Math.sin(t/1900+i)*3,48+(i*23)%245,1,1,Math.sin(t/800+i)>.3?'#e4d78b':'#829562');
}
function draw(t){
  const canvas=$('village');
  const w=Math.max(1,Math.ceil(window.innerWidth/3)),h=Math.max(1,Math.ceil(window.innerHeight/3));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;ctx.imageSmoothingEnabled=false;}
  pixelScale=1;pixelX=0;pixelY=0;rect(0,0,w,h,'#52694a');
  // Recompose for portrait screens instead of cropping the village away.
  const top=window.innerWidth<=700?42:26,bottom=window.innerWidth<=700?84:71;
  const portrait=window.innerWidth<650&&window.innerHeight>window.innerWidth;
  const sceneW=portrait?200:480,sceneH=portrait?420:250;
  const scale=Math.min(w/sceneW,Math.max(1,h-top-bottom)/sceneH);
  const ox=(w-sceneW*scale)/2,oy=top+(h-top-bottom-sceneH*scale)/2;
  for(let i=0;i<Math.ceil(w/23)+1;i++)tree(i*23,25+(i%3)*4,.9);
  for(let i=0;i<100;i++)rect((i*73)%w,35+(i*43)%Math.max(1,h-35),2,2,i%2?'#627c51':'#58734b');
  pixelScale=scale;pixelX=Math.floor(ox);pixelY=Math.floor(oy);if(portrait)drawPortrait(t);else drawVillage(t);
  pixelScale=1;pixelX=0;pixelY=0;requestAnimationFrame(draw);
}

render();save();requestAnimationFrame(draw);setInterval(()=>{accrue(Date.now());render();save();},1000);document.addEventListener('visibilitychange',()=>{accrue(Date.now());render();save();});if(away>60000&&(state.garden||state.bakery))toast('Welcome back. Your village kept growing while you were away.');
