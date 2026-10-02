"""Restore received sleep artwork byte-for-byte and bind confirmed identities."""
import hashlib
import json
import re
from zipfile import ZipFile


def restore_sleep_images(root, catalog, images):
    package = root / 'data-import/picasso-sleep-v281'
    manifest = json.loads((package / 'manifest.json').read_text())
    rows = manifest['images']
    assert len(rows) == manifest['imageCount'] == 907
    assert len({row['path'] for row in rows}) == len(rows)
    expected = {a['path']: a['sha256'] for a in manifest['archives']}
    assert len(expected) == len(manifest['archives'])
    species = {f'{int(no):04d}_default': {s[2] for s in styles}
               for no, styles in catalog['sleepStyles'].items()}
    for raw in catalog['forms']['species']:
        species[raw['speciesId']] = {s['id'] for s in catalog['forms']['sleepStyleGroups'][raw['sleepStyleGroupId']]['styles']}
    bindings = {}
    matched = 0
    for archive_name, digest in expected.items():
        assert re.fullmatch(r'pack-\d{3}\.zip', archive_name)
        archive_path = package / archive_name
        assert hashlib.sha256(archive_path.read_bytes()).hexdigest() == digest, archive_name
        pack_rows = [row for row in rows if row['archive'] == archive_name]
        with ZipFile(archive_path) as archive:
            assert set(archive.namelist()) == {row['member'] for row in pack_rows}
            for row in pack_rows:
                assert re.fullmatch(r'\d{4}\.webp', row['member'])
                assert row['path'] == f"assets/sleep/picasso-v281/{row['member']}"
                data = archive.read(row['member'])
                assert hashlib.sha256(data).hexdigest() == row['sha256'], row['member']
                assert data[:4] == b'RIFF' and data[8:12] == b'WEBP'
                destination = root / row['path']
                destination.parent.mkdir(parents=True, exist_ok=True)
                if destination.exists():
                    assert destination.read_bytes() == data, f'changed received image: {destination}'
                else:
                    destination.write_bytes(data)
                if row['status'] == 'pending':
                    assert row['sleepStyleId'] is None and row['speciesId'] is None
                    continue
                assert row['status'] == 'matched'
                sid, style_id = row['speciesId'], row['sleepStyleId']
                assert style_id in species[sid], (sid, style_id)
                bindings.setdefault(sid, {})
                assert style_id not in bindings[sid], (sid, style_id)
                bindings[sid][style_id] = row['path']
                if sid.endswith('_default') and int(sid.split('_')[0]) in map(int, catalog['pokemon']):
                    images['sleepStyles'][style_id] = row['path']
                matched += 1
    assert matched == manifest['matchedCount'] == 883
    assert len(rows) - matched == manifest['pendingCount'] == 24
    # Apply explicit user-confirmed corrections without altering received archives.
    resolutions = json.loads((package / 'resolutions.json').read_text())
    by_member = {row['member']: row for row in rows}
    resolved = set()
    for correction in resolutions['bindings']:
        row = by_member[correction['member']]
        assert row['status'] == 'pending'
        assert row['member'] not in resolved
        for sid in correction['speciesIds']:
            if sid.endswith('_default'):
                styles = [(item[2], item[0]) for item in catalog['sleepStyles'][str(int(sid.split('_')[0]))]]
            else:
                raw = next(item for item in catalog['forms']['species'] if item['speciesId'] == sid)
                styles = [(item['id'], item['name']) for item in catalog['forms']['sleepStyleGroups'][raw['sleepStyleGroupId']]['styles']]
            ids = [style_id for style_id, name in styles if name == correction['name']]
            assert len(ids) == 1, (sid, correction['name'], styles)
            style_id = ids[0]
            assert style_id in species[sid]
            assert style_id not in bindings.get(sid, {})
            bindings.setdefault(sid, {})[style_id] = row['path']
            if sid.endswith('_default'):
                images['sleepStyles'][style_id] = row['path']
        resolved.add(row['member'])
    images['sleepStylesBySpecies'] = bindings
    print(f'Sleep artwork: {matched + len(resolved)}/907 images connected; {24 - len(resolved)} retained pending; bytes unchanged')
