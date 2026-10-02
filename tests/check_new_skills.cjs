const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {firefox}=require(process.env.PSG_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..');
const skills=fs.readdirSync(root+'/master/skills').map(dir=>JSON.parse(fs.readFileSync(root+'/master/skills/'+dir+'/data.json'))).filter(s=>s.effectType==='reference_only');
assert.equal(skills.length,11);
for(const s of skills){
 assert.deepEqual(Object.keys(s.levels).map(Number),Array.from({length:s.maxLevel},(_,i)=>i+1));
 assert(s.nativeSpecies.every(p=>p.speciesId&&p.name));assert.equal(s.calculationStatus,'not_implemented');
 const rows=s.sourceTable['効果表'].flat().filter(row=>/^\d+$/.test(row[0])||/^\d+$/.test(row[1]));
 for(const row of rows){const pos=/^\d+$/.test(row[0])?0:1,entry=s.levels[row[pos]];assert.deepEqual(entry.referenceValues,row.slice(pos+1));for(const value of entry.referenceValues)assert(entry.description.includes(value),s.id+' missing '+value);}
}
assert.equal(skills.find(s=>s.id==='stockpile_energy_charge_s').levels[7].referenceValues[10],'90,940');
assert.equal(skills.find(s=>s.id==='almighty').levels[8].referenceValues[0],'1 ときどき 4');
(async()=>{const b=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}});try{
 for(const width of [320,390,768]){
  const page=await b.newPage({viewport:{width,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('file://'+root+'/review.html');await page.evaluate(()=>PS.go('skillPage'));
  assert.equal(await page.locator('.psg-skill-entry').count(),38);
  for(const s of skills){
   await page.locator('#skillSearch').fill(s.name);assert.equal(await page.locator('.psg-skill-entry').count(),1);await page.locator('.psg-skill-entry summary').click();
   assert.equal(await page.locator('.psg-skill-level').count(),s.maxLevel);assert.match(await page.locator('.psg-skill-entry').innerText(),/日産予想への効果反映は未対応/);
   for(const p of s.nativeSpecies)assert.ok((await page.locator('.psg-skill-species').innerText()).includes(p.name));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   if(width===390&&s.id==='stockpile_energy_charge_s')await page.screenshot({path:'/tmp/psg262-stockpile.png'});
  }
  await page.locator('#skillSearch').fill('ストリンダー');assert.equal(await page.locator('.psg-skill-entry').count(),2);
  await page.locator('#skillSearch').fill('存在しないスキル');assert.match(await page.locator('#skillIndexList').innerText(),/該当するスキルはありません/);
  await page.locator('#skillSearch').fill('');await page.evaluate(()=>openDexCard(25));assert.match(await page.locator('#detailSkill').innerText(),/エナジーチャージ/);
  assert.deepEqual(errors,[]);console.log(width+'px: 38 skill index, all 11 reference tables/levels, conditional notes/native names/search, no overflow or JS errors');await page.close();
 }
}finally{await b.close()}})().catch(e=>{console.error(e.stack);process.exitCode=1});
