"""Read-only checkpoint: never repeat completed image intake or uploads."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parent
package = root / 'data-import/picasso-sleep-v277'
manifest = json.loads((package / 'manifest.json').read_text())
missing = []
for row in manifest['images']:
    path = root / row['path']
    if not path.exists():
        missing.append(row['path'])
    elif hashlib.sha256(path.read_bytes()).hexdigest() != row['sha256']:
        raise SystemExit(f'Image changed: {path}')
progress = json.loads((root / 'docs/SLEEP_IMAGE_PROGRESS.json').read_text())
print(json.dumps({'images': len(manifest['images']),
                  'matched': manifest['matchedCount'],
                  'pending': manifest['pendingCount'],
                  'missingLocalImages': len(missing),
                  'remoteCommitVerified': progress['remoteCommitVerified'],
                  'deploymentVerified': progress['deploymentVerified'],
                  'next': progress['next']}, ensure_ascii=False, indent=2))
if missing:
    raise SystemExit('Restore only missing local images through the existing build.')
