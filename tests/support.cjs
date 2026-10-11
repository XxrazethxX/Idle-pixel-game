const fs=require('node:fs');
const vm=require('node:vm');
function game(saved){
  let now=1000000,stored;
  const elements={};
  for(const match of fs.readFileSync('index.html','utf8').matchAll(/id="([^"]+)"/g))elements[match[1]]={style:{},setAttribute(){},showModal(){this.open=true},close(){this.open=false},addEventListener(){},getContext:()=>({fillRect(){}})};
  const context={Date:{now:()=>now},Math,Number,JSON,clearTimeout(){},setTimeout(){},setInterval(){},requestAnimationFrame(){},localStorage:{getItem:key=>key==='mosslight-village-v1'&&saved!==undefined?JSON.stringify(saved):null,setItem:(key,value)=>{if(key==='mosslight-village-v1')stored=JSON.parse(value)}},document:{getElementById:id=>elements[id],addEventListener(){}},window:{}};
  vm.createContext(context);vm.runInContext(fs.readFileSync('saves.js','utf8'),context);vm.runInContext(fs.readFileSync('world.js','utf8'),context);vm.runInContext(fs.readFileSync('game.js','utf8'),context);
  return {elements,run:code=>vm.runInContext(code,context),advance:seconds=>{now+=seconds*1000;vm.runInContext('accrue(Date.now());render();save()',context);},stored:()=>stored};
}
module.exports={game};
