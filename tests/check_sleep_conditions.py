import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
fields=[json.loads(p.read_text()) for p in (root/'master/fields').glob('*/data.json')]
assert len(fields)==9
assert sum(len(f['encounters']) for f in fields)==2461
for field in fields:
 assert len(field['rankThresholds'])==35
 assert len({e['sleepStyleId'] for e in field['encounters']})==len(field['encounters'])
 for e in field['encounters']:
  rank=next(r for r in field['rankThresholds'] if r['tier']==e['rank']['tier'] and r['level']==e['rank']['level'])
  assert rank['energy']==e['unlockEnergy']
assert sum(e['drowsyPower'] is not None for f in fields for e in f['encounters'])==2461
assert len(json.loads((root/'data-import/sleep-conditions-pending.json').read_text())['records'])==256
print('9 fields, 2461 links, exact rank energy, unique IDs, supplied DPR recorded, 256 pending passed')

by_id={f['id']:f for f in fields}
def power(field):return next(e['drowsyPower'] for e in by_id[field]['encounters'] if e['sleepStyleId']=='0001_01')
assert power('greengrass')==418000
assert power('greengrass_ex')==4180000
print('Normal and EX retain distinct DPR values passed')
