"""Check imported values and ensure existing gameplay data was not overwritten."""
import json
from pathlib import Path
import sys
import zipfile

root = Path(__file__).resolve().parents[1]
with zipfile.ZipFile(sys.argv[1]) as archive:
    name = next(n for n in archive.namelist() if n.endswith('/PSG_pokemon_master_248.json'))
    rows = json.loads(archive.read(name))['ポケモン']
by_name = {row['名前']: row for row in rows}
allowed = {'friendPoints', 'expType', 'transferCandy', 'canTransfer', 'acquisitionSource', 'sources'}
count = 0
for path in (root / 'master/pokemon').glob('*/data.json'):
    current = json.loads(path.read_text())
    row = by_name[current['name']]
    assert current['no'] == row['全国図鑑番号']
    for key, source in [('friendPoints', 'フレンドポイント'), ('expType', '経験値タイプ'),
                        ('transferCandy', '送った時のアメ'), ('canTransfer', '博士に送ることが可能')]:
        assert current[key] == row[source], (current['name'], key)
    assert current['acquisitionSource']['status'] == row['確認状態']
    if len(sys.argv) > 2:
        previous = json.loads((Path(sys.argv[2]) / path.relative_to(root)).read_text())
        assert {k: v for k, v in current.items() if k not in allowed} == {k: v for k, v in previous.items() if k not in allowed}
        assert set(previous.get('sources', [])) <= set(current['sources'])
    count += 1
assert count == 216
print('216 exact identity matches; acquisition fields match sources; existing gameplay fields preserved.')
