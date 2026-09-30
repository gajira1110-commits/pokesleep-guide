// Run: node tests/check_daily_calculator.cjs
// A zero-energy, uncapped 24-hour fixture has exactly 24 helps; no game rates are assumed.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const kernel=fs.readFileSync(path.join(__dirname,'../templates/21-day-calculator.html'),'utf8');const ctx={team:['one'],state:{box:[{id:'one',no:1,name:'test',level:30}]},window:{PS_CATALOG:{pokemon:{1:{ingredientSlots:[{unlock:1,candidates:[{name:'a',qty:2}]},{unlock:30,candidates:[{name:'b',qty:4}]}],berry:'berry',mainSkillId:'s',specialty:'食材'}},berries:{berry:30},skills:{s:{maxLevel:1,name:'s',effectType:'random_ingredients',levels:{1:{amount:6}}}}}},teamSpeedContext:()=>({members:new Map([['one',{speed:3600,carry:10000,food:50,berryQty:1,skill:100,energyFactor:1}]])})};vm.createContext(ctx);vm.runInContext(kernel,ctx);const known=vm.runInContext('dailyBaseline(team,state.box,window.PS_CATALOG,4,0,false,false)',ctx);assert.equal(known.foods.get('a'),12);assert.equal(known.foods.get('b'),24);assert.equal(known.members[0].berries,12);assert.equal(known.members[0].skillTriggers,5);const camp=vm.runInContext('dailyBaseline(team,state.box,window.PS_CATALOG,4,0,true,false)',ctx);assert(Math.abs(camp.foods.get('a')-14.4)<1e-8);const cap=vm.runInContext('expectedStoredSkills(10000,100,2)',ctx);assert.equal(cap,2);

ctx.teamSpeedContext=()=>({members:new Map([['one',{speed:3600,carry:1,food:0,berryQty:1,skill:100,energyFactor:1}]])});
const full=vm.runInContext('dailyBaseline(team,state.box,window.PS_CATALOG,4,0,false,false)',ctx);
assert.equal(full.members[0].berries,24);assert.equal(full.members[0].overflow,19);assert.equal(full.foods.get('a'),0);
ctx.state.box[0].ingredients={};ctx.window.PS_CATALOG.pokemon[1].ingredientSlots[1].candidates.push({name:'c',qty:6});
const missing=vm.runInContext('dailyBaseline(team,state.box,window.PS_CATALOG,4,0,false,false)',ctx);assert.equal(missing.members[0].missing,true);assert.equal(missing.foods.size,0);
console.log('Daily calculator: fixed production, camp, stock cap, overflow and missing selection passed.');
