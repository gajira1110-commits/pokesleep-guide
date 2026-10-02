const assert=require('node:assert/strict'),path=require('node:path');
const {firefox}=require(process.env.PSG_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const b=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}});try{for(const width of [320,390,768]){
 const p=await b.newPage({viewport:{width,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('file://'+path.resolve(__dirname,'../review.html'));await p.evaluate(()=>PS.go('ingredientPage'));
 await p.locator('#ingredientSearch').fill('ワカクサ大豆');const row=p.locator('[data-ingredient="ワカクサ大豆"]');await row.locator('summary').first().click();await row.getByText('図鑑の担当候補（姿違いを含む）',{exact:true}).click();
 for(const id of ['0038_alola','0711_small','0151_default','0491_default'])assert.equal(await row.locator(`[data-species-id="${id}"]`).count(),1);
 assert.equal(await row.locator('[data-species-id="0037_alola"]').count(),0);assert.equal(await row.locator('[data-species-id="0710_small"]').count(),0);
 assert.equal(await row.locator('[data-species-id="0038_alola"] img').count(),0);assert.match(await row.locator('[data-species-id="0151_default"]').innerText(),/要枠解放/);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await row.locator('[data-species-id="0038_alola"]').click();assert.match(await p.locator('#dexDetail').innerText(),/キュウコン.*アローラ/s);
 await p.evaluate(()=>PS_OPEN_RECIPE('spicy_leek_curry'));const recipe=p.locator('[data-recipe-id="spicy_leek_curry"]');
 const toggle=recipe.locator('summary').filter({hasText:'拾うポケモン'});if(await toggle.count())await toggle.first().click();
 assert((await recipe.locator('[data-species-id="0151_default"]').count())>=1);
 await recipe.locator('[data-species-id="0151_default"]').first().click();assert.match(await p.locator('#dexDetail').innerText(),/ミュウ/);
 assert.deepEqual(errors,[]);console.log(width+'px: form providers, terminal evolution, exact dex identity, mythical unlock warning, no normal art reuse/overflow');await p.close();
}}finally{await b.close()}})().catch(e=>{console.error(e.stack);process.exitCode=1});
