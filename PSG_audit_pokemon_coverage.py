"""Audit all received Pokemon identities without filling unknown values."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent

def audit():
    normal = [json.loads(p.read_text()) for p in sorted((ROOT/'master/pokemon').glob('*/data.json'))]
    forms = json.loads((ROOT/'master/forms/data.json').read_text())['species']
    skills = {p.parent.name for p in (ROOT/'master/skills').glob('*/data.json')}
    ingredients = {p.parent.name for p in (ROOT/'master/ingredients').glob('*/data.json')}
    rows = []
    ids = set()
    errors = []
    for p, separate in [(p, False) for p in normal] + [(p, True) for p in forms]:
        sid = p.get('speciesId') or f"{p['no']:04d}_default"
        if sid in ids: errors.append(f'duplicate identity: {sid}')
        ids.add(sid)
        if p.get('mainSkillId') not in skills: errors.append(f'unknown skill: {sid}')
        slots = p.get('ingredientSlots', [])
        for slot in slots:
            for c in slot.get('candidates', []):
                if c.get('ingredientId') not in ingredients: errors.append(f'unknown ingredient: {sid}/{c}')
                if not isinstance(c.get('qty'), (int, float)) or c['qty'] <= 0: errors.append(f'invalid quantity: {sid}/{c}')
        rows.append({'speciesId': sid, 'name': p['name'], 'separateRecord': separate,
                     'boxRegistration': p.get('boxEligible', True),
                     'missingBaseFields': [k for k in ['help','carry','berryQty','foodRate','friendPoints','expType'] if p.get(k) is None],
                     'skillRateUnknown': p.get('skillRate') is None,
                     'ingredientSlots': len(slots), 'sleepStyles': len(p.get('sleepStyles', [])),
                     'encounterRowsStatus': 'pending_separate_form_source' if separate else 'audited_by_PSG_audit_master',
                     'dailyCalculationStatus': p.get('dailyCalculationStatus', 'existing_calculator'),
                     'rateStatus': p.get('rateStatus'),
                     'note': 'Coverage confirms app records and references, not independent in-game verification.'})
    for p in forms:
        for e in p.get('evolutionTransitions', []):
            target = e.get('toSpeciesId') or e.get('targetSpeciesId')
            if target and target not in ids: errors.append(f'unknown evolution target: {p["speciesId"]}/{target}')
    if errors: raise ValueError('\n'.join(errors))
    return {'scope':'received_records_only_not_all_external_game_species', 'records':len(rows),
            'normalRecords':len(normal),'separateRecords':len(forms),
            'boxEligible':sum(r['boxRegistration'] for r in rows),
            'missingBaseFields':sum(bool(r['missingBaseFields']) for r in rows),
            'unknownSkillRates':sum(r['skillRateUnknown'] for r in rows),
            'pendingSeparateEncounterRecords':len(forms), 'rows':rows}

if __name__ == '__main__':
    import argparse
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path);args=parser.parse_args()
    result=audit()
    if args.output: args.output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in result.items() if k!='rows'},ensure_ascii=False))
