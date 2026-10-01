const assert=require('node:assert/strict'),path=require('node:path');
const {firefox}=require(process.env.PSG_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const b=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}});
 try{const page=await b.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+path.resolve(__dirname,'../review.html'));
 // Expected boundary table is independent of the production helper.
 const rows=await page.evaluate(()=>{
  const rows=[];
  for(const no of [1,2,3])for(const hours of [0,199,200,499,500,999,1000,1999,2000]){
   const p=PS_CATALOG.pokemon[no],item={id:'ribbon-test',no,name:p.name,level:30,nature:'まじめ',subskills:[],ribbonHours:hours,ingredients:Object.fromEntries(p.ingredientSlots.map(s=>[s.unlock,s.candidates[0].name]))};
   PS.state.box=[item];PS.state.selected=item;PS.refreshBoxDetail();PS.go('boxDetail');
   rows.push({no,hours,help:p.help,carry:p.carry,stats:[...document.querySelectorAll('#boxStats strong')].map(x=>x.textContent),food:document.getElementById('boxDayFood').textContent,assumption:document.querySelector('.psg-detail-ribbon').title});
  }return rows;
 });
 for(const row of rows){
  const gain=row.hours>=2000?8:row.hours>=1000?6:row.hours>=500?3:row.hours>=200?1:0;
  const remaining=3-row.no;
  const factor=row.hours>=2000?[1,.88,.75][remaining]:row.hours>=500?[1,.95,.89][remaining]:1;
  assert.equal(row.stats[0],Math.floor(row.help*(1-29*.002)*factor).toLocaleString('en-US')+'秒');
  assert.equal(row.stats[1],String(row.carry+gain));assert.match(row.food,/リボンの所持数・おてつだい時間補正を含みます/);assert.doesNotMatch(row.assumption,/未反映/);
 }
 // A team card must use the same corrections, not the species' old capacity.
 await page.evaluate(()=>{localStorage.setItem('psg.box.instances.v1',JSON.stringify([{id:'ribbon-team',no:1,level:30,nature:'まじめ',ribbonHours:2000,subskills:[],ingredients:{1:'あまいミツ',30:'あまいミツ'}}]));localStorage.setItem('psg.team.primary.v1',JSON.stringify(['ribbon-team']))});
 await page.reload();const withRibbon=Number((await page.locator('#teamDayEstimate .psg-day-food-tile strong').first().textContent()).replace(/[^\d.]/g,''));
 await page.evaluate(()=>{const box=JSON.parse(localStorage.getItem('psg.box.instances.v1'));box[0].ribbonHours=0;localStorage.setItem('psg.box.instances.v1',JSON.stringify(box))});
 await page.reload();const withoutRibbon=Number((await page.locator('#teamDayEstimate .psg-day-food-tile strong').first().textContent()).replace(/[^\d.]/g,''));assert(withRibbon>withoutRibbon,'Team food production must use ribbon speed/capacity too');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
 console.log('Ribbon: 27 integration boundaries, remaining evolutions 0/1/2, Box stats/forecast, team forecast, no legacy extra capacity or JS errors.');
 }finally{await b.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
