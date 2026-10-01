"""Fill acquisition fields for existing species from the supplied Enigma ZIP.

Usage: python PSG_import_acquisition.py /path/to/PSG_data_completion_20261001.zip
Only exact name + National Dex number matches are accepted. Core abilities,
forms, evolution, recipes and sleep data are never changed by this import.
"""
import hashlib
import json
from pathlib import Path
import sys
import zipfile

ROOT = Path(__file__).resolve().parent
FIELDS = {'friendPoints': 'フレンドポイント', 'expType': '経験値タイプ',
          'transferCandy': '送った時のアメ', 'canTransfer': '博士に送ることが可能'}


def import_zip(path):
    with zipfile.ZipFile(path) as archive:
        names = [n for n in archive.namelist() if n.endswith('/PSG_pokemon_master_248.json')]
        assert len(names) == 1, 'Expected exactly one species reference master'
        source = json.loads(archive.read(names[0]))
    by_name = {}
    for row in source['ポケモン']:
        assert row['名前'] not in by_name, f'Duplicate source name: {row["名前"]}'
        by_name[row['名前']] = row
    changes = []
    filled = {key: 0 for key in FIELDS}
    for file in sorted((ROOT / 'master/pokemon').glob('*/data.json')):
        pokemon = json.loads(file.read_text())
        row = by_name.get(pokemon['name'])
        assert row and row['全国図鑑番号'] == pokemon['no'], f'Identity mismatch: {pokemon["name"]}'
        for key, source_key in FIELDS.items():
            value = row.get(source_key)
            if value is not None:
                if key == 'canTransfer':
                    assert isinstance(value, bool)
                else:
                    assert isinstance(value, int) and not isinstance(value, bool) and value > 0
            old = pokemon.get(key)
            assert old is None or value is None or old == value, f'Conflict: {pokemon["name"]} {key}'
            if old is None:
                pokemon[key] = value  # Unknown stays null; never turn it into zero.
                filled[key] += int(value is not None)
        pokemon['acquisitionSource'] = {
            'file': 'PSG_pokemon_master_248.json', 'recordId': row['id'],
            'url': row['出典'], 'checkedAt': row['確認日'],
            'status': row['確認状態'], 'transferCandyStatus': row.get('送った時のアメ状態', '未確定')
        }
        sources = pokemon.setdefault('sources', [])
        if row['出典'] not in sources:
            sources.append(row['出典'])
        changes.append((file, pokemon))
    # Validate every record before any mutation, so a mismatch cannot cause a partial import.
    for file, pokemon in changes:
        file.write_text(json.dumps(pokemon, ensure_ascii=False, indent=2) + '\n')
    report = {'sourceArchive': Path(path).name, 'sha256': hashlib.sha256(Path(path).read_bytes()).hexdigest(),
              'checkedAt': source['調査日'], 'matchedSpecies': len(changes), 'filled': filled,
              'policy': 'Existing species only; exact name+number match; conflicts stop; unknown stays null.'}
    target = ROOT / 'data-import/acquisition-v240.json'
    target.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report, ensure_ascii=False))


if __name__ == '__main__':
    import_zip(sys.argv[1])
