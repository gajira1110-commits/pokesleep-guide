const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {firefox}=require(process.env.PSG_PLAYWRIGHT_MODULE||'playwright');
const fieldOrder=['greengrass','greengrass_ex','cyan','cyan_ex','taupe','snowdrop','lapis','old_gold','amber'];
const fields=fieldOrder.map(id=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'../master/fields',id,'data.json'),'utf8')));
(async()=>{const browser=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}});try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+path.resolve(__dirname,'../review.html'));
 const species=await page.evaluate(()=>Object.keys(PS_CATALOG.pokemon).map(Number));
 let encounters=0;
 for(const no of species){
  await page.evaluate(no=>openDexCard(no),no);
  const rendered=await page.locator('#v12Field .psg-sleep-field-group').evaluateAll(groups=>groups.map(g=>({id:g.dataset.sleepStyleId,heading:g.querySelector('h4').textContent,rows:[...g.querySelectorAll('.psg-style-field-row')].map(r=>({field:r.dataset.fieldId,text:r.textContent,rank:r.querySelector('strong').getAttribute('aria-label'),icon:!!r.querySelector('strong img')}))})));
  const expected=fields.flatMap(f=>f.encounters.filter(e=>Number(e.sleepStyleId.split('_')[0])===no).map(e=>({field:f.id,...e})));
  assert.equal(rendered.flatMap(g=>g.rows).length,expected.length,`encounters ${no}`);
  assert.equal(new Set(rendered.map(g=>g.id)).size,rendered.length);
  const stars=rendered.map(g=>Number(g.heading.match(/^★(\d+)/)[1]));assert.deepEqual(stars,[...stars].sort((a,b)=>a-b));
  for(const group of rendered){
   const indexes=group.rows.map(r=>fieldOrder.indexOf(r.field));assert.deepEqual(indexes,[...indexes].sort((a,b)=>a-b));
   for(const row of group.rows){
    const e=expected.find(e=>e.field===row.field&&e.sleepStyleId===group.id);assert.ok(e);assert.equal(row.rank,e.rank.tier+e.rank.level);assert.ok(row.icon);
    assert.ok(row.text.includes('エナジー'+e.unlockEnergy.toLocaleString()));
    assert.ok((group.heading+row.text).includes(e.drowsyPower.toLocaleString()),`DPR ${group.id} ${row.field}`);
    if(e.eventOnly)assert.ok(row.text.includes('イベント条件あり'));encounters++;
   }
  }
 }
 assert.equal(encounters,2506);
 for(const width of [320,390,768]){
  await page.setViewportSize({width,height:844});await page.evaluate(()=>openDexCard(1));await page.locator('[data-v12tab="field"]').click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if(width===390){await page.locator('#v12Field').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/psg276-fields.png'});}
 }
 assert.deepEqual(errors,[]);console.log('2506 encounters retained, sleep style groups, rank icons, field order, distinct EX power, zero energy, 320/390/768px passed');
}finally{await browser.close()}})().catch(e=>{console.error(e.stack);process.exitCode=1});
