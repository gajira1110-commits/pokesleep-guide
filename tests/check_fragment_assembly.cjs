// Run after PSG_build_master.py. Optional baseline: node tests/check_fragment_assembly.cjs ../psg-v238
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const scripts=html=>[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m=>!m[1].includes('application/json')).map(m=>m[2]);
const current=scripts(fs.readFileSync(path.join(root,'review.html'),'utf8'));
current.forEach((code,i)=>new vm.Script(code,{filename:`review-script-${i}`}));
if(process.argv[2]){
 const baseline=scripts(fs.readFileSync(path.resolve(process.argv[2],'review.html'),'utf8'));
 assert.deepEqual(current,baseline,'Assembled JavaScript changed during fragment-only refactor');
}
console.log(`${current.length} scripts parsed; optional baseline JavaScript equivalence passed.`);
