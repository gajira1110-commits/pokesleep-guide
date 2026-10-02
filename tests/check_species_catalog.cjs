// Optional baseline HTML verifies registry refactoring against the previous build.
const assert=require('node:assert/strict'),path=require('node:path');
const {firefox}=require(process.env.PSG_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}});try{
 const snapshot=async file=>{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.resolve(file));
  const data=await page.evaluate(()=>{
   const all=window.PS_SPECIES_CATALOG?.all()||[...Object.values(PS_CATALOG.pokemon),...PS_FORMS.records.values()];
   const key=window.PS_SPECIES_CATALOG?.key||(p=>p.speciesId||`${String(p.no).padStart(4,'0')}_default`);
   const box=window.PS_SPECIES_CATALOG?.box()||all.filter(p=>p.speciesId?p.boxEligible!==false:p.dexVisible).sort((a,b)=>a.no-b.no||Number(!!a.speciesId)-Number(!!b.speciesId)||key(a).localeCompare(key(b)));
   const identities=all.flatMap(p=>[{no:p.no,speciesId:key(p)},{no:p.no},{no:p.no,speciesId:'unknown'},{no:-1,speciesId:key(p)}]);
   return {all:all.map(key),box:box.map(key),resolved:identities.map(item=>{const p=PS_SPECIES(item);return p?key(p):null}),
    skills:Object.keys(PS_CATALOG.skills).map(id=>[id,all.filter(p=>p.dexVisible&&p.mainSkillId===id).map(key)]),
    ingredients:Object.keys(PS_CATALOG.ingredientAssets).map(name=>[name,all.filter(p=>p.dexVisible&&p.ingredientSlots?.some(s=>s.candidates.some(c=>c.name===name))).map(key)])};
  });
  assert.equal(data.all.length,248);assert.equal(new Set(data.all).size,248);assert.equal(data.box.length,248);assert.deepEqual(errors,[]);
  await page.close();return data;
 };
 const current=await snapshot(path.join(__dirname,'../review.html'));
 if(process.argv[2])assert.deepEqual(current,await snapshot(process.argv[2]));
 console.log('248 identities, Box ordering, ingredient and skill owners passed; optional baseline equivalence passed.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
