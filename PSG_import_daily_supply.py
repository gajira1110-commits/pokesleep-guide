"""Validate reference snapshots, keeping general estimates separate from Box."""
import hashlib
import json
import math
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def close(a, b):
    assert math.isclose(a, b, rel_tol=1e-8, abs_tol=1e-7), (a, b)


def main():
    baseline, sensitivity = map(Path, sys.argv[1:3])
    def open_source(path):
        archive = zipfile.ZipFile(path)
        prefix = archive.namelist()[0].split('/')[0] + '/'
        def read(name):
            return json.loads(archive.read(prefix + name))
        for entry in read('manifest.json')['files']:
            content = archive.read(prefix + entry['path'])
            assert len(content) == entry['bytes']
            assert hashlib.sha256(content).hexdigest() == entry['sha256']
        return read
    read = open_source(baseline)
    compare = open_source(sensitivity)
    conditions = read('PSG_daily_model_conditions.json')
    assert conditions['睡眠時間'] == 8.5 and conditions['料理げんき回復'] is False
    assert conditions['ポケモンLv'] == [30, 60]
    providers = {p['id']: p for p in read('PSG_provider_daily_supply.json')['候補']}
    assert len(providers) == 1874
    tiers = read('PSG_ingredient_daily_tiers_19.json')['評価']
    burdens = read('PSG_recipe_3meals_burden_78.json')['評価']
    pokemon = {p['名前']: p for p in read('inputs/PSG_pokemon_master_248.json')['ポケモン']}
    for candidate in providers.values():
        source = pokemon[candidate['ポケモン']]
        assert candidate['Lv'] in [30, 60]
        assert candidate['初期所持数'] == source['初期最大所持数']
        close(candidate['食材確率推定pct'], source['食材確率推定pct'])
        slots = candidate['解放枠']
        assert [s['枠Lv'] for s in slots] == ([1, 30] if candidate['Lv'] == 30 else [1, 30, 60])
        assert ''.join(s['候補'] for s in slots) == candidate['食材構成']
        for slot in slots:
            food = next(r for r in source['食材候補'] if r['候補'] == slot['候補'])
            assert food['食材'] == slot['食材'] and food[f"Lv{slot['枠Lv']}"] == slot['個数']
        assert set(candidate['日産期待量']) == {s['食材'] for s in slots}
        for food, amount in candidate['日産期待量'].items():
            assert amount >= 0 and math.isfinite(amount)
            assert amount <= candidate['所持数損失なし参考量'][food] + 1e-7
    foods = {json.loads(p.read_text())['id']: json.loads(p.read_text())['name'] for p in (ROOT/'master/ingredients').glob('*/data.json')}
    local_species = {json.loads(p.read_text())['name']: json.loads(p.read_text()) for p in (ROOT/'master/pokemon').glob('*/data.json')}
    for name, item in local_species.items():
        source = pokemon[name]
        for local_key, source_key in [('help','基準おてつだい時間秒'),('carry','初期最大所持数'),('foodRate','食材確率推定pct')]:
            close(item[local_key], source[source_key])
        for slot in item['ingredientSlots']:
            expected = {(r['食材'], r[f"Lv{slot['unlock']}"]) for r in source['食材候補'] if r[f"Lv{slot['unlock']}"] is not None}
            assert {(foods[r['ingredientId']], r['qty']) for r in slot['candidates']} == expected
    def validate_tiers(rows, candidates):
        assert len(rows) == 38
        assert len({(r['Lv'], r['食材']) for r in rows}) == 38
        for row in rows:
            best = row['最良担当の日産期待量']
            tier = next(label for label, threshold in [('S',60),('A',45),('B',30),('C',15),('D',0)] if best >= threshold)
            assert row['ティア'] == tier
            top = row['上位3系統']
            assert len({p['系統ID'] for p in top}) == len(top)
            close(top[0]['日産期待量'], best)
            for p in top:
                candidate = candidates[p['候補ID']]
                assert candidate['Lv'] == row['Lv'] and candidate['ポケモン'] == p['ポケモン']
                close(candidate['日産期待量'][row['食材']], p['日産期待量'])
    validate_tiers(tiers, providers)
    recipe_map = {(r['category'], r['name']): r for p in (ROOT/'master/recipes').glob('*/data.json') for r in [json.loads(p.read_text())]}
    assert len(burdens) == 156
    tier_index = {(r['Lv'], r['食材']): r for r in tiers}
    data = {'conditions': conditions, 'tiers': {'30': {}, '60': {}}, 'burdens': {'30': {}, '60': {}}}
    for row in tiers:
        level = str(row['Lv'])
        top = []
        for p in row['上位3系統']:
            candidate = providers[p['候補ID']]
            name = p['ポケモン']
            top.append({'id': p['候補ID'], 'family': p['系統ID'], 'name': name,
                        'no': local_species[name]['no'] if name in local_species else None,
                        'config': p['食材構成'], 'daily': p['日産期待量'],
                        'slots': [{'level': s['枠Lv'], 'name': s['食材'], 'qty': s['個数']} for s in candidate['解放枠']],
                        'source': candidate['出典']})
        data['tiers'][level][row['食材']] = {'tier': row['ティア'], 'daily': row['最良担当の日産期待量'], 'top': top}
    for row in burdens:
        recipe = recipe_map[(row['料理種'], row['料理名'])]
        level = str(row['担当ポケモンLv'])
        needs = {foods[i['ingredientId']]: i['qty'] * 3 for i in recipe['ingredients']}
        assert needs == {i['食材']: i['3食必要数'] for i in row['内訳']}
        assert row['1食必要鍋容量'] == sum(needs.values())/3
        assert row['3食総エナジー'] == recipe['energy']['max']['value']*3
        dedicated = sum(qty/tier_index[(int(level), food)]['最良担当の日産期待量'] for food, qty in needs.items())
        relaxed = row['最小編成負担_連続緩和_匹日']
        close(dedicated, row['食材別専任負担合計_匹日'])
        assert relaxed <= dedicated + 1e-7
        assert relaxed + 1e-7 >= max(qty/tier_index[(int(level), food)]['最良担当の日産期待量'] for food, qty in needs.items())
        allocation = row['連続緩和の候補配分']
        close(sum(p['匹日'] for p in allocation), relaxed)
        for food, qty in needs.items():
            supplied = sum(p['匹日'] * providers[p['候補ID']]['日産期待量'].get(food, 0) for p in allocation)
            assert supplied + 1e-6 >= qty
        data['burdens'][level][recipe['id']] = {'dedicated': dedicated, 'relaxed': relaxed, 'bottleneck': row['最も専任負担が大きい食材']}
    assert all(len(rows) == 19 for rows in data['tiers'].values())
    assert all(len(rows) == 78 for rows in data['burdens'].values())
    # Check the additional scenarios without silently replacing the v1 baseline.
    scenario_providers = {}
    for hours in [1,3,6]:
        for meals in [0,1]:
            prefix = f'scenarios/collect{hours}h_meals{meals}/'
            candidates = {p['id']: p for p in compare(prefix+'PSG_provider_daily_supply.json')['候補']}
            scenario_providers[(hours, meals)] = candidates
            scenario_tiers = compare(prefix+'PSG_ingredient_daily_tiers_19.json')['評価']
            validate_tiers(scenario_tiers, candidates)
            if (hours, meals) == (3,0):
                for row in scenario_tiers:
                    close(row['最良担当の日産期待量'], tier_index[(row['Lv'],row['食材'])]['最良担当の日産期待量'])
                for row in compare(prefix+'PSG_recipe_3meals_burden_78.json')['評価']:
                    recipe = recipe_map[(row['料理種'],row['料理名'])]
                    saved = data['burdens'][str(row['担当ポケモンLv'])][recipe['id']]
                    close(row['最小編成負担_連続緩和_匹日'],saved['relaxed'])
                    close(row['食材別専任負担合計_匹日'],saved['dedicated'])
    for meals in [0,1]:
        assert all(set(scenario_providers[(h,meals)]) == set(providers) for h in [1,3,6])
        for key in providers:
            for food in providers[key]['日産期待量']:
                amounts = [scenario_providers[(h,meals)][key]['日産期待量'][food] for h in [1,3,6]]
                assert amounts[0]+1e-7 >= amounts[1] and amounts[1]+1e-7 >= amounts[2]
    data['sensitivitySummary'] = compare('PSG_sensitivity_summary.json')
    data['sources'] = [{'file': p.name, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in [baseline,sensitivity]]
    (ROOT/'master/cooking/daily-supply.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    audit = {'version':243,'localSpeciesMatched':len(local_species),'providersValidated':len(providers),
             'ingredientEvaluations':38,'recipeEvaluations':156,'scenarioCountChecked':6,
             'baselineReproduction':'passed','monotonicCollection':'passed','recipeValuesChanged':0,'sources':data['sources']}
    (ROOT/'data-import/daily-supply-v243.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(audit,ensure_ascii=False))


if __name__ == '__main__':
    main()
