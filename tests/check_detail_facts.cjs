const assert=require('node:assert/strict'),path=require('node:path');
const {firefox}=require(process.env.PSG_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}});
 try{
  for(const width of [320,390,768]){
   const page=await browser.newPage({viewport:{width,height:844}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('file://'+path.resolve(__dirname,'../review.html'));
   for(const [no,points] of [[1,5],[2,12],[3,20]]){
    await page.evaluate(no=>window.openPokemonDetail(no),no);
    assert.equal(await page.locator('.psg-detail-friend b').textContent(),String(points));
    assert.equal(await page.locator('#v12Header .psg-detail-traits>span').count(),4);
   }
   const check=async selector=>page.locator(selector).evaluate(el=>{
    const children=[...el.querySelectorAll('.psg-detail-traits>span')],stats=[...el.querySelectorAll('.psg-detail-stat')];
    return {traits:children.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}),stats:stats.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}),overflow:document.documentElement.scrollWidth>innerWidth};
   });
   const verify=result=>{
    assert.equal(result.overflow,false);
    assert.equal(result.traits.length,4);assert.equal(result.stats.length,4);
    for(let i=0;i<4;i++){
     assert(result.traits[i].x<result.stats[i].x);
     assert(Math.abs(result.traits[i].y-result.stats[i].y)<1,'Fact rows must align');
     if(i)assert(result.traits[i].y>result.traits[i-1].y);
    }
   };
   verify(await check('#dexDetail .hero-info'));
   await page.evaluate(()=>{
    const p=PS_CATALOG.pokemon[1];const item={id:'detail-fixture',no:1,name:p.name,specialty:p.specialty,level:30,nature:'がんばりや',ingredients:Object.fromEntries(p.ingredientSlots.map(s=>[s.unlock,s.candidates[0].name])),subskills:[],ribbonHours:200};
    PS.state.box=[item];PS.state.selected=item;PS.refreshBoxDetail();PS.go('boxDetail');
   });
   verify(await check('#boxDetail .psg-detail-facts'));
   assert((await page.locator('.psg-detail-ribbon').getAttribute('aria-label')).includes('200時間'));
   await page.evaluate(()=>{const form=document.getElementById('boxEditForm');form.elements.ribbonHours.value='1000';form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))});
   assert((await page.locator('.psg-detail-ribbon').getAttribute('aria-label')).includes('1000時間'));
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('psg.box.instances.v1'))[0].ribbonHours),1000);
   await page.evaluate(()=>{PS.state.selected.ribbonHours=0;PS.refreshBoxDetail()});
   assert((await page.locator('.psg-detail-ribbon').textContent()).includes('リボンなし'));
   assert.deepEqual(errors,[]);
   if(width===390){await page.screenshot({path:'/tmp/psg240-box.png'});await page.evaluate(()=>openPokemonDetail(1));await page.screenshot({path:'/tmp/psg240-dex.png'});}
   console.log(`${width}px: four-row traits, friend points, ribbon change/save, no overflow or JS errors`);
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
