"""Inventory gaps in local master records without guessing missing game data.

Run: python PSG_audit_master.py --as-of 2026-10-01
The report is limited to registered records and National Nos.001-151;
absence is not evidence that a species is unimplemented in Pokémon Sleep.
"""
import argparse
import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MASTER = ROOT / 'master'


def records(kind):
    return [json.loads(p.read_text()) for p in sorted((MASTER / kind).glob('*/data.json'))]


def audit(as_of):
    date.fromisoformat(as_of)
    pokemon, skills, recipes, fields = (records(kind) for kind in ('pokemon', 'skills', 'recipes', 'fields'))
    by_no = {p['no']: p for p in pokemon}
    sleep_ids = {s['id'] for p in pokemon for s in p.get('sleepStyles', [])}
    encounters = [e for f in fields for e in f.get('encounters', [])]
    linked = {e['sleepStyleId'] for e in encounters}
    core = ('help', 'carry', 'berryQty', 'foodRate', 'skillRate', 'ingredientSlots')
    missing_core = [{'no': p['no'], 'name': p['name'], 'fields': [k for k in core if k not in p]} for p in pokemon]
    missing_core = [p for p in missing_core if p['fields']]
    missing_fields = [{'no': p['no'], 'name': p['name'], 'sleepStyleIds': [s['id'] for s in p.get('sleepStyles', []) if s['id'] not in linked]} for p in pokemon]
    missing_fields = [p for p in missing_fields if p['sleepStyleIds']]
    missing_evolution = []
    for p in pokemon:
        edges = p.get('evolution') or []
        for edge in edges if isinstance(edges, list) else [edges]:
            if edge.get('toNo') not in by_no:
                missing_evolution.append({'no': p['no'], 'name': p['name'], 'target': edge.get('toNo')})
    levels = [{'id': s['id'], 'name': s['name'], 'levels': [n for n in range(1, s['maxLevel'] + 1) if str(n) not in s.get('levels', {})]} for s in skills]
    bounds = [{'id': r['id'], 'name': r['name'], 'missing': [k for k in ('min', 'max') if not r.get('energy', {}).get(k)]} for r in recipes]
    result = {'asOf': as_of, 'scope': 'Registered master records; unregistered national numbers 001-151 are not classified as unimplemented.',
              'counts': {'pokemon': len(pokemon), 'skills': len(skills), 'recipes': len(recipes), 'sleepStyles': len(sleep_ids), 'normalFieldEncounters': len(encounters)},
              'missingCoreFields': missing_core,
              'missingEvolutionTargets': missing_evolution,
              'missingSkillLevels': [x for x in levels if x['levels']],
              'skillsWithoutRegisteredSpecies': [{'id': s['id'], 'name': s['name']} for s in skills if not any(p.get('mainSkillId') == s['id'] for p in pokemon)],
              'pokemonWithoutAnyNormalEncounter': [{'no': p['no'], 'name': p['name']} for p in pokemon if not any(s['id'] in linked for s in p.get('sleepStyles', []))],
              'missingNormalEncounters': missing_fields,
              'recipeEnergyBoundsMissing': [x for x in bounds if x['missing']],
              'pokemonWithoutPerRecordSources': [{'no': p['no'], 'name': p['name']} for p in pokemon if not p.get('sources')],
              'unregisteredNationalNos001To151': [n for n in range(1, 152) if n not in by_no]}
    (MASTER / 'AUDIT.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    c = result['counts']
    lines = ['# マスターデータの不足確認', '', f'確認日：{as_of}。再生成：`python PSG_audit_master.py --as-of {as_of}`。', '',
             '登録済みデータの不足を機械集計しています。外部の全実装種・最新スキルを網羅する報告ではありません。未収録はSleep未実装を意味しません。', '',
             '| 項目 | 収録数 |', '| --- | ---: |']
    lines += [f'| {name} | {c[key]} |' for key, name in [('pokemon', 'ポケモン'), ('skills', 'メインスキル'), ('recipes', '料理'), ('sleepStyles', '寝顔'), ('normalFieldEncounters', '通常フィールドの出現記録')]]
    lines += ['', '## 先に埋める不足', '', '| 項目 | 残り | 扱い |', '| --- | ---: | --- |',
              f'| 基本能力の欠損 | {len(missing_core)}種 | 既存種はすべて揃う。確率の推定表示は継続 |',
              f'| 進化先の未収録 | {len(missing_evolution)}件 | 既存の進化参照に欠損なし |',
              f'| スキルレベルの欠損 | {len(result["missingSkillLevels"])}種 | 登録済みmaxLevel内の構造検査。最大レベルの外部再確認とは別 |',
              f'| 所持種が未収録のスキル | {len(result["skillsWithoutRegisteredSpecies"])}種 | 所持種を確認して追加 |',
              f'| 通常フィールド出現記録が一件もないポケモン | {len(result["pokemonWithoutAnyNormalEncounter"])}種 | ランク・必要ねむけパワーを照合 |',
              f'| 通常出現記録が不足する寝顔 | {sum(len(p["sleepStyleIds"]) for p in missing_fields)}件 | 登録なしは出現しない意味ではない |',
              f'| Lv.1／最大Lvのエナジーが不足する料理 | {len(result["recipeEnergyBoundsMissing"])}品 | 実機observedを保持。資料の不一致は保留 |',
              f'| 個別sources欄がないポケモン | {len(result["pokemonWithoutPerRecordSources"])}種 | 旧データの参照元はSOURCES.md。個別出典の追記待ち |', '',
              '## v211で追加した項目', '',
              '- マネネ・バリヤード・メタモン：基本能力・食材・メインスキルの接続。',
              '- 寝顔20種、通常フィールド出現46件。メタモンは12寝顔。資料のID-8は欠番のため埋めず、ID-9〜13を維持。',
              '- マネネ→バリヤード：Lv.12・アメ40個。コピー系の所持種をスキルへ明記。',
              '- 旧pendingNationalNosのうち登録済み10種を除去。', '',
              '## v212で追加した項目', '',
              'リオル・ルカリオ、寝顔8件、通常出現15件、はどうだんLv.1〜8を追加。ゆめのかけらとエナジーを分離して日産期待値へ反映。進化条件は睡眠150時間・日中・アメ80個。', '',
              '## 所持ポケモンが未収録の登録済みスキル', '']
    lines += [f'- {x["name"]}（`{x["id"]}`）' for x in result['skillsWithoutRegisteredSpecies']]
    lines += ['', '## 通常フィールド出現記録が一件もない種', '']
    lines += [f'- No.{x["no"]:03} {x["name"]}' for x in result['pokemonWithoutAnyNormalEncounter']]
    lines += ['', '## 料理のエナジー補完待ち', '', '| 料理 | 未確認の欄 |', '| --- | --- |']
    lines += [f'| {x["name"]} | {"・".join(x["missing"])} |' for x in result['recipeEnergyBoundsMissing']]
    lines += ['', '## No.001〜151の未収録番号', '', '実装有無はこの一覧では未判定。番号だけで自動追加しない。', '', ', '.join(f'{n:03}' for n in result['unregisteredNationalNos001To151']), '',
              '全件の対象ID・個別出典未記入の種・寝顔ごとの未接続IDは `AUDIT.json` を参照。EXフィールドは別の検証待ちで、通常フィールド値を流用しない。', '']
    (MASTER / 'AUDIT.md').write_text('\n'.join(lines))
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--as-of', required=True, help='YYYY-MM-DD in the project review timezone')
    report = audit(parser.parse_args().as_of)
    print(json.dumps(report['counts'], ensure_ascii=False))
