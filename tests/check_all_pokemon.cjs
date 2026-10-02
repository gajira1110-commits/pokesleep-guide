const assert=require('node:assert/strict'),path=require('node:path');
const {firefox}=require(process.env.PSG_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}});try{
 for(const width of [320,390,768]){
  const page=await browser.newPage({viewport:{width,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  await page.goto('file://'+path.resolve(__dirname,'../review.html'));await page.evaluate(()=>PS_AUTO_ASSETS.ready);await page.evaluate(()=>PS.go('box'));
  await page.locator('#addBtn').click();
  const options=await page.locator('#boxSpecies option').evaluateAll(nodes=>nodes.map(n=>({id:n.value,name:n.textContent})));
  assert.equal(options.length,248);assert.equal(new Set(options.map(x=>x.id)).size,248);
  const ids=await page.evaluate(()=>PS_CATALOG.forms.registrationCoverage.addedBoxSpeciesIds);assert.equal(ids.length,14);
  await page.locator('#boxCancelAdd').click();
  for(const id of ids){
   await page.locator('#addBtn').click();await page.locator('#boxSpecies').selectOption(id);await page.locator('#boxConfirmAdd').click();
   const p=await page.evaluate(id=>{const p=PS_FORMS.resolve(id);PS.state.selected=PS.state.box.at(-1);PS.refreshBoxDetail();PS.go('boxDetail');return {name:p.name,help:p.help,carry:p.carry,skill:p.skillRate};},id);
   assert.equal(await page.locator('#boxTitle').innerText(),p.name);
   assert.match(await page.locator('#boxStats strong').nth(0).innerText(),new RegExp(p.help.toLocaleString()+'秒'));
   assert.equal(await page.locator('#boxStats strong').nth(1).innerText(),String(p.carry));
   assert.match(await page.locator('#boxDayFood').innerText(),/特殊スキル.*計算保留/);
   assert.match(await page.locator('#boxEvaluation').innerText(),/未対応/);
   await page.locator('#boxHeaderEdit').click();await page.locator('#boxEditNature').selectOption('まじめ');
   await page.locator('#boxEditForm').evaluate(f=>f.requestSubmit());assert.equal(await page.locator('#boxEditMessage').innerText(),'保存しました');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.evaluate(()=>PS.go('box'));
  }
  await page.reload();assert.equal(await page.evaluate(()=>PS.state.box.length),14);
  const open=async id=>page.evaluate(id=>{PS.state.selected=PS.state.box.find(x=>x.speciesId===id);PS.refreshBoxDetail();PS.go('boxDetail');document.getElementById('boxEditor').open=true},id);
  await open('0151_default');
  assert.equal(await page.locator('[name="ingredient-unlocked-30"]').inputValue(),'');
  await page.locator('[name="ingredient-1"]').selectOption('とくせんエッグ');await page.locator('[name="ingredient-unlocked-1"]').selectOption('yes');
  await page.locator('[name="ingredient-30"]').selectOption('げきからハーブ');await page.locator('[name="ingredient-unlocked-30"]').selectOption('no');
  await page.locator('[name="ingredient-60"]').selectOption('おいしいシッポ');await page.locator('[name="ingredient-unlocked-60"]').selectOption('yes');
  await page.locator('[name="subskill-0"]').selectOption('スキルレベルアップM');await page.locator('[name="subskill-unlocked-0"]').selectOption('yes');
  await page.locator('[name="subskill-1"]').selectOption('最大所持数アップS');await page.locator('[name="subskill-unlocked-1"]').selectOption('no');
  await page.locator('[name="subskill-2"]').selectOption('スキル確率アップS');await page.locator('[name="subskill-unlocked-2"]').selectOption('yes');
  await page.locator('[name="skillLevel"]').fill('8');await page.locator('[name="mythicalSelectedEffect"]').selectOption('食材ゲットS');
  await page.locator('#boxEditMythical summary').click();await page.locator('[name="mythical-learned-0"]').check();
  await page.locator('#boxEditForm').evaluate(f=>f.requestSubmit());assert.equal(await page.locator('#boxEditMessage').innerText(),'保存しました');
  await page.locator('#lvRange').fill('31');await page.reload();await open('0151_default');
  const mew=await page.evaluate(()=>PS.state.selected);assert.equal(mew.level,31);assert.equal(mew.skillLevel,8);
  assert.deepEqual(mew.mythicalState.ingredientUnlocked,{'1':true,'30':false,'60':true});assert.deepEqual(mew.mythicalState.subskillUnlocked,[true,false,true,null,null]);
  assert.deepEqual(mew.mythicalState.learnedEffects,['ゆびをふる','食材ゲットS']);assert.equal(mew.mythicalState.selectedEffect,'食材ゲットS');
  assert.equal(await page.locator('#boxStats strong').nth(1).innerText(),'26'); // recorded but locked carry bonus is inactive
  assert.match(await page.locator('#boxSubskillRows .psg-box-subskill').nth(2).getAttribute('aria-label'),/解放済み・Lv未到達/);
  assert.match(await page.locator('#boxIngredientRows').innerText(),/解放済み・Lv未到達/);
  await page.locator('[name="mythicalSelectedEffect"]').selectOption('ゆびをふる');await page.locator('#boxEditForm').evaluate(f=>f.requestSubmit());
  assert.equal(await page.evaluate(()=>PS.state.selected.skillLevel),8);assert.deepEqual(await page.evaluate(()=>PS.state.selected.mythicalState.learnedEffects),['ゆびをふる','食材ゲットS']);
  await open('0491_default');assert.equal(await page.locator('[name="mythicalSelectedEffect"]').count(),0);assert.match(await page.locator('#boxEditMythical').innerText(),/固定/);
  await page.locator('[name="ingredient-1"]').selectOption('マメミート');await page.locator('[name="ingredient-unlocked-1"]').selectOption('yes');await page.locator('#boxEditForm').evaluate(f=>f.requestSubmit());
  assert.equal(await page.evaluate(()=>PS.state.selected.mythicalState.ingredientUnlocked[30]),null);
  // Unsupported special skill blocks team totals rather than silently contributing zero.
  await page.evaluate(()=>localStorage.setItem('psg.team.primary.v1',JSON.stringify([PS.state.box.find(x=>x.speciesId==='0151_default').id])));await page.reload();
  assert.match(await page.locator('#teamDayEstimate').innerText(),/特殊スキル.*未対応/);assert.equal(await page.locator('#teamDayEstimate .psg-day-energy-amount').count(),0);
  assert.match(await page.locator('#teamIngredientList').innerText(),/とくせんエッグ/);assert.doesNotMatch(await page.locator('#teamIngredientList').innerText(),/げきからハーブ|おいしいシッポ/);
  // Official special-team exception: the distinct Latias/Latios pair survives,
  // a third special or an incompatible pair does not.
  await page.evaluate(()=>localStorage.setItem('psg.team.primary.v1',JSON.stringify(['0380_default','0381_default','0151_default'].map(id=>PS.state.box.find(x=>x.speciesId===id).id))));await page.reload();
  assert.deepEqual(await page.evaluate(()=>PS.teamContext().members.map(x=>x.speciesNo)),[380,381]);
  await page.evaluate(()=>localStorage.setItem('psg.team.primary.v1',JSON.stringify(['0151_default','0491_default'].map(id=>PS.state.box.find(x=>x.speciesId===id).id))));await page.reload();
  assert.deepEqual(await page.evaluate(()=>PS.teamContext().members.map(x=>x.speciesNo)),[151]);
  // Backup JSON preserves observed unlock state and Mew Lv8; older formats remain readable.
  await page.evaluate(()=>{window.testBackupBlob=null;const create=URL.createObjectURL;URL.createObjectURL=b=>{window.testBackupBlob=b;return create(b)};HTMLAnchorElement.prototype.click=function(){};PS.go('info')});
  await page.locator('#backupExport').click();const payload=await page.evaluate(async()=>JSON.parse(await window.testBackupBlob.text()));assert.equal(payload.version,5);
  const savedMew=payload.box.find(x=>x.speciesId==='0151_default');assert.equal(savedMew.skillLevel,8);assert.equal(savedMew.mythicalState.ingredientUnlocked[60],true);
  await page.locator('#backupFile').setInputFiles({name:'v5.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(payload))});await page.locator('#backupImport').click();
  assert.deepEqual(await page.evaluate(()=>PS.state.box.find(x=>x.speciesId==='0151_default').mythicalState),savedMew.mythicalState);
  const legacy={...payload,version:4,box:payload.box.map(x=>{const y={...x};delete y.mythicalState;if(y.no===151)delete y.speciesId;return y})};
  await page.evaluate(()=>PS.go('info'));await page.locator('#backupFile').setInputFiles({name:'v4.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacy))});await page.locator('#backupImport').click();
  await page.evaluate(()=>{PS.state.selected=PS.state.box.find(x=>x.no===151);PS.refreshBoxDetail();PS.go('boxDetail');document.getElementById('boxEditor').open=true});assert.equal(await page.locator('[name="ingredient-unlocked-1"]').inputValue(),'');assert.equal(await page.locator('[name="mythicalSelectedEffect"]').inputValue(),'');assert.equal(await page.locator('[name="ingredient-60"]').inputValue(),'おいしいシッポ');
  await page.evaluate(()=>PS.go('info'));await page.locator('#backupFile').setInputFiles({name:'v5-restore.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(payload))});await page.locator('#backupImport').click();
  await open('0425_default');const driftId=await page.evaluate(()=>PS.state.selected.id);await page.locator('#boxEditEvolution').selectOption('0426_default');await page.locator('#boxEditForm').evaluate(f=>f.requestSubmit());
  assert.equal(await page.evaluate(()=>PS.state.selected.id),driftId);assert.equal(await page.evaluate(()=>PS.state.selected.speciesId),'0426_default');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
  console.log(`${width}px all 248 options, 14 added registrations/reloads, mythical states, Lv8, pending totals, evolution and v5 backup passed`);await page.close();
 }
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
