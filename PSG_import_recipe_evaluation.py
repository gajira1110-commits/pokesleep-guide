"""Match Enigma's evaluation inputs to existing recipes; retain observations."""
import hashlib
import json
import sys
import zipfile
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def main():
    source = Path(sys.argv[1])
    with zipfile.ZipFile(source) as archive:
        def read(filename):
            matches = [n for n in archive.namelist() if n.endswith('/' + filename)]
            assert len(matches) == 1
            return json.loads(archive.read(matches[0]))
        ingredients = read('PSG_ingredient_base_energy_19.json')
        report = read('PSG_recipe_efficiency_Lv70_78.json')
    foods = {r['食材']: r for r in ingredients['食材']}
    assert len(foods) == 19
    local_foods = {}
    updates = []
    for path in (ROOT / 'master/ingredients').glob('*/data.json'):
        item = json.loads(path.read_text())
        row = foods[item['name']]
        local_foods[item['id']] = row
        item.update(baseEnergy=row['基本エナジー'], baseEnergyStatus=row['状態'],
                    baseEnergySource=row['出典'], baseEnergyCheckedAt=ingredients['確認日'])
        assert isinstance(item['baseEnergy'], int) and item['baseEnergy'] > 0
        updates.append((path, item))
    assert len(updates) == 19
    source_recipes = {(r['料理種'], r['料理名']): r for r in report['レシピ']}
    matched = []
    rounding = {}
    comparisons = []
    for path in (ROOT / 'master/recipes').glob('*/data.json'):
        recipe = json.loads(path.read_text())
        row = source_recipes[(recipe['category'], recipe['name'])]
        quantities = {local_foods[i['ingredientId']]['食材']: i['qty'] for i in recipe['ingredients']}
        assert quantities == {i['食材']: i['個数'] for i in row['必要食材']}
        count = sum(quantities.values())
        base = sum(qty * foods[name]['基本エナジー'] for name, qty in quantities.items())
        energy = recipe['energy']['max']['value']
        assert count == row['必要食材数'] and base == row['必要食材基本エナジー合計']
        assert energy == row['Lv70総エナジー']
        assert abs(energy/count - row['食材1個あたりエナジー']) <= .00501
        assert abs(energy/base - row['エナジー増幅率']) <= .0000501
        comparisons.append((recipe, row, [Fraction(energy), Fraction(energy, count), Fraction(energy, base)]))
        rounding[recipe['id']] = {'reference': row['Lv70四捨五入式参考値'], 'difference': row['端数処理差_参考値マイナス掲載値']}
        matched.append(recipe['id'])
    assert len(matched) == len(source_recipes) == 78
    for recipe, row, values in comparisons:
        for index, metric in enumerate(['総エナジー', '食材効率', '増幅率']):
            rank = 1 + sum(other_values[index] > values[index] for other, _, other_values in comparisons if other['category'] == recipe['category'])
            assert rank == row[f'料理種内_{metric}順位']
    metadata = {'checkedAt': report['計算日'], 'status': '推定', 'conditions': report['比較条件'],
                'definitions': report['指標定義'], 'notes': report['注記'], 'sources': report['出典'],
                'rounding': rounding, 'source': {'file': source.name, 'sha256': hashlib.sha256(source.read_bytes()).hexdigest()}}
    updates.append((ROOT / 'master/cooking/evaluation.json', metadata))
    for path, item in updates:
        path.write_text(json.dumps(item, ensure_ascii=False, indent=2) + '\n')
    audit = {'version': 242, 'recipesMatched': len(matched), 'ingredientInputs': 19,
             'categoryRanksVerified': 234, 'roundingDifferences': sum(r['difference'] != 0 for r in rounding.values()),
             'recipeValuesChanged': 0, 'source': metadata['source']}
    (ROOT / 'data-import/evaluation-v242.json').write_text(json.dumps(audit, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(audit, ensure_ascii=False))


if __name__ == '__main__':
    main()
