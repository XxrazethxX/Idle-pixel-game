'use strict';
globalThis.MosslightSaves=(()=>{
  const buildings=['bakery','pond','library','orchard','workshop','teahouse'];
  const levels={garden:5,lanterns:4,tools:5,square:3};
  const maxResource=1e12,maxBytes=262144;
  function fresh(now){return {wood:0,seeds:0,warmth:0,garden:0,bakery:false,pond:false,library:false,lanterns:0,orchard:false,workshop:false,teahouse:false,tools:0,festivalAt:0,square:0,completed:false,upgrades:Object.fromEntries(buildings.map(id=>[id,0])),last:now};}
  function object(value){return value!==null&&typeof value==='object'&&!Array.isArray(value);}
  function normalize(raw,now,strict=false){
    if(!object(raw))throw Error('This file does not contain a village save.');
    const result=fresh(now);
    for(const key of ['wood','seeds','warmth']){
      const value=raw[key];
      if(strict&&(!Number.isFinite(value)||value<0||value>maxResource))throw Error('The backup contains invalid supplies.');
      if(Number.isFinite(value)&&value>=0)result[key]=Math.min(maxResource,value);
    }
    for(const [key,limit] of Object.entries(levels)){
      const value=raw[key];
      if(strict&&((key==='garden'&&value===undefined)||(value!==undefined&&(!Number.isInteger(value)||value<0||value>limit))))throw Error('The backup contains invalid upgrade levels.');
      if(Number.isFinite(value))result[key]=Math.max(0,Math.min(limit,Math.floor(value)));
    }
    for(const key of [...buildings,'completed']){
      if(strict&&raw[key]!==undefined&&typeof raw[key]!=='boolean')throw Error('The backup contains invalid village progress.');
      result[key]=raw[key]===true;
    }
    if(strict&&(!Number.isFinite(raw.last)||raw.last<0))throw Error('The backup has an invalid save time.');
    if(Number.isFinite(raw.last)&&raw.last>=0)result.last=Math.min(now,raw.last);
    if(strict&&raw.festivalAt!==undefined&&(!Number.isFinite(raw.festivalAt)||raw.festivalAt<0))throw Error('The backup has an invalid picnic time.');
    if(Number.isFinite(raw.festivalAt)&&raw.festivalAt>=0)result.festivalAt=Math.min(now+300000,raw.festivalAt);
    if(strict&&raw.upgrades!==undefined&&!object(raw.upgrades))throw Error('The backup has invalid building upgrades.');
    for(const id of buildings){
      const value=raw.upgrades?.[id];
      if(strict&&value!==undefined&&(!Number.isInteger(value)||value<0||value>3||(!result[id]&&value>0)))throw Error('The backup has invalid building upgrades.');
      if(result[id]&&Number.isFinite(Number(value)))result.upgrades[id]=Math.min(3,Math.max(0,Math.floor(Number(value))));
    }
    if(strict&&result.completed&&result.square!==3)throw Error('The backup has an incomplete festival square.');
    result.completed=result.completed&&result.square===3;
    return result;
  }
  function decode(text,now){
    if(typeof text!=='string'||text.length>maxBytes)throw Error('Choose a village backup smaller than 256 KB.');
    let raw;try{raw=JSON.parse(text);}catch{throw Error('This file is not valid JSON.');}
    if(object(raw)&&raw.format==='mosslight-village'){
      if(raw.version!==1)throw Error('This backup uses an unsupported version of Mosslight Village.');
      raw=raw.state;
    }
    return normalize(raw,now,true);
  }
  function encode(state,now){return JSON.stringify({format:'mosslight-village',version:1,exportedAt:now,state:normalize(state,now,true)},null,2);}
  return {fresh,normalize,decode,encode,maxBytes};
})();
