"""Check adoption against the received research, including unresolved differences."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'master/growth/data.json').read_text())
source = root / data['sourceFile']
assert hashlib.sha256(source.read_bytes()).hexdigest() == data['sourceSha256']
original = json.loads(source.read_text())
growth = original['growth']
assert data['rows'] == growth['rows']
assert data['sourceTableConflicts'] == growth['source_table_conflicts']
assert data['expTypeMultipliers'] == growth['exp_type_multipliers']
assert data['subskillUnlockLevels'] == growth['subskill_unlock_levels']
assert data['levelCap'] == growth['level_cap']
assert data['status'] == 'reference_estimate'
assert data['assumptions']['mintExpRule'] is None
assert data['assumptions']['researchRankLevelCap'] is None
assert data['assumptions']['candyMode'] == 'normal'
for key, value in data['sources'].items():
    assert value == original['sources'][key]
assert len(data['rows']) == 69 and len(data['sourceTableConflicts']) == 28
print('69 growth steps / 4 EXP types / 28 source differences preserved; source SHA256 matches.')
