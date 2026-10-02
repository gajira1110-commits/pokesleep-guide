const assert=require('node:assert/strict'),path=require('node:path');
const {firefox}=require(process.env.PSG_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}});try{
 for(const width of [320,390,768]){
  const page=await browser.newPage({viewport:{width,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.resolve(__dirname,'../review.html'));
  await page.evaluate(()=>{const box=[26,9,94,40,248].map((no,i)=>{const p=PS_CATALOG.pokemon[no];return {id:'compact-'+i,no,level:60,nature:'まじめ',subskills:i<2?['おてつだいボーナス']:[],ingredients:Object.fromEntries(p.ingredientSlots.map(s=>[s.unlock,s.candidates[0].name]))}});localStorage.setItem('psg.box.instances.v1',JSON.stringify(box));localStorage.setItem('psg.team.primary.v1',JSON.stringify(box.map(x=>x.id)))});
  await page.reload();
  const composition=page.locator('#teamComposition');
  assert.equal(await composition.locator('b').evaluateAll(els=>els.reduce((n,el)=>n+Number(el.textContent.slice(1)),0)),5);
  assert.equal(await composition.locator('img').evaluateAll(els=>els.every(el=>el.complete&&el.naturalWidth>0)),true);
  assert.equal(await page.locator('#teamSummary').innerText(),'おて部 合計 10%');
  assert.equal(await page.locator('.psg-team-food-list').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),4);
  const tile=page.locator('.psg-team-food-item').first();assert.equal(await tile.evaluate(el=>el.open),false);
  await tile.locator('summary').click();assert.match(await tile.locator('small').innerText(),/Lv\.\d+ ×\d+/);
  await tile.locator('summary').click();
  const previewIds=await page.evaluate(()=>[...PS_FORMS.records.values()].filter(p=>p.boxEligible===false).map(p=>p.speciesId));
  assert.equal(previewIds.length,14);
  for(const id of previewIds){
   await page.evaluate(id=>openDexCard(id),id);await page.evaluate(()=>PS_AUTO_ASSETS.ready);
   assert.equal(await page.locator('#v12Ability .skill-icon img').evaluate(el=>el.complete&&el.naturalWidth>0),true);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  const corrections=await page.evaluate(()=>({mew:PS_FORMS.resolve('0151_default').skillRate,darkrai:PS_FORMS.resolve('0491_default').individualSkillSelectionRequired,preview:[...PS_FORMS.records.values()].filter(p=>p.boxEligible===false).length}));
  assert.deepEqual(corrections,{mew:null,darkrai:false,preview:14});
  await page.evaluate(()=>PS.go('box'));await page.locator('#addBtn').click();
  assert.equal(await page.locator('#boxSpecies option[value="0151_default"]').count(),0);
  assert.deepEqual(errors,[]);console.log(width+'px: accurate team icons/counts, bonus only, four food columns/details, new Dex icons/corrections, no overflow');
  if(width===390){await page.evaluate(()=>PS.go('home'));await page.screenshot({path:'/tmp/psg263-team.png'});await page.locator('.psg-team-food-card').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/psg263-food.png'})}
  await page.close();
 }
}finally{await browser.close()}})().catch(e=>{console.error(e.stack);process.exitCode=1});
