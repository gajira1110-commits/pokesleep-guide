const assert=require('node:assert/strict'),path=require('node:path');
const {firefox}=require(process.env.PSG_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const b=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}});try{
 for(const width of [320,390,768]){
  const page=await b.newPage({viewport:{width,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.resolve(__dirname,'../review.html'));
  await page.evaluate(()=>{const box=[26,157,154,248,94,9].map((no,j)=>{const p=PS_CATALOG.pokemon[no];return {id:'meal-'+j,no,level:60,nature:'まじめ',subskills:[],ribbonHours:0,ingredients:Object.fromEntries(p.ingredientSlots.map(s=>[s.unlock,s.candidates[0].name]))}});localStorage.setItem('psg.box.instances.v1',JSON.stringify(box));localStorage.setItem('psg.team.primary.v1',JSON.stringify(box.slice(0,5).map(x=>x.id)));localStorage.setItem('psg-day-settings-v1',JSON.stringify({initialEnergy:100,goodCamp:false,meals:true,collectionHours:4}))});
  await page.reload();await page.selectOption('#homeMealSelect','カレー・シチュー');await page.selectOption('#swapRecipe','simple_white_stew');
  assert.equal(await page.locator('#swapSettings').evaluate(el=>el.open),false);
  const calculate=async()=>{await page.locator('#swapCalculate').evaluate(el=>el.click());await page.waitForFunction(()=>!document.getElementById('swapCalculate').disabled)};
  await calculate();assert.match(await page.locator('#swapStatus').textContent(),/サブスキル/);assert.equal(await page.locator('#swapSettings').evaluate(el=>el.open),true);
  await page.check('#swapAssumeSubskills');await calculate();assert.match(await page.locator('.psg-meal-food-time').textContent(),/モーモーミルク ×7.*担当なし/);
  await page.locator('#swapCandidates').evaluate(el=>el.closest('details').open=true);await page.locator('.psg-swap-candidate input[type=checkbox]').check();await calculate();assert.match(await page.locator('#swapResults').textContent(),/起点げんきを入力/);
  await page.locator('.psg-swap-candidate input[type=number]').fill('100');await calculate();assert.equal(await page.locator('.psg-swap-option').count(),5);assert.match(await page.locator('.psg-swap-option').first().textContent(),/モーモーミルク：担当なし → 約/);assert.match(await page.locator('.psg-swap-option').first().textContent(),/1食分全体/);
  await page.selectOption('#swapRecipe','sacred_sword_sukiyaki_curry');await calculate();assert.equal(await page.locator('.psg-meal-food-time').count(),4);assert.match(await page.locator('[data-food="ふといながねぎ"]').textContent(),/×27.*担当なし/);assert.match(await page.locator('[data-food="とくせんエッグ"]').textContent(),/×22.*担当なし/);
  await page.locator('[data-food="とくせんエッグ"]').evaluate(el=>el.click());await page.waitForFunction(()=>!document.getElementById('swapCalculate').disabled);assert.match(await page.locator('#swapStatus').textContent(),/とくせんエッグ/);assert.equal(await page.locator('[data-food="とくせんエッグ"]').getAttribute('aria-pressed'),'true');
  await page.selectOption('#swapRecipe','simple_white_stew');await calculate();
  await page.evaluate(()=>{document.getElementById('swapCalculate').click();document.getElementById('swapCancel').click()});await page.waitForFunction(()=>!document.getElementById('swapCalculate').disabled);assert.match(await page.locator('#swapStatus').textContent(),/中止/);
  await page.evaluate(()=>{document.getElementById('swapCalculate').click();const s=document.getElementById('swapStart');s.value='3';s.dispatchEvent(new Event('change'))});await page.waitForTimeout(100);assert.equal(await page.locator('#swapResults').textContent(),'');
  await calculate();assert.match(await page.locator('.psg-swap-option').first().textContent(),/起床3時間後/);
  await page.locator('#swapBasisLink').evaluate(el=>el.click());assert.equal(await page.locator('#swapPredictionBasis').evaluate(el=>el.open),true);await page.evaluate(()=>PS.go('home'));
  await page.locator('.psg-swap-candidate input[type=number]').fill('0');await calculate();assert.doesNotMatch(await page.locator('#swapResults').textContent(),/起点げんきを入力/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
  if(width===390){await page.locator('#swapSettings').evaluate(el=>el.open=false);await page.locator('.psg-swap-card').evaluate(el=>window.scrollTo(0,scrollY+el.getBoundingClientRect().top-140));await page.screenshot({path:'/tmp/psg249-meal.png'})}
  console.log(width+'px: single-meal food times, collapsed controls, missing providers, focused swaps, explicit energy, cancel/stale results and basis link');await page.close();
 }
}finally{await b.close()}})().catch(e=>{console.error(e.stack);process.exitCode=1});
