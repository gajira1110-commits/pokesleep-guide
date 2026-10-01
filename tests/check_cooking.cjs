const assert=require('node:assert/strict'),path=require('node:path');
const {firefox}=require(process.env.PSG_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}});
 try{for(const width of [320,390,768]){
  const page=await browser.newPage({viewport:{width,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.resolve(__dirname,'../review.html'));
  await page.evaluate(()=>PS.go('recipePage'));
  assert.equal(await page.locator('#recipeDisplayLevel option').count(),70);
  assert.equal(await page.locator('#recipeDisplayLevel').inputValue(),'70');
  assert.equal(await page.locator('.psg-recipe-entry').count(),25);
  await page.selectOption('#recipeDisplayLevel','1');
  const expected=await page.evaluate(()=>Object.values(PS_CATALOG.recipes).filter(r=>r.category==='カレー・シチュー').sort((a,b)=>b.energy.min.value-a.energy.min.value)[0].id);
  assert.equal(await page.locator('.psg-recipe-entry').first().getAttribute('data-recipe-id'),expected);
  await page.evaluate(()=>PS_OPEN_RECIPE('spicy_leek_curry'));
  await page.selectOption('#recipeDisplayLevel','48');
  const entry=page.locator('[data-recipe-id="spicy_leek_curry"]');
  assert.equal(await entry.getAttribute('open'),'');
  assert((await entry.locator('.psg-recipe-energy-max').textContent()).includes('確認値 Lv.48'));
  assert((await entry.locator('.psg-recipe-energy-max').textContent()).includes('13,688'));
  assert((await entry.locator('.psg-recipe-expanded').textContent()).includes('比較Lv.48'));
  await page.selectOption('#recipeDisplayLevel','70');
  assert((await page.locator('#recipeLevelFacts').textContent()).includes('Lv上限'));
  await page.locator('#cookingPotBase').evaluate(el=>el.closest('details').open=true);
  const cases=[['21','1','10',false,true,47],['69','1.5','0',true,false,208],['81','1','200',true,true,543],['31','1','0',false,true,47]];
  for(const [base,event,skill,sunday,camp,result] of cases){
   await page.selectOption('#cookingPotBase',base);await page.fill('#cookingEvent',event);await page.fill('#cookingSkill',skill);
   await page.locator('#cookingSunday').setChecked(sunday);await page.locator('#cookingCamp').setChecked(camp);
   assert.equal(await page.locator('#cookingPotResult').textContent(),`試算容量 ${result}個`);
  }
  await page.fill('#cookingSkill','201');assert((await page.locator('#cookingPotResult').textContent()).includes('入力を確認'));
  await page.fill('#cookingSkill','');assert((await page.locator('#cookingPotResult').textContent()).includes('入力を確認'));
  await page.fill('#cookingSkill','0');await page.fill('#cookingEvent','1.0001');assert((await page.locator('#cookingPotResult').textContent()).includes('入力を確認'));
  await page.selectOption('#cookingPotBase','81');assert((await page.locator('#cookingPotCost').textContent()).includes('5,080,600'));
  assert.equal(await page.locator('.psg-recipe-entry').count(),25);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if(width===390)await page.screenshot({path:'/tmp/psg241-cooking.png'});
  await page.evaluate(()=>PS.go('info'));
  await page.locator('#cookingReferenceTables').evaluate(el=>{el.closest('details').open=true;for(const d of el.querySelectorAll('details'))d.open=true});
  assert.equal(await page.locator('#cookingReferenceTables tbody tr').count(),93);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.deepEqual(errors,[]);console.log(`${width}px: levels, observations, EXP, half-up pot corrections, invalid inputs and reference tables pass`);
  await page.close();
 }}finally{await browser.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
