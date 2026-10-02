import importlib.util,json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('build',root/'PSG_build_master.py')
import sys
sys.path.insert(0,str(root));build=importlib.util.module_from_spec(spec);spec.loader.exec_module(build)
_,images=build.catalog_and_images()
adopted=json.loads((root/'data-import/face-artwork.json').read_text())['adopted']
assert len(adopted)==211
for row in adopted:
 key=str(row['no'])
 assert images['pokemonFaces'][key]==row['path']
 assert images['pokemon'][key]==row['path']
folder=root/'master/pokemon/0001';full=folder/'full.webp';assert not full.exists()
try:
 full.write_bytes((folder/'face.webp').read_bytes())
 _,images=build.catalog_and_images()
 assert images['pokemon']['1']=='master/pokemon/0001/full.webp'
 assert images['pokemonFaces']['1']=='master/pokemon/0001/face.webp'
finally:full.unlink()
print('211 mapped portraits shared; adding full art replaces only detail image.')
