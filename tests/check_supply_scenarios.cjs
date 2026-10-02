const assert=require('node:assert/strict'),path=require('node:path');
const {firefox}=require(process.env.PSG_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}});try{
 for(const width of [320,390,768]){
  const page=await browser.newPage({viewport:{width,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.resolve(__dirname,'../review.html'));
  await page.evaluate(()=>PS.go('ingredientPage'));
  assert.equal(await page.locator('#ingredientSupplyScenario').inputValue(),'collect3h_meals0');
  await page.locator('#ingredientSearch').fill('あまいミツ');
  const food=page.locator('.psg-supply-tier[data-ingredient="あまいミツ"]');await food.locator(':scope > summary').click();
  for(const level of ['30','60'])for(const h of [1,3,6])for(const meals of [0,1]){
   const key=`collect${h}h_meals${meals}`;await page.locator('#ingredientSupplyLevel').selectOption(level);await page.locator('#ingredientSupplyScenario').selectOption(key);
   const amount=await page.evaluate(({key,level})=>PS_CATALOG.dailySupply.scenarios[key].tiers[level]['あまいミツ'].daily,{key,level});
   assert.match(await food.locator(':scope > summary').innerText(),new RegExp(amount.toLocaleString('ja-JP',{minimumFractionDigits:2,maximumFractionDigits:2}).replace('.','\\.')));
   assert.equal(await food.evaluate(el=>el.open),true);assert.equal(await page.locator('#recipeSupplyScenario').inputValue(),key);
  }
  const homeBefore=await page.locator('#teamGoodCamp').getAttribute('aria-checked');
  await page.evaluate(()=>PS_OPEN_RECIPE('spicy_leek_curry'));await page.locator('[data-recipe-mode="evaluation"]').click();
  for(const key of ['collect1h_meals0','collect3h_meals1','collect6h_meals0']){
   await page.locator('#recipeSupplyScenario').selectOption(key);
   const entry=page.locator('[data-recipe-id="spicy_leek_curry"]');assert.equal(await entry.evaluate(el=>el.open),true);
   const expected=await page.evaluate(key=>PS_CATALOG.dailySupply.scenarios[key].burdens['30'].spicy_leek_curry.dedicated,key);
   assert((await entry.locator('.psg-supply-detail').innerText()).includes(expected.toLocaleString('ja-JP',{minimumFractionDigits:2,maximumFractionDigits:2})));
   assert.equal(await page.locator('#ingredientSupplyScenario').inputValue(),key);
  }
  await page.locator('#recipeSupplyMeals').selectOption('1');
  const expected=await page.evaluate(()=>PS_CATALOG.dailySupply.scenarios.collect6h_meals0.burdens['30'].spicy_leek_curry.dedicated/3);
  assert((await page.locator('[data-recipe-id="spicy_leek_curry"] .psg-supply-detail').innerText()).includes(expected.toLocaleString('ja-JP',{minimumFractionDigits:2,maximumFractionDigits:2})));
  assert.equal(await page.locator('#teamGoodCamp').getAttribute('aria-checked'),homeBefore);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);
  console.log(`${width}px: 6 scenarios x2 levels, ingredient/recipe sync, detail preservation, 1 meal scaling, no overflow/errors`);await page.close();
 }
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
