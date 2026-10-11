// Run from the repository root: node scripts/measure-pacing.cjs
// Simulates elapsed game time and uses the same purchase handlers as browser play.
const {game}=require('../tests/support.cjs');
function simulate({name,taps,levels,picnics}){
  const g=game(),milestones=[];let minutes=0;
  function buy(id){let waited=0;while(g.elements[id].disabled){if(waited++>600)throw Error('Stalled: '+id);for(let n=0;n<taps;n++)g.elements.gather.onclick();if(picnics&&!g.elements.festival.disabled)g.elements.festival.onclick();g.advance(60);minutes++;}g.elements[id].onclick();}
  buy('plant');buy('restore');milestones.push(['bakery',minutes]);
  for(const id of ['pond','library','orchard','workshop','teahouse']){buy(id);milestones.push([id,minutes]);}
  for(let i=1;i<5;i++)buy('plant');for(let i=0;i<4;i++)buy('lantern');
  for(let level=0;level<levels;level++)for(const id of ['bakery','pond','library','orchard','workshop','teahouse'])buy('upgrade-'+id);
  milestones.push(['upgrades',minutes]);for(let i=0;i<3;i++)buy('square');milestones.push(['square',minutes]);buy('mosslight');
  if(!g.stored().completed)throw Error('Festival did not complete');
  return {name,minutes,gatherTapsPerMinute:taps,upgradeLevels:levels,usesTeaPicnics:picnics,milestones:Object.fromEntries([...milestones,['festival',minutes]])};
}
const scenarios=[{name:'Gentle play',taps:3,levels:1,picnics:false},{name:'Invest in buildings',taps:3,levels:2,picnics:true},{name:'Frequent gathering',taps:30,levels:2,picnics:true}];
if(require.main===module)console.log(JSON.stringify(scenarios.map(simulate),null,2));
module.exports={simulate,scenarios};
