const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function game(saved){
  let now=1000000,stored;
  const elements={};
  for(const match of fs.readFileSync('index.html','utf8').matchAll(/id="([^"]+)"/g))elements[match[1]]={style:{},setAttribute(){},getContext:()=>({fillRect(){}})};
  const context={Date:{now:()=>now},Math,Number,JSON,clearTimeout(){},setTimeout(){},setInterval(){},requestAnimationFrame(){},localStorage:{getItem:()=>JSON.stringify(saved),setItem:(_,value)=>stored=JSON.parse(value)},document:{getElementById:id=>elements[id],addEventListener(){}},window:{}};
  vm.createContext(context);vm.runInContext(fs.readFileSync('game.js','utf8'),context);
  return {elements,run:code=>vm.runInContext(code,context),advance:seconds=>{now+=seconds*1000;vm.runInContext('accrue(Date.now());render();save()',context);},stored:()=>stored};
}
test('new game cannot buy locked buildings or overspend',()=>{const g=game();for(const id of ['pond','library','lantern','restore','plant']){g.elements[id].onclick();assert.equal(g.stored().wood,0);}assert.equal(g.stored().pond,false);assert.equal(g.stored().library,false);});
test('gathering and gardens unlock bakery; new residents produce income',()=>{const g=game();for(let i=0;i<10;i++)g.elements.gather.onclick();g.elements.plant.onclick();g.advance(60);assert.equal(g.stored().seeds,12);g.elements.restore.onclick();assert.equal(g.stored().bakery,true);g.run('state.wood=300;state.seeds=200;state.warmth=100;render()');for(const id of ['pond','library','lantern'])g.elements[id].onclick();const before=g.stored();g.advance(60);const after=g.stored();assert.equal(after.seeds-before.seeds,30);assert.equal(after.warmth-before.warmth,19.5);assert.equal(after.wood-before.wood,7.5);assert.equal(g.elements.neighbors.textContent,'3 / 3 neighbors');});
test('old saves migrate and offline earnings stop at eight hours',()=>{const g=game({wood:10,seeds:0,warmth:0,garden:1,bakery:true,last:1000000});assert.equal(g.stored().pond,false);assert.equal(g.stored().lanterns,0);g.advance(86400);assert.equal(g.stored().seeds,5760);assert.equal(g.stored().warmth,2880);});
test('lantern trail has four levels and completed purchases stay complete',()=>{const g=game({wood:500,seeds:500,warmth:500,bakery:true,last:1000000});for(let i=0;i<8;i++)g.elements.lantern.onclick();assert.equal(g.stored().lanterns,4);assert.equal(g.stored().wood,460);const restored=game(g.stored());assert.equal(restored.stored().lanterns,4);assert.equal(restored.elements.lantern.disabled,true);});
