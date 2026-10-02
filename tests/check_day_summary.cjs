const assert=require('node:assert/strict'),path=require('node:path');
const {firefox}=require(process.env.PSG_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const b=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}});try{
 for(const width of [320,390,768]){
  const page=await b.newPage({viewport:{width,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.resolve(__dirname,'../review.html'));
  await page.evaluate(()=>{const box=[26,157,154,248,94,9].map((no,j)=>{const p=PS_CATALOG.pokemon[no];return {id:'meal-'+j,no,level:60,nature:'まじめ',subskills:[],ribbonHours:0,ingredients:Object.fromEntries(p.ingredientSlots.map(s=>[s.unlock,s.candidates[0].name]))}});localStorage.setItem('psg.box.instances.v1',JSON.stringify(box));localStorage.setItem('psg.team.primary.v1',JSON.stringify(box.slice(0,5).map(x=>x.id)));localStorage.setItem('psg-day-settings-v1',JSON.stringify({initialEnergy:100,goodCamp:false,meals:true,collectionHours:4}))});
  await page.reload();
  const details=page.locator('.psg-day-member-details');assert.equal(await details.evaluate(el=>el.open),false);
  assert.equal(await page.locator('.psg-day-row').first().isVisible(),false);
  const before=await page.locator('#teamDayEstimate').textContent();assert.match(before,/食材合計/);
  assert.equal(await page.locator('#teamDayEstimate').evaluate(el=>el.lastElementChild.tagName),'DETAILS');
  const foodGrid=page.locator('.psg-day-food-summary');
  assert.equal(await foodGrid.evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),4);
  assert.equal(await foodGrid.locator('small').first().isVisible(),false);
  assert.equal(await foodGrid.locator('.psg-day-food-tile').first().evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 255, 255)');
  assert.match(await foodGrid.locator('.psg-day-food-tile').first().getAttribute('aria-label'),/約[\d.]+個/);
  assert.equal(await foodGrid.locator('.psg-day-food-tile').first().evaluate(el=>getComputedStyle(el).borderTopWidth),'1px');
  assert.equal(await page.locator('.psg-day-card').evaluate(el=>getComputedStyle(el).borderTopWidth),'0px');
  assert.equal(await foodGrid.evaluate(el=>el.scrollWidth>el.clientWidth),false);
  await details.locator('summary').click();assert.equal(await page.locator('.psg-day-row').count(),5);assert.equal(await page.locator('.psg-day-row').first().isVisible(),true);
  assert.equal(await page.locator('#teamDayEstimate').textContent(),before);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
  await details.locator('summary').click();
  if(width===390){await foodGrid.evaluate(el=>window.scrollTo(0,scrollY+el.getBoundingClientRect().top-400));await page.screenshot({path:'/tmp/psg255-day.png'})}
  console.log(width+'px: team totals first, collapsed five-member details, unchanged totals, no overflow');await page.close();
 }
}finally{await b.close()}})().catch(e=>{console.error(e.stack);process.exitCode=1});
