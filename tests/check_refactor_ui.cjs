// Visual/interaction equivalence for a no-behavior-change refactor.
// PSG_PLAYWRIGHT_MODULE may point to the installed Playwright package.
const assert=require('node:assert/strict'),path=require('node:path');
const {firefox}=require(process.env.PSG_PLAYWRIGHT_MODULE||'playwright');
const baseline=path.resolve(process.argv[2]),current=path.resolve(__dirname,'..');
(async()=>{
 const browser=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}});
 try{
  for(const width of [320,390,768]){
   const results=[];
   for(const root of [baseline,current]){
    const page=await browser.newPage({viewport:{width,height:844}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('file://'+path.join(root,'review.html'));
    await page.evaluate(()=>{
     const species=Object.values(PS_CATALOG.pokemon).filter(p=>p.dexVisible).slice(0,5);
     const box=species.map((p,i)=>({id:'fixture-'+i,no:Number(p.no),level:60,nature:'がんばりや',subskills:[],ingredients:Object.fromEntries(p.ingredientSlots.map(s=>[s.unlock,s.candidates[0].name]))}));
     localStorage.setItem('psg.box.instances.v1',JSON.stringify(box));
     localStorage.setItem('psg.team.primary.v1',JSON.stringify(box.map(p=>p.id)));
    });
    await page.reload();
    const snapshots=[];
    const capture=async selector=>page.locator(selector).evaluate(el=>({html:el.innerHTML,styles:[el,...el.querySelectorAll('*')].map(n=>{const c=getComputedStyle(n),r=n.getBoundingClientRect();return {tag:n.tagName,rect:[r.width,r.height],style:[c.display,c.padding,c.margin,c.gap,c.fontSize,c.lineHeight,c.color,c.backgroundColor,c.border,c.gridTemplateColumns]}})}));
    await page.evaluate(()=>PS.go('recipePage'));
    for(const category of ['カレー・シチュー','サラダ','デザート・ドリンク']){
     await page.locator(`[data-recipe-category="${category}"]`).click();
     for(const sort of ['energy-desc','energy-asc','name']){
      await page.locator('#recipeSort').selectOption(sort);
      await page.locator('.psg-recipe-entry').first().evaluate(el=>el.open=true);
      await page.waitForTimeout(50);
      snapshots.push(await capture('#recipeList'));
     }
     await page.locator('#recipeIngredientButton').click();
     await page.locator('#recipeIngredientOptions button').first().click();
     snapshots.push(await capture('#recipeList'));
    }
    await page.evaluate(()=>PS.go('home'));
    snapshots.push(await capture('#teamSlots'));
    await page.locator('#teamReorder').click();
    await page.locator('.psg-team-choose').nth(0).click();
    await page.locator('.psg-team-choose').nth(1).click();
    snapshots.push(await capture('#teamSlots'));
    await page.evaluate(()=>{PS.go('box');PS.state.selected=PS.state.box[0];PS.refreshBoxDetail();PS.go('boxDetail')});
    snapshots.push(await capture('#boxDetail'));
    await page.locator('#boxFavorite').click();
    snapshots.push(await capture('#boxDetail'));
    await page.locator('#plus').click();
    assert.equal(await page.locator('#lv').textContent(),'Lv.61');
    await page.evaluate(()=>{
     const form=document.getElementById('boxEditForm');
     form.elements.role.value='食材';
     form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    });
    assert.equal(await page.locator('#boxEditMessage').textContent(),'保存しました');
    snapshots.push(await capture('#boxDetail'));
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('psg.box.instances.v1'))[0]);
    assert.equal(saved.level,61);assert.equal(saved.role,'食材');assert.equal(saved.favorite,true);
    assert.deepEqual(errors,[]);
    // Asset paths and generated version labels vary with the local project directory only.
    results.push(JSON.stringify(snapshots).replaceAll(root,'ROOT').replaceAll('v239','VERSION').replaceAll('v238','VERSION'));
    await page.close();
   }
   assert.equal(results[1],results[0],`UI differs at ${width}px`);
   console.log(`${width}px: recipes/categories/sorts/filter/details, team/reorder and box/favorite/level/edit-save equivalent`);
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e.message);process.exitCode=1});
