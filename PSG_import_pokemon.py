"""Import normal species with supported skills from the supplied research ZIP."""
from pathlib import Path
import json,zipfile,sys,re,html
ROOT=Path(__file__).resolve().parent
def run(archive):
 with zipfile.ZipFile(archive) as z:
  files={n.split('/')[-1]:n for n in z.namelist()}
  data=json.loads(z.read(files['PSG_pokemon_master_140.json']))
  sleeps=json.loads(z.read(files['PSG_sleep_style_energy_master_20261001.json']))['寝顔一覧']
 skills={json.loads(p.read_text())['name']:p.parent.name for p in (ROOT/'master/skills').glob('*/data.json')}
 skills.update({'エナジーチャージS(固定)':'energy_charge_s_fixed','エナジーチャージS(ランダム)':'energy_charge_s_variable','ゆめのかけらゲットS(ランダム)':'dream_shard_magnet_s_variable','ゆめのかけらゲットS(固定)':'dream_shard_magnet_s'})
 ingredients={json.loads(p.read_text())['name']:p.parent.name for p in (ROOT/'master/ingredients').glob('*/data.json')}
 added_count=0
 existing={json.loads(p.read_text())['name']:json.loads(p.read_text())['no'] for p in (ROOT/'master/pokemon').glob('*/data.json')}
 eligible=[r for r in data['ポケモン'] if '(' not in r['名前'] and '（' not in r['名前'] and r['メインスキル'] in skills]
 names={**existing,**{r['名前']:r['全国図鑑番号'] for r in eligible}};pending=[]
 for r in data['ポケモン']:
  if r not in eligible:pending.append(r);continue
  no=r['全国図鑑番号'];name=r['名前'];path=ROOT/'master/pokemon'/f'{no:04d}'/'data.json'
  if path.exists():continue
  obj=dict(no=no,name=name,type=r['タイプ'],sleepType=r['睡眠タイプ'],specialty=r['得意'],berry=r['きのみ'],berryQty=r['きのみ個数'],help=r['基準おてつだい時間秒'],carry=r['初期最大所持数'],foodRate=r['食材確率推定pct'],skillRate=r['スキル発動率推定pct'],rateStatus='推定',mainSkillId=skills[r['メインスキル']],dexVisible=True,ingredientSlotStatus='verified',ingredientSlots=[],sleepStyles=[],sources=[r['出典'],r['確率出典']],verifiedAt=r['確認日'],dataStatus=r['確認状態'],friendPoints=r['フレンドポイント'],expType=r['経験値タイプ'],evolutionNotes=r['進化条件記載'])
  for level in [1,30,60]:
   candidates=[dict(ingredientId=ingredients[c['食材']],qty=c[f'Lv{level}']) for c in r['食材候補'] if c[f'Lv{level}'] is not None]
   assert candidates
   obj['ingredientSlots'].append(dict(unlock=level,candidates=candidates))
  seen=set()
  for s in sleeps:
   if s['ポケモン']!=name:continue
   key=(s['寝顔'],s['星'])
   if key in seen:continue
   seen.add(key);obj['sleepStyles'].append(dict(id=f"{no:04d}_{int(s['寝顔ID']):02d}",name=s['寝顔'],stars=s['星']))
  lines=r['進化条件記載'];edges=[]
  for i,line in enumerate(lines[:-2]):
   if line!=name or not lines[i+1].startswith('↓'):continue
   target=lines[i+2]
   if target not in names:obj['evolutionStatus']='未確認';continue
   condition=lines[i+1].lstrip('↓　 ').strip();edge=dict(toNo=names[target],to=target,conditions=[html.escape(condition)])
   level=re.search(r'Lv\.?\s*(\d+)',condition);candy=re.search(r'アメ[×x]\s*(\d+)',condition)
   if level:edge['level']=int(level[1])
   if candy:edge['candy']=int(candy[1])
   edges.append(edge)
  if edges:obj['evolution']=edges
  added_count+=1
  path.parent.mkdir();path.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
 folder=ROOT/'data-import';(folder/'pokemon-pending.json').write_text(json.dumps(dict(verifiedAt=data['調査日'],records=pending),ensure_ascii=False,separators=(',',':'))+'\n')
 print(f'Added {added_count} normal species; pending {len(pending)} special skill/forms')
if __name__=='__main__':run(sys.argv[1])
