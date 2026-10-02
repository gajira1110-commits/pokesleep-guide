const assert=require('node:assert/strict'),path=require('node:path');
const {firefox}=require(process.env.PSG_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}});
 try{for(const width of [320,390,768]){
  const page=await browser.newPage({viewport:{width,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.resolve(__dirname,'../review.html'));
  await page.evaluate(()=>PS_OPEN_RECIPE('spicy_leek_curry'));
  await page.selectOption('#recipeDisplayLevel','48');
  await page.click('[data-recipe-mode="evaluation"]');
  assert(await page.locator('#recipeDisplayLevel').isHidden());
  assert(await page.locator('[data-recipe-id="spicy_leek_curry"]').evaluate(el=>el.open));
  assert((await page.locator('[data-recipe-id="spicy_leek_curry"] .psg-recipe-expanded').textContent()).includes('比較Lv.70'));
  for(const [category,count] of [['カレー・シチュー',25],['サラダ',26],['デザート・ドリンク',27]]){
   await page.locator(`[data-recipe-category="${category}"]`).click();
   for(const metric of ['total','efficiency','amplification']){
    await page.selectOption('#recipeEvaluationSort',metric);
    assert.equal(await page.locator('.psg-recipe-entry').count(),count);
    assert.equal(await page.locator('.psg-recipe-metric').count(),count*3);
    const expected=await page.evaluate(({category,metric})=>Object.values(PS_CATALOG.recipes).filter(r=>r.category===category).map(r=>{
     const total=r.energy.max.value,quantity=r.ingredients.reduce((n,i)=>n+i.qty,0),base=r.ingredients.reduce((n,i)=>n+i.qty*PS_CATALOG.ingredientAssets[i.name].baseEnergy,0);
     return {id:r.id,name:r.name,value:total/(metric==='total'?1:metric==='efficiency'?quantity:base)};
    }).sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name,'ja')).map(r=>r.id),{category,metric});
    assert.deepEqual(await page.locator('.psg-recipe-entry').evaluateAll(els=>els.map(el=>el.dataset.recipeId)),expected);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   }
  }
  await page.evaluate(()=>PS_OPEN_RECIPE('spicy_leek_curry'));
  const values=await page.locator('[data-recipe-id="spicy_leek_curry"] .psg-recipe-metric b').allTextContents();
  assert.deepEqual(values,['21,122','660.06','4.4750倍']);
  await page.click('#recipeIngredientButton');await page.locator('#recipeIngredientOptions button[aria-label="ふといながねぎ"]').click();
  const filtered=await page.locator('.psg-recipe-entry').evaluateAll(els=>els.map(e=>e.dataset.recipeId));
  await page.locator('[data-recipe-id="spicy_leek_curry"] summary').click();
  await page.click('[data-recipe-mode="recipe"]');
  assert.equal(await page.locator('#recipeDisplayLevel').inputValue(),'48');
  assert.deepEqual(await page.locator('.psg-recipe-entry').evaluateAll(els=>els.map(e=>e.dataset.recipeId).sort()),[...filtered].sort());
  assert(await page.locator('[data-recipe-id="spicy_leek_curry"]').evaluate(el=>el.open));
  assert((await page.locator('[data-recipe-id="spicy_leek_curry"] .psg-recipe-energy-max').textContent()).includes('13,688'));
  await page.click('[data-recipe-mode="evaluation"]');
  if(width===390)await page.screenshot({path:'/tmp/psg242-evaluation.png'});
  await page.click('#recipeEvaluationBasisLink');assert(await page.locator('#info').isVisible());
  assert(await page.locator('#recipeEvaluationBasis').evaluate(el=>el.open));
  assert((await page.locator('#recipeEvaluationBasisContent').textContent()).includes('38件'));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.deepEqual(errors,[]);console.log(`${width}px: 78 recipes, three independent orders, exact example, filters/open details/level restored, basis link pass`);
  await page.close();
 }}finally{await browser.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
