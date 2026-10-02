"""Independent branch enumeration verifies model arithmetic, not game rules."""
import json
from fractions import Fraction as F
from itertools import product
from pathlib import Path
import reference_models as m
checks=[]
def check(name, ok):
    assert ok, name
    checks.append(name)

def enumerate_stock(start,q,r,n):
    paths=[(start,F(1),F(0))]
    for _ in range(n):
        new=[]
        for s,mass,paid in paths:
            if q[s]:new.append((0,mass*q[s],paid+r[s]))
            if q[s]<1:new.append((s+1,mass*(1-q[s]),paid))
        paths=new
    terminal={}
    paid=F(0)
    for s,mass,reward in paths:
        terminal[s]=terminal.get(s,F(0))+mass;paid+=mass*reward
    return paid,{s:p for s,p in terminal.items() if p}
for q in [[F(1,4)]*3+[F(1)],[F(0),F(1,3),F(2,3),F(1)]]:
    r=[F(1),F(4),F(9),F(16)]
    for start in [0,2,3]:
        for n in [0,1,4]:
            got=m.stockpile({start:1},q,r,n,forced_at_cap=True)
            paid,terminal=enumerate_stock(start,q,r,n)
            check(f'stock-enumeration-{len(checks)}',got['paid_energy']==paid and got['terminal_stored_distribution']==terminal)
# The day's zero payout can coexist with stored count carried forward.
z=m.stockpile({0:1},[0,0,1],[1,4,9],1,forced_at_cap=True)
check('stored-not-paid-at-day-end',z['paid_energy']==0 and z['terminal_stored_distribution']=={1:F(1)})
whole=m.stockpile({0:1},[F(1,4)]*3+[1],[1,4,9,16],6,forced_at_cap=True)
first=m.stockpile({0:1},[F(1,4)]*3+[1],[1,4,9,16],2,forced_at_cap=True)
second=m.stockpile(first['terminal_stored_distribution'],[F(1,4)]*3+[1],[1,4,9,16],4,forced_at_cap=True)
check('stock-day-split-carry',whole['paid_energy']==first['paid_energy']+second['paid_energy'] and whole['terminal_stored_distribution']==second['terminal_stored_distribution'])
# Independent exhaustive Bernoulli vectors: only first success is eligible.
bs=[F(10),F(20),F(7)];ps=[F(1,5),F(1,2),F(1,3)]
for initial in [True,False]:
    expected=F(0)
    for bits in product([False,True],repeat=3):
        mass=F(1);paid=F(0);eligible=initial
        for base,p,bit in zip(bs,ps,bits):
            mass*=p if bit else 1-p
            hit=eligible and bit;paid+=base*(3 if hit else 1)
            if hit:eligible=False
        expected+=mass*paid
    got=m.disguise(int(initial),list(zip(bs,ps)),great_multiplier=3)
    check(f'disguise-variable-reward-{initial}',got['paid_energy']==expected)
a=m.disguise(1,[(10,F(1,2))],great_multiplier=3)
b=m.disguise(a['terminal_eligible_probability'],[(10,F(1,2))],great_multiplier=3)
c=m.disguise(1,[(10,F(1,2))]*2,great_multiplier=3)
check('disguise-day-split-carry',a['paid_energy']+b['paid_energy']==c['paid_energy'])
random=m.disguise_random_count(1,{0:'1/2',2:'1/2'},base=10,p='1/2',great_multiplier=3)
fixed=m.disguise(1,[(10,'1/2')],great_multiplier=3)
check('mean-count-not-substitution',random['paid_energy']==F(35,2) and fixed['paid_energy']==20)
check('disguise-confirmed-reset',m.reset_for_event('disguise','sleep_research',False) is True)
for skill,state in [('stockpile',3),('disguise',False),('nuzzle',True)]:
    check('day-boundary-'+skill,m.reset_for_event(skill,'day_boundary',state)==state)
for skill,event,state in [('stockpile','sleep_start',3),('nuzzle','manual_sleep_entry',True),('disguise','self_removed',False)]:
    try:m.reset_for_event(skill,event,state)
    except m.UnknownRuleError:check('reject-unknown-'+skill,True)
    else:raise AssertionError('Unknown reset must not be inferred')
held={'box-a':True,'box-b':False}
g=m.nuzzle(held,{'box-a':'3/4','box-b':'1/4'},{'box-a':1,'box-b':1})
check('held-no-extra-grant',g['expected_new_grants']==F(1,4))
check('target-not-auto-renormalized',g['terminal_held_distribution']=={(True,False):F(3,4),(True,True):F(1,4)})
check('bonus-used-once',m.consume_bonus(True)=={'held':False,'used':1} and m.consume_bonus(False)['used']==0)
check('nuzzle-research-reset',m.reset_for_event('nuzzle','sleep_research',True) is False)
# Box identity persists independently of team slot ordering.
g2=m.nuzzle({'box-b':False,'box-a':True},{'box-b':'1/4','box-a':'3/4'},{'box-b':1,'box-a':1})
check('box-id-order-independent',g==g2)
n=m.nightmare({'box-a':7,'box-b':30},['box-b'],loss_each=12,floor=0)
check('nightmare-floor-and-dark-exempt',n['energy_after']=={'box-a':0,'box-b':30} and n['actual_genki_loss']['box-a']==7)
x=m.nightmare({'box-a':17},[],loss_each=12,floor=0)['energy_after']['box-a']
y=m.nightmare({'box-a':7},[],loss_each=12,floor=0)['energy_after']['box-a']+10
check('nightmare-event-order',x==5 and y==10)
for call in [lambda:m.disguise(None,[],great_multiplier=3),lambda:m.nightmare({'a':7},[],loss_each=None,floor=0),lambda:m.nuzzle({'a':False},{'a':1},{'a':None})]:
    try:call()
    except m.UnknownRuleError:check('reject-null-'+str(len(checks)),True)
    else:raise AssertionError('Unknown input accepted')
result={'status':'passed','checkCount':len(checks),'checks':checks,'meaning':'条件付き参照モデルの算術確認。ゲーム内仕様や確率の確定ではない。','syntheticInputsOnly':True}
Path(__file__).with_name('verification-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':'passed','checkCount':len(checks)},ensure_ascii=False))
