"""Verify all received identities without treating forms as duplicate species."""
import hashlib
import json
from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
forms = json.loads((root / 'master/forms/data.json').read_text())
normal = [json.loads(p.read_text()) for p in (root / 'master/pokemon').glob('*/data.json')]
records = normal + forms['species']
keys = [p.get('speciesId', f"{p['no']:04}_default") for p in records]
assert len(records) == len(set(keys)) == 248
assert len(normal) == 216 and len(forms['species']) == 32
assert all(p['boxEligible'] for p in forms['species'])
assert len([p for p in forms['species'] if p.get('dailyCalculationStatus')]) == 14
assert len([p for p in forms['species'] if p.get('mythicalSettings')]) == 2
for p in forms['species']:
    assert p['help'] > 0 and p['carry'] > 0
    assert p['ingredientSlots'] and p['source']
    if p.get('mythicalSettings'):
        assert [s['activeAtLevel'] for s in p['mythicalSettings']['subskillSlots']] == [10, 25, 50, 70, 80]
assert [p['no'] for p in forms['species'] if p.get('specialTeamPair')] == [380, 381]
if len(sys.argv) > 1:
    source_path = Path(sys.argv[1])
    rows = json.loads(source_path.read_text())['ポケモン']
    by_name = {p['名前']: p for p in rows}
    assert len(rows) == len(by_name) == 248
    assert {p['name'] for p in records} == set(by_name)
    for p in records:
        source = by_name[p['name']]
        for key, field in [('no', '全国図鑑番号'), ('help', '基準おてつだい時間秒'), ('carry', '初期最大所持数'), ('foodRate', '食材確率推定pct'), ('friendPoints', 'フレンドポイント'), ('expType', '経験値タイプ')]:
            assert p[key] == source[field], (p['name'], key)
    record = json.loads((root / 'data-import/pokemon-registration-v268.json').read_text())
    assert record['sourceMasterSha256'] == hashlib.sha256(source_path.read_bytes()).hexdigest()
print('248 received identities matched: 216 normal + 32 separate, all registered; 14 daily-pending, 2 individual unlock schemas.')
