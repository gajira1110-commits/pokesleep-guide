"""Import cooking reference tables without replacing recipe observations."""
import hashlib
import json
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def validate(data):
    levels = data['levels']['レベル表']
    pots = data['pot']['拡張表']
    assert len(levels) == 70 and [r['レベル'] for r in levels] == list(range(1, 71))
    for index, row in enumerate(levels):
        assert abs(row['倍率'] - (100 + row['レベルボーナスpct']) / 100) < 1e-9
        previous = levels[index - 1]['Lv1からの累計EXP'] if index else 0
        assert row['Lv1からの累計EXP'] - previous == row['当該Lv到達に必要な前LvからのEXP']
        assert row['次Lvまでの必要EXP'] == (levels[index + 1]['当該Lv到達に必要な前LvからのEXP'] if index < 69 else None)
    assert len(pots) == 23 and pots[0]['容量'] == 21 and pots[-1]['容量'] == 81
    cumulative = 0
    for row in pots:
        cumulative += row['拡張1回のゆめのかけら']
        assert cumulative == row['初期からの累計ゆめのかけら']
    assert data['pot']['補正']['スキルによる累積加算上限'] == 200


def main():
    source = Path(sys.argv[1])
    data = {'source': {'file': source.name, 'sha256': hashlib.sha256(source.read_bytes()).hexdigest()}}
    with zipfile.ZipFile(source) as archive:
        for key, filename in [('pot', 'PSG_pot_capacity_rules.json'), ('levels', 'PSG_recipe_level_1_70.json')]:
            matches = [name for name in archive.namelist() if name.endswith('/' + filename)]
            assert len(matches) == 1
            data[key] = json.loads(archive.read(matches[0]))
    validate(data)
    target = ROOT / 'master/cooking/data.json'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    print('Cooking: 23 pot stages and 70 levels validated; source statuses retained')


if __name__ == '__main__':
    main()
