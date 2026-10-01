import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
rows=[json.loads(p.read_text()) for p in (root/'master/pokemon').glob('*/data.json')]
added=[p for p in rows if 'evolutionNotes' in p]
assert len(added)==103 and len(rows)==211
assert len({p['no'] for p in rows})==len(rows)
by_no={p['no']:p for p in rows}
assert by_no[157]['type']=='ほのお' and by_no[157]['specialty']=='きのみ'
assert by_no[248]['type']=='あく'
for p in added:
 assert p['sources'] and p['rateStatus']=='推定'
 assert [s['unlock'] for s in p['ingredientSlots']]==[1,30,60]
 assert p['sleepStyles'] and len({s['id'] for s in p['sleepStyles']})==len(p['sleepStyles'])
 for edge in p.get('evolution',[]):assert edge['toNo'] in by_no and edge['conditions']
assert len(json.loads((root/'data-import/pokemon-pending.json').read_text())['records'])==37
print('103 imports, 211 unique species, slots, sources, sleep IDs, evolution targets and 37 pending passed')
