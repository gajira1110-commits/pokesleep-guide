const assert=require('node:assert/strict'),path=require('node:path');
const {firefox}=require(process.env.PSG_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}});try{
 for(const width of [320,390,768]){
  const page=await browser.newPage({viewport:{width,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.resolve(__dirname,'../review.html'));await page.evaluate(()=>PS_AUTO_ASSETS.ready);
  const seed=[{id:'legacy',no:25,level:1,nature:'まじめ',favorite:true},{id:'unspecified',no:710,level:1,nature:'まじめ'},{id:'contradiction',no:25,speciesId:'0133_holiday',level:1}];
  await page.evaluate(seed=>localStorage.setItem('psg.box.instances.v1',JSON.stringify(seed)),seed);await page.reload();
  assert.equal(await page.evaluate(()=>PS.state.box.length),3);
  assert.equal(await page.evaluate(()=>PS_SPECIES(PS.state.box[0]).help),2700);
  assert.equal(await page.evaluate(()=>PS_SPECIES(PS.state.box[1])),null);
  assert.equal(await page.evaluate(()=>PS_SPECIES(PS.state.box[2])),null);
  assert.equal(await page.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('psg.box.instances.v1')))),JSON.stringify(seed));
  await page.evaluate(()=>{PS.state.selected=PS.state.box[1];PS.refreshBoxDetail();PS.go('boxDetail')});
  assert.match(await page.locator('#boxEvaluation').innerText(),/姿が未確認/);
  assert.equal(await page.locator('#boxEditAppearance').inputValue(),'');
  await page.locator('#boxHeaderEdit').click();
  await page.locator('#boxEditAppearance').selectOption('0710_jumbo');
  await page.evaluate(()=>document.getElementById('boxEditForm').requestSubmit());
  assert.equal(await page.evaluate(()=>PS.state.box.find(x=>x.id==='unspecified').speciesId),'0710_jumbo');
  await page.evaluate(()=>PS.go('box'));
  const ids=await page.evaluate(()=>[...PS_FORMS.records.keys()]);
  for(const id of ids){
   await page.locator('#addBtn').click();await page.locator('#boxSpecies').selectOption(id);await page.locator('#boxConfirmAdd').click();
   const item=await page.evaluate(()=>PS.state.box.at(-1));assert.equal(item.speciesId,id);
   const result=await page.evaluate(id=>{
    const item=PS.state.box.at(-1),p=PS_FORMS.resolve(id);item.nature='まじめ';
    PS.state.selected=item;PS.refreshBoxDetail();PS.go('boxDetail');
    return {help:p.help,carry:p.carry,stats:[...document.querySelectorAll('#boxStats strong')].map(x=>x.textContent),name:p.name};
   },id);
   assert.equal(result.stats[0],result.help.toLocaleString()+'秒');assert.equal(result.stats[1],String(result.carry));
   assert.equal(await page.locator('#boxArtwork img.psg-asset-preview, #boxArtwork .psg-face-sheet, #boxArtwork > img').count(),0);
   assert.match(await page.locator('#boxDayFood').innerText(),/約/);
   await page.evaluate(()=>document.getElementById('boxEditForm').requestSubmit());assert.equal(await page.locator('#boxEditMessage').innerText(),'保存しました');
   assert.equal(await page.evaluate(()=>PS.state.box.at(-1).speciesId),id);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.evaluate(()=>PS.go('box'));
  }
  await page.reload();assert.equal(await page.evaluate(()=>PS.state.box.length),21);
  await page.evaluate(()=>{PS.state.selected=PS.state.box.find(x=>x.speciesId==='0037_alola');PS.refreshBoxDetail();PS.go('boxDetail');document.getElementById('boxEditor').open=true});
  const regionalId=await page.evaluate(()=>PS.state.selected.id);await page.locator('#boxEditEvolution').selectOption('0038_alola');await page.evaluate(()=>document.getElementById('boxEditForm').requestSubmit());
  assert.deepEqual(await page.evaluate(id=>{const x=PS.state.box.find(x=>x.id===id);return [x.id,x.no,x.speciesId]},regionalId),[regionalId,38,'0038_alola']);
  await page.evaluate(()=>{PS.state.selected=PS.state.box.find(x=>x.speciesId==='0710_small');PS.state.selected.ribbonHours=500;PS.refreshBoxDetail();PS.go('boxDetail')});
  assert.equal(await page.locator('#boxStats strong').first().innerText(),'未確認');
  for(const id of ['0037_alola','0038_alola','0194_paldea']){
   await page.evaluate(()=>PS.go('dex'));await page.locator(`.dex-card[data-species-id="${id}"]`).click();
   assert.equal(await page.locator('.psg-dex-costume').count(),0);assert.match(await page.locator('.v51-head-name').innerText(),/アローラ|パルデア/);
   if(id==='0037_alola'){await page.locator('#detailEvolution [data-evo-no]').click();assert.match(await page.locator('.v51-head-name').innerText(),/キュウコン\(アローラ\)/)}
  }
  // Explicit costume update retains the individual id, level and favorite.
  await page.evaluate(()=>{PS.state.selected=PS.state.box[0];PS.refreshBoxDetail();PS.go('boxDetail')});
  await page.locator('#boxHeaderEdit').click();
  await page.locator('#boxEditAppearance').selectOption('0025_captain');await page.evaluate(()=>document.getElementById('boxEditForm').requestSubmit());
  assert.deepEqual(await page.evaluate(()=>{const x=PS.state.box[0];return [x.id,x.no,x.speciesId,x.level,x.favorite]}),['legacy',25,'0025_captain',1,true]);
  assert.equal(await page.locator('#boxEditEvolution option').count(),1);
  // Team estimates and artwork use the same form resolver.
  await page.evaluate(()=>{localStorage.setItem('psg.team.primary.v1',JSON.stringify(PS.state.box.filter(x=>x.speciesId&&x.id!=='contradiction').slice(0,5).map(x=>x.id)))});await page.reload();
  assert.match(await page.locator('#teamDayEstimate').innerText(),/エナジー合計/);
  assert.equal(await page.locator('#teamSlots .psg-team-face img').count(),0);
  // Export/import includes explicit identities and form-specific discoveries.
  await page.evaluate(()=>{
   localStorage.setItem('psg-sleep-discoveries-v1',JSON.stringify({'0025_halloween_01':true}));
   const original=URL.createObjectURL;URL.createObjectURL=blob=>{window.testBackupBlob=blob;return original(blob)};
   document.getElementById('backupExport').click();
  });
  const payload=await page.evaluate(async()=>JSON.parse(await window.testBackupBlob.text()));assert.equal(payload.version,4);assert.equal(payload.box[0].speciesId,'0025_captain');
  const sleepId=await page.evaluate(()=>PS_FORMS.records.get('0025_halloween_23').sleepStyles[0].id);payload.sleepFound={[sleepId]:true};
  await page.locator('#backupFile').setInputFiles({name:'forms.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(payload))});
  page.once('dialog',dialog=>dialog.accept());await page.evaluate(()=>document.getElementById('backupImport').click());
  assert.equal(await page.evaluate(()=>PS.state.box[0].speciesId),'0025_captain');assert.equal(await page.evaluate(id=>JSON.parse(localStorage.getItem('psg-sleep-discoveries-v1'))[id],sleepId),true);
  await page.evaluate(()=>{PS.state.selected=PS.state.box[0];PS.refreshBoxDetail();PS.go('boxDetail')});if(width===390)await page.screenshot({path:'/tmp/psg260-box-form.png'});
  assert.deepEqual(errors,[]);console.log(width+'px: 18 form registrations/reloads, legacy identity and missing size, explicit edit, 3 independent dex entries, form team forecast/art, v4 backup roundtrip');await page.close();
 }
}finally{await browser.close()}})().catch(e=>{console.error(e.stack);process.exitCode=1});
