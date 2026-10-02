"""Exact conditional reference models; no game probabilities or default reset rules.
Inputs describe explicit scenarios. Output energy is in caller-supplied units.
These functions do not forecast the actual number of gameplay activations.
"""
from fractions import Fraction as F

class UnknownRuleError(ValueError):
    pass

def number(x):
    if x is None or isinstance(x, bool):
        raise UnknownRuleError('Explicit numeric scenario input required; unknown is not zero')
    return F(str(x))

def probability(x):
    p = number(x)
    if not 0 <= p <= 1:
        raise ValueError('Probability outside [0, 1]')
    return p

def distribution(values):
    d = {k: probability(v) for k, v in values.items()}
    if sum(d.values()) != 1:
        raise ValueError('Distribution must sum exactly to 1')
    return d

def count(n):
    if isinstance(n, bool) or not isinstance(n, int) or n < 0:
        raise ValueError('Nonnegative integer activation count required')
    return n

def stockpile(initial, spit_probabilities, rewards, activations, *, forced_at_cap):
    """Finite fixed-count horizon. Final stock is not paid out at the horizon.
    Cap forcing is an explicit model assumption, never silently selected.
    """
    count(activations)
    if not isinstance(forced_at_cap, bool):
        raise UnknownRuleError('Cap behavior must be explicit')
    k = len(rewards) - 1
    if k < 1 or len(spit_probabilities) != k + 1:
        raise ValueError('Supply reward/probability for each state 0..K')
    d = distribution(initial)
    if any(isinstance(s, bool) or not isinstance(s, int) or not 0 <= s <= k for s in d):
        raise ValueError('Invalid stored count')
    q = [probability(p) for p in spit_probabilities]
    if forced_at_cap:
        q[k] = F(1)
    elif q[k] != 1:
        raise UnknownRuleError('Non-forced cap requires a separate stay/overflow rule')
    r = [number(v) for v in rewards]
    reward = F(0)
    for _ in range(activations):
        nxt = {}
        for s, mass in d.items():
            nxt[0] = nxt.get(0, F(0)) + mass * q[s]
            reward += mass * q[s] * r[s]
            if s < k:
                nxt[s+1] = nxt.get(s+1, F(0)) + mass * (1-q[s])
        d = {s: p for s, p in nxt.items() if p}
    return {'paid_energy': reward, 'terminal_stored_distribution': d}

def disguise(initial_eligible_probability, activations, *, great_multiplier):
    """activations=[(normal_energy, conditional_success_probability), ...].
    Success removes eligibility until caller explicitly starts a reset cycle.
    Varying team energy is evaluated at each event, not by a constant-B shortcut.
    """
    eligible = probability(initial_eligible_probability)
    multiplier = number(great_multiplier)
    if multiplier < 1:
        raise ValueError('Great multiplier must be >= 1')
    total = successes = F(0)
    for base, p in activations:
        base, p = number(base), probability(p)
        hit = eligible * p
        total += base * (1 + (multiplier - 1)*hit)
        successes += hit
        eligible -= hit
    return {'paid_energy': total, 'expected_successes': successes, 'terminal_eligible_probability': eligible}

def disguise_random_count(initial_eligible_probability, count_distribution, *, base, p, great_multiplier):
    """Explicit count distribution independent of branch outcomes under this scenario."""
    ns = distribution(count_distribution)
    total = successes = eligible = F(0)
    for n, mass in ns.items():
        count(n)
        result = disguise(initial_eligible_probability, [(base,p)]*n, great_multiplier=great_multiplier)
        total += mass*result['paid_energy']
        successes += mass*result['expected_successes']
        eligible += mass*result['terminal_eligible_probability']
    return {'paid_energy':total, 'expected_successes':successes, 'terminal_eligible_probability':eligible}

def nuzzle(initial_held, target_weights, grant_probabilities):
    """One attempted grant. Weights are explicit post-rule target weights supplied
    by caller; this function does NOT decide if held targets are excluded.
    Does not model healing, ordinary stocks, simultaneous activation order.
    """
    if any(type(v) is not bool for v in initial_held.values()):
        raise UnknownRuleError('Known held state per Box individual required')
    weights = distribution(target_weights)
    if set(initial_held) != set(weights) or set(weights) != set(grant_probabilities):
        raise ValueError('Box ID sets must match')
    state_ids = sorted(weights)
    out = {}
    added = F(0)
    for i, w in weights.items():
        p = probability(grant_probabilities[i])
        grant = F(0) if initial_held[i] else w*p
        added += grant
        old = tuple(initial_held[k] for k in state_ids)
        changed = tuple(True if k == i else initial_held[k] for k in state_ids)
        out[old] = out.get(old,F(0)) + w-grant
        out[changed] = out.get(changed,F(0)) + grant
    return {'expected_new_grants':added,'box_ids':state_ids,'terminal_held_distribution':{s:p for s,p in out.items() if p}}

def consume_bonus(held):
    """Caller explicitly schedules consumption; ordinary stock order is not inferred."""
    if type(held) is not bool:
        raise UnknownRuleError('Explicit known states required')
    if not held:
        return {'held':False,'used':0}
    return {'held':False,'used':1}

def reset_for_event(skill, event, state, *, unknown_reset=None):
    """Only a narrow evidence-backed event contract, plus explicit scenario choices.
    day_boundary is a reporting split, not an inferred reset.
    """
    if event == 'day_boundary':
        return state
    confirmed = {
        ('stockpile','self_removed'):0,
        ('disguise','sleep_research'):True,
        ('disguise','manual_sleep_entry'):True,
        ('nuzzle','sleep_research'):False,
        ('nuzzle','field_move'):False,
    }
    if (skill,event) in confirmed:
        return confirmed[(skill,event)]
    if type(unknown_reset) is not bool:
        raise UnknownRuleError(f'Unconfirmed reset event: {skill}/{event}')
    if not unknown_reset:
        return state
    if skill == 'stockpile': return 0
    if skill == 'disguise': return True
    if skill == 'nuzzle': return False
    raise ValueError('Unknown skill')

def nightmare(energies, dark_box_ids, *, loss_each, floor):
    """Explicit loss/floor scenario. Never subtract genki from Snorlax energy."""
    loss, floor = number(loss_each), number(floor)
    if loss < 0 or floor < 0: raise ValueError('Negative input')
    if not set(dark_box_ids) <= set(energies): raise ValueError('Unknown Box ID')
    before = {i:number(e) for i,e in energies.items()}
    if any(e<floor for e in before.values()): raise ValueError('Energy below scenario floor')
    after = {i:e if i in dark_box_ids else max(floor,e-loss) for i,e in before.items()}
    return {'energy_after':after,'actual_genki_loss':{i:before[i]-after[i] for i in before}}
