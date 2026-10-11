'use strict';
// Deterministic atmosphere and walking paths, shared by rendering and tests.
globalThis.MosslightWorld=(()=>{
  const cycle=16*60*1000,weatherSlot=4*60*1000;
  const smooth=x=>x*x*(3-2*x);
  function environment(now,calm=false){
    if(calm)return {phase:.35,name:'Day',darkness:0,sunset:0,rain:0};
    const phase=((now%cycle)+cycle)%cycle/cycle;
    const keys=[[0,.42],[.18,0],[.55,0],[.72,.42],[1,.42]];
    let darkness=0;
    for(let i=1;i<keys.length;i++)if(phase<=keys[i][0]){const [a,from]=keys[i-1],[b,to]=keys[i];darkness=from+(to-from)*smooth((phase-a)/(b-a));break;}
    const slot=Math.floor(now/weatherSlot),elapsed=((now%weatherSlot)+weatherSlot)%weatherSlot;
    const rainy=((slot%7)+7)%7===2||((slot%7)+7)%7===5;
    const rain=rainy?smooth(Math.min(1,elapsed/30000,(weatherSlot-elapsed)/30000)):0;
    return {phase,name:phase<.18?'Dawn':phase<.55?'Day':phase<.72?'Dusk':'Night',darkness,sunset:Math.max(0,1-Math.abs(phase-.63)/.1),rain};
  }
  const paths={
    wide:{bakery:[[271,166],[249,167],[221,172]],pond:[[405,165],[360,166],[330,167]],library:[[99,158],[133,165],[173,169]],orchard:[[412,118],[385,139],[354,165]],workshop:[[141,73],[180,78],[215,114]],teahouse:[[281,79],[254,79],[222,112]]},
    portrait:{bakery:[[101,165],[98,180],[98,204]],pond:[[174,240],[141,240],[108,250]],library:[[91,235],[97,217],[98,194]],orchard:[[63,373],[77,369],[94,365]],workshop:[[119,365],[101,354],[99,330]],teahouse:[[172,402],[143,404],[101,400]]}
  };
  function walk(id,time,portrait=false,calm=false){
    const path=paths[portrait?'portrait':'wide'][id];
    if(!path)return null;
    if(calm)return {x:path[0][0],y:path[0][1],moving:false,facing:1};
    const offset=Object.keys(paths.wide).indexOf(id)*6700;
    const local=((time+offset)%52000+52000)%52000;
    const progress=local<9000?0:local<23000?(local-9000)/14000:local<32000?1:local<46000?1-(local-32000)/14000:0;
    const section=Math.min(path.length-2,Math.floor(progress*(path.length-1)));
    const mix=progress*(path.length-1)-section;
    const from=path[section],to=path[section+1];
    const moving=(local>=9000&&local<23000)||(local>=32000&&local<46000);
    return {x:Math.round(from[0]+(to[0]-from[0])*mix),y:Math.round(from[1]+(to[1]-from[1])*mix),moving,facing:local<32000?Math.sign(to[0]-from[0])||1:-(Math.sign(to[0]-from[0])||1)};
  }
  return {environment,walk,paths,cycle,weatherSlot};
})();
