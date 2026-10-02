const assert=require('node:assert/strict'),path=require('node:path');
const {firefox}=require(process.env.PSG_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'}});try{
 for(const width of [320,390,768]){
  const page=await browser.newPage({viewport:{width,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+path.resolve(__dirname,'../review.html'));
  assert.equal(await page.locator('#teamDayConditions').count(),0);
  assert.equal(await page.locator('.psg-day-energy-heading small').count(),0);
  assert.equal(await page.locator('.psg-day-energy-heading').evaluate(el=>Math.abs(el.getBoundingClientRect().right-el.querySelector('input').getBoundingClientRect().right)<2),true);
  for(const no of [25,150,702]){
   await page.evaluate(no=>openDexCard(no),no);
   assert.equal(await page.locator('.psg-dex-costume').count(),1);
   assert.equal(await page.locator('.psg-dex-costume').isDisabled(),true);
   assert.equal(await page.locator('.psg-dex-costume').isVisible(),false);
   assert.equal(await page.locator('#detailSkill').evaluate(el=>getComputedStyle(el,'::before').content),'none');
   assert.equal(await page.locator('.psg-skill-summary').evaluate(el=>{const icon=el.querySelector('.skill-icon').getBoundingClientRect(),name=el.querySelector('.skill-name').getBoundingClientRect(),effect=el.querySelector('.skill-desc').getBoundingClientRect();return name.left>=icon.right&&effect.left>=icon.right&&effect.top>=name.bottom}),true);
   const toggle=page.locator('#skillDetailToggle');await toggle.click();assert.equal(await page.locator('#skillLevels').isVisible(),true);await toggle.click();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   if(width===390&&no===25){await page.screenshot({path:'/tmp/psg257-header.png'});await page.locator('.psg-skill-summary').evaluate(el=>scrollTo(0,scrollY+el.getBoundingClientRect().top-480));await page.screenshot({path:'/tmp/psg257-skill.png'})}
  }
  assert.deepEqual(errors,[]);console.log(width+'px: compact day settings, costume placeholder, icon/two-row skill, details toggle, no overflow');await page.close();
 }
}finally{await browser.close()}})().catch(e=>{console.error(e.stack);process.exitCode=1});
