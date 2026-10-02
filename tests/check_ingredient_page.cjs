const assert=require('node:assert/strict'),path=require('node:path');
const {firefox}=require(process.env.PSG_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}});
 try{for(const width of [320,390,768]){
  const page=await browser.newPage({viewport:{width,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.resolve(__dirname,'../review.html'));
  await page.click('nav [data-tab="info"]');await page.click('[data-info-page="ingredientPage"]');
  assert(await page.locator('#ingredientPage').isVisible());assert(await page.locator('nav [data-tab="info"]').evaluate(el=>el.classList.contains('active')));
  assert.equal(await page.locator('#ingredientIndexCount').textContent(),'19 / 19');
  const first=page.locator('#ingredientDailyTiers > details').first();assert.equal(await first.getAttribute('data-ingredient'),'おいしいシッポ');
  assert((await first.textContent()).includes('基本 342 エナジー'));
  for(const sort of ['name','energy','daily'])for(const level of ['30','60']){
   await page.selectOption('#ingredientIndexSort',sort);await page.selectOption('#ingredientSupplyLevel',level);
   const expected=await page.evaluate(({sort,level})=>Object.keys(PS_CATALOG.ingredientAssets).sort((a,b)=>sort==='name'?a.localeCompare(b,'ja'):((sort==='energy'?PS_CATALOG.ingredientAssets[b].baseEnergy:PS_CATALOG.dailySupply.tiers[level][b].daily)-(sort==='energy'?PS_CATALOG.ingredientAssets[a].baseEnergy:PS_CATALOG.dailySupply.tiers[level][a].daily)||a.localeCompare(b,'ja'))),{sort,level});
   assert.deepEqual(await page.locator('#ingredientDailyTiers > details').evaluateAll(els=>els.map(el=>el.dataset.ingredient)),expected);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  await page.fill('#ingredientSearch','ｶｶｵ');assert.equal(await page.locator('#ingredientIndexCount').textContent(),'1 / 19');
  const cacao=page.locator('#ingredientDailyTiers [data-ingredient="リラックスカカオ"]');await cacao.locator('summary').first().click();
  assert((await cacao.textContent()).includes('基本 151 エナジー'));assert((await cacao.textContent()).includes('Lv1'));
  const expectedCount=await page.evaluate(()=>Object.values(PS_CATALOG.recipes).filter(r=>r.ingredients.some(i=>i.name==='リラックスカカオ')).length);
  assert.equal(await cacao.locator('[data-ingredient-recipe]').count(),expectedCount);
  await page.selectOption('#ingredientSupplyLevel','30');assert(await cacao.evaluate(el=>el.open));
  const related=cacao.locator('.psg-ingredient-details details').filter({has:page.locator('[data-ingredient-recipe]')}).first();await related.locator('summary').click();
  const button=related.locator('[data-ingredient-recipe]').first(),recipeId=await button.getAttribute('data-ingredient-recipe');await button.click();
  assert(await page.locator('#recipePage').isVisible());assert(await page.locator(`[data-recipe-id="${recipeId}"]`).evaluate(el=>el.open));
  await page.locator('#recipePage [data-back]').click();assert(await page.locator('#ingredientPage').isVisible());
  assert.equal(await page.locator('#ingredientSearch').inputValue(),'ｶｶｵ');
  await page.fill('#ingredientSearch','zzzz');assert((await page.locator('#ingredientDailyTiers').textContent()).includes('該当する食材はありません'));
  await page.fill('#ingredientSearch','');assert.equal(await page.locator('#ingredientIndexCount').textContent(),'19 / 19');
  if(width===390)await page.screenshot({path:'/tmp/psg244-ingredients.png'});
  await page.click('#ingredientSupplyBasis');assert(await page.locator('#info').isVisible());assert(await page.locator('#dailySupplyReference').evaluate(el=>el.open));
  await page.locator('#dailySupplyReference button').filter({hasText:'食材の一覧を見る'}).click();assert(await page.locator('#ingredientPage').isVisible());
  await page.locator('#ingredientPage [data-back]').click();assert(await page.locator('#info').isVisible());
  assert.deepEqual(errors,[]);console.log(`${width}px: ingredient entry, 19 records, energy/daily/name sorts, levels, kana search, lazy details, related recipes and navigation pass`);
  await page.close();
 }}finally{await browser.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
