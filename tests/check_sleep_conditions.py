import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
fields=[json.loads(p.read_text()) for p in (root/'master/fields').glob('*/data.json')]
assert len(fields)==9
assert sum(len(f['encounters']) for f in fields)==1184
for field in fields:
 assert len(field['rankThresholds'])==35
 assert len({e['sleepStyleId'] for e in field['encounters']})==len(field['encounters'])
 for e in field['encounters']:
  rank=next(r for r in field['rankThresholds'] if r['tier']==e['rank']['tier'] and r['level']==e['rank']['level'])
  assert rank['energy']==e['unlockEnergy']
assert sum(e['drowsyPower'] is not None for f in fields for e in f['encounters'])==546
assert len(json.loads((root/'data-import/sleep-conditions-pending.json').read_text())['records'])==1533
print('9 fields, 1184 links, exact rank energy, unique IDs, existing DPR preserved, 1533 pending passed')
