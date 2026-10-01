const assert=require('node:assert/strict'),path=require('node:path');
const {firefox}=require(process.env.PSG_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}});
 try{for(const width of [320,390,768]){
  const page=await browser.newPage({viewport:{width,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.resolve(__dirname,'../review.html'));
  await page.evaluate(()=>PS_OPEN_RECIPE('spicy_leek_curry'));
  await page.click('[data-recipe-mode="evaluation"]');
  assert.equal(await page.locator('#recipeSupplyLevel').inputValue(),'30');
  assert.equal(await page.locator('#recipeSupplyMeals').inputValue(),'3');
  for(const level of ['30','60'])for(const meals of ['1','3']){
   await page.selectOption('#recipeSupplyLevel',level);await page.selectOption('#recipeSupplyMeals',meals);
   assert(await page.locator('[data-recipe-id="spicy_leek_curry"]').evaluate(el=>el.open));
   const description=await page.locator('[data-recipe-id="spicy_leek_curry"] .psg-supply-detail').textContent();
   assert(description.includes(`担当Lv${level}・${meals}食`));assert(description.includes('必要枠数・交代時間ではありません'));
   assert(description.includes(`ふといながねぎ ${14*Number(meals)}個`));
   const expected=await page.evaluate(({level,meals})=>{
    const r=PS_CATALOG.recipes.spicy_leek_curry;
    const sum=r.ingredients.reduce((n,i)=>n+i.qty*Number(meals)/PS_CATALOG.dailySupply.tiers[level][i.name].daily,0);
    return sum.toLocaleString('ja-JP',{minimumFractionDigits:2,maximumFractionDigits:2});
   },{level,meals});
   assert((await page.locator('[data-recipe-id="spicy_leek_curry"] .psg-recipe-burden').textContent()).includes(expected+'匹・日'));
   for(const category of ['カレー・シチュー','サラダ','デザート・ドリンク']){
    await page.locator(`[data-recipe-category="${category}"]`).click();await page.selectOption('#recipeEvaluationSort','burden');
    const ordered=await page.locator('.psg-recipe-entry').evaluateAll(els=>els.map(e=>e.dataset.recipeId));
    const expectedOrder=await page.evaluate(({category,level})=>Object.values(PS_CATALOG.recipes).filter(r=>r.category===category).map(r=>({id:r.id,name:r.name,value:r.ingredients.reduce((n,i)=>n+i.qty/PS_CATALOG.dailySupply.tiers[level][i.name].daily,0)})).sort((a,b)=>a.value-b.value||a.name.localeCompare(b.name,'ja')).map(r=>r.id),{category,level});
    assert.deepEqual(ordered,expectedOrder);
   }
   await page.evaluate(()=>PS_OPEN_RECIPE('spicy_leek_curry'));
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if(width===390)await page.screenshot({path:'/tmp/psg243-burden.png'});
  await page.locator('[data-recipe-id="spicy_leek_curry"] .psg-supply-detail button').last().click();
  assert(await page.locator('#dailySupplyReference').evaluate(el=>el.open));
  await page.locator('#dailySupplyReference button').filter({hasText:'食材の一覧を見る'}).click();
  await page.selectOption('#ingredientIndexSort','daily');
  for(const level of ['30','60']){
   await page.selectOption('#ingredientSupplyLevel',level);
   assert.equal(await page.locator('.psg-supply-tier').count(),19);
   const expected=await page.evaluate(level=>Object.entries(PS_CATALOG.dailySupply.tiers[level]).sort((a,b)=>b[1].daily-a[1].daily||a[0].localeCompare(b[0],'ja')).map(([name])=>name),level);
   assert.deepEqual(await page.locator('.psg-supply-tier').evaluateAll(els=>els.map(e=>e.dataset.ingredient)),expected);
   await page.locator('.psg-supply-tier').first().locator('summary').click();
   assert((await page.locator('.psg-supply-tier').first().textContent()).includes('Lv1'));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  if(width===390)await page.screenshot({path:'/tmp/psg243-tiers.png'});
  assert.deepEqual(errors,[]);console.log(`${width}px: Lv30/60, 1/3 meals, all burden orders, 19 tiers, configurations, preserved details and reference link pass`);
  await page.close();
 }}finally{await browser.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
