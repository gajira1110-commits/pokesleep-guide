"""Restore received trimmed images verbatim before catalog assembly."""
import hashlib
import json
from zipfile import ZipFile


def restore_trim_assets(root):
    folder = root / 'data-import/picasso-trim-v305'
    manifest = json.loads((folder / 'manifest.json').read_text())
    rows = {row['path']: row for row in manifest['images']}
    assert len(rows) == 381
    seen = set()
    for pack in manifest['archives']:
        path = folder / pack['path']
        assert hashlib.sha256(path.read_bytes()).hexdigest() == pack['sha256']
        with ZipFile(path) as archive:
            for member in archive.namelist():
                assert member in rows and member not in seen
                row = rows[member]
                data = archive.read(member)
                assert hashlib.sha256(data).hexdigest() == row['sha256']
                destination = root / member
                assert destination.is_file()
                assert hashlib.sha256(destination.read_bytes()).hexdigest() in (row['originalSha256'], row['sha256']), member
                if destination.read_bytes() != data:
                    destination.write_bytes(data)
                seen.add(member)
    assert seen == set(rows)
    print('Trimmed artwork: 381/381 received images restored unchanged')
