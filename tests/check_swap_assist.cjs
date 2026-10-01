const assert=require('node:assert/strict'),path=require('node:path');
const {firefox}=require(process.env.PSG_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}});
 try{for(const width of [320,390,768]){
  const page=await browser.newPage({viewport:{width,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.resolve(__dirname,'../review.html'));
  await page.evaluate(()=>{
   const box=[26,157,154,248,94,9].map((no,j)=>{const p=PS_CATALOG.pokemon[no];return {id:'swap-'+j,no,level:60,nature:'まじめ',subskills:[],ribbonHours:0,ingredients:Object.fromEntries(p.ingredientSlots.map(s=>[s.unlock,s.candidates[0].name]))}});
   localStorage.setItem('psg.box.instances.v1',JSON.stringify(box));localStorage.setItem('psg.team.primary.v1',JSON.stringify(box.slice(0,5).map(x=>x.id)));
   localStorage.setItem('psg-day-settings-v1',JSON.stringify({initialEnergy:100,goodCamp:false,meals:true,collectionHours:4}));
  });
  await page.reload();await page.selectOption('#homeMealSelect','カレー・シチュー');await page.selectOption('#swapRecipe','simple_white_stew');
  const calculate=async()=>{await page.locator('#swapCalculate').evaluate(el=>el.click());await page.waitForFunction(()=>!document.getElementById('swapCalculate').disabled)};
  await calculate();assert.match(await page.locator('#swapStatus').textContent(),/サブスキル/);assert.equal(await page.locator('.psg-swap-option').count(),0);
  await page.check('#swapAssumeSubskills');await calculate();assert.match(await page.locator('#swapResults').textContent(),/不足21.0/);
  await page.locator('.psg-swap-card details').first().locator('summary').click();
  await page.locator('.psg-swap-candidate input[type=checkbox]').check();await calculate();assert.match(await page.locator('#swapResults').textContent(),/控えの起点げんきを入力/);assert.equal(await page.locator('.psg-swap-option').count(),0);
  await page.locator('.psg-swap-candidate input[type=number]').fill('100');await calculate();
  assert.equal(await page.locator('.psg-swap-option').count(),5);assert.match(await page.locator('.psg-swap-option').first().textContent(),/約6.0時間/);
  assert.match(await page.locator('.psg-swap-option').first().textContent(),/22.7 \/ 21個/);assert.match(await page.locator('.psg-swap-option').first().textContent(),/スキル差：未計算/);
  assert.match(await page.locator('.psg-swap-option').first().textContent(),/とくせんリンゴ -8.7個/);
  assert.match(await page.locator('.psg-swap-option').first().textContent(),/好物きのみを設定/);
  // Known normal field: berry delta becomes numeric and remains separate from skill delta.
  await page.selectOption('#homeFieldSelect','cyan');assert.equal(await page.locator('.psg-swap-option').count(),0);await calculate();
  assert.match(await page.locator('.psg-swap-option').first().textContent(),/きのみエナジー差：[+−][\d,]+/);
  await page.locator('#teamGoodCamp').evaluate(el=>el.click());await calculate();assert.match(await page.locator('#swapStatus').textContent(),/キャンプには未対応/);
  await page.locator('#teamGoodCamp').evaluate(el=>el.click());
  // Cancellation and a condition change must never leave stale suggestions.
  await page.evaluate(()=>{document.getElementById('swapCalculate').click();document.getElementById('swapCancel').click()});
  await page.waitForFunction(()=>!document.getElementById('swapCalculate').disabled);assert.match(await page.locator('#swapStatus').textContent(),/中止/);assert.equal(await page.locator('.psg-swap-option').count(),0);
  await page.evaluate(()=>{document.getElementById('swapCalculate').click();const s=document.getElementById('swapStart');s.value='3';s.dispatchEvent(new Event('change'))});
  await page.waitForTimeout(100);assert.equal(await page.locator('#swapResults').textContent(),'');assert.match(await page.locator('#swapStatus').textContent(),/条件を選んで/);
  await calculate();assert.match(await page.locator('.psg-swap-option').first().textContent(),/起床3時間後/);
  await page.locator('#swapBasisLink').evaluate(el=>el.click());assert.equal(await page.locator('#swapPredictionBasis').getAttribute('open'),'');assert.equal(await page.locator('#info').evaluate(el=>el.classList.contains('active')),true);
  await page.evaluate(()=>PS.go('home'));assert.equal(await page.locator('.psg-swap-option').count(),5);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
  if(width===390){await page.locator('.psg-swap-card').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/psg247-swap-verified.png'})}
  // Explicit zero reserve energy is valid; it must not silently become 100.
  await page.locator('.psg-swap-candidate input[type=number]').fill('0');await calculate();assert.doesNotMatch(await page.locator('#swapResults').textContent(),/控えの起点げんきを入力/);
  // Already sufficient: the incoming milk provider is now on the current team.
  await page.evaluate(()=>{localStorage.setItem('psg.team.primary.v1',JSON.stringify(['swap-5','swap-1','swap-2','swap-3','swap-4']))});
  await page.reload();await page.selectOption('#swapRecipe','simple_white_stew');await page.check('#swapAssumeSubskills');await calculate();assert.match(await page.locator('#swapStatus').textContent(),/現在の5匹で3食分を満たす/);
  console.log(`${width}px: deficit, explicit reserve energy, 6h example, outgoing losses, berry/skill separation, cancel/stale results, zero energy, already sufficient`);
  await page.close();
 }}finally{await browser.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
