const assert=require('node:assert/strict'),path=require('node:path');
const {firefox}=require(process.env.PSG_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}});try{
 for(const width of [320,390,768]){
  const page=await browser.newPage({viewport:{width,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.resolve(__dirname,'../review.html'));await page.evaluate(()=>PS_AUTO_ASSETS.ready);
  const select=async(no,level,nature='まじめ',mint=false,speciesId)=>page.evaluate(x=>{
   const p=x.speciesId?PS_FORMS.resolve(x.speciesId):PS_CATALOG.pokemon[String(x.no).padStart(4,'0')];
   PS.state.selected={id:'growth-fixture',no:x.no,name:p?.name||'未確認',level:x.level,nature:x.nature,mint:x.mint,...(x.speciesId?{speciesId:x.speciesId}:{}),ingredients:{},subskills:[]};
   PS.refreshBoxDetail();PS.go('boxDetail');
  },{no,level,nature,mint,speciesId});
  const saved=await page.evaluate(()=>localStorage.getItem('psg.box.instances.v1'));
  // Fixtures include the Lv25 and Lv30 candy EXP boundaries and carry-over.
  for(const [no,level,nature,target,candy,shards] of [
   [1,24,'まじめ',25,15,1380],[1,24,'おくびょう',25,13,1196],[1,24,'ゆうかん',25,19,1748],
   [1,24,'まじめ',30,110,11434],[1,24,'おくびょう',30,94,9777],[1,24,'ゆうかん',30,133,13830],
   [1,29,'まじめ',30,21,2457],[1,29,'まじめ',50,740,145722],
   [1,49,'まじめ',50,43,12685],[1,59,'まじめ',60,113,67009],
   [246,29,'まじめ',30,31,3627],[243,49,'まじめ',50,77,22715]
  ]){
   await select(no,level,nature);
   const row=page.locator('#boxGrowth .psg-milestone').filter({hasText:`Lv.${target}　`});
   assert.match(await row.innerText(),new RegExp(`アメ 約${candy.toLocaleString()}個・ゆめのかけら 約${shards.toLocaleString()}`));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  await select(1,24);await page.locator('#boxGrowth summary').click();
  assert.match(await page.locator('#boxGrowth').innerText(),/現LvのEXP0/);assert.match(await page.locator('#boxGrowth').innerText(),/研究ランク/);
  await select(1,24,'');assert.match(await page.locator('#boxGrowth').innerText(),/性格を設定/);assert.equal(await page.locator('#boxGrowth').getByText(/アメ 約/).count(),0);
  await select(1,24,'まじめ',true);assert.match(await page.locator('#boxGrowth').innerText(),/ミント適用後のEXP補正は未確認/);
  await select(710,24);assert.match(await page.locator('#boxGrowth').innerText(),/経験値タイプ未確認/);
  await select(25,29,'まじめ',false,'0025_captain');assert.match(await page.locator('#boxGrowth').innerText(),/アメ 約21個/);
  await select(246,50);assert.match(await page.locator('#boxGrowth').innerText(),/EXP表に差異あり/);
  await select(1,60);assert.match(await page.locator('#boxGrowth').innerText(),/Lv.70　サブスキル解放/);assert.match(await page.locator('#boxGrowth').innerText(),/アメ 約1,227個・ゆめのかけら 約1,141,655/);
  await select(1,70);assert.match(await page.locator('#boxGrowth').innerText(),/次の解放はありません/);
  assert.equal(await page.evaluate(()=>localStorage.getItem('psg.box.instances.v1')),saved);
  assert.deepEqual(errors,[]);await page.close();console.log(`${width}px growth estimates, boundaries, pending conditions, forms and unchanged storage passed`);
 }
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
