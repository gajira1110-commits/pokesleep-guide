// Compare all daily outputs with a supplied pre-refactor calculation kernel.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
if(!process.argv[2])throw new Error('Supply the previous templates/21-day-calculator.html');
const before=fs.readFileSync(process.argv[2],'utf8'),after=require('./daily_kernel.cjs');
const effects={
 fixed_energy:{energy:400},variable_energy:{min:200,max:800},random_ingredients:{amount:6},
 team_energy_recovery:{recovery:5},self_energy_recovery:{recovery:12},ally_energy_recovery:{recovery:14},
 extra_help:{helps:5},helper_boost_fire:{helps:2,bonusByUniqueFire:[0,0,1,3,4,6]},
 helper_boost_water:{helps:2,bonusByUniqueWater:[0,0,1,3,4,6]},
 helper_boost_electric:{helps:2,bonusByUniqueElectric:[0,0,1,3,4,6]},
 fixed_dream_shards_energy:{energy:100,shards:200},variable_dream_shards:{min:100,max:400},
 unknown:{}
};
function calculate(kernel,config){
 const {effectType,effect,size,interval,energy,camp,meals,carry,missing,pending}=config;
 const box=Array.from({length:size},(_,i)=>({id:'id-'+i,no:i+1,name:'fixture-'+i,level:30,skillLevel:1,ingredients:missing?{}:{30:'b'}}));
 const species={ingredientSlots:[{unlock:1,candidates:[{name:'a',qty:2}]},{unlock:30,candidates:[{name:'b',qty:4},{name:'c',qty:3}]}],berry:'berry',mainSkillId:'s',specialty:'スキル',type:effectType==='helper_boost_water'?'みず':effectType==='helper_boost_electric'?'でんき':'ほのお',...(pending?{dailyCalculationStatus:'pending_special_skill'}:{})};
 const ctx={team:box.map(p=>p.id),state:{box},window:{PS_CATALOG:{pokemon:Object.fromEntries(box.map(p=>[p.no,species])),berries:{berry:30},skills:{s:{maxLevel:1,name:'fixture',effectType,levels:{1:effect}}}}},teamSpeedContext:()=>({members:new Map(box.map((p,i)=>[p.id,{speed:3600+i*100,carry,food:50,berryQty:2,skill:10+i,energyFactor:i?1.2:1}]))})};
 vm.createContext(ctx);vm.runInContext(kernel,ctx);ctx.config=config;
 const result=vm.runInContext('dailyBaseline(team,state.box,window.PS_CATALOG,config.interval,config.energy,config.camp,config.meals,["berry"],80)',ctx);
 return JSON.parse(JSON.stringify(result,(_,value)=>Object.prototype.toString.call(value)==='[object Map]'?[...value]:Object.prototype.toString.call(value)==='[object Set]'?[...value]:value));
}
let count=0;
for(const [effectType,effect] of Object.entries(effects))for(const size of [1,2])for(const interval of [1,2,4,8])for(const energy of [0,80,100,150])for(const camp of [false,true])for(const meals of [false,true]){
 const config={effectType,effect,size,interval,energy,camp,meals,carry:interval===1?10000:15};
 assert.deepEqual(calculate(after,config),calculate(before,config),JSON.stringify(config));count++;
}
for(const flag of ['missing','pending']){
 const config={effectType:'random_ingredients',effect:{amount:6},size:2,interval:4,energy:100,camp:false,meals:true,carry:15,[flag]:true};
 assert.deepEqual(calculate(after,config),calculate(before,config));count++;
}
console.log(`${count} before/after daily scenarios identical, including recovery, support, sleep, overflow, missing and pending.`);
