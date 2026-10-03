"""Restore and bind the verified Picasso portraits and full-body artwork."""
import hashlib
import json
from pathlib import PurePosixPath
from zipfile import ZipFile


def restore_standard_art(root, catalog, images):
    folder = root / 'data-import/picasso-standard-v340'
    manifest = json.loads((folder / 'manifest.json').read_text())
    rows = {row['path']: row for row in manifest['images']}
    assert len(rows) == manifest['adoptedCount'] == 471
    seen = set()
    for pack in manifest['archives']:
        archive_path = folder / pack['path']
        assert hashlib.sha256(archive_path.read_bytes()).hexdigest() == pack['sha256']
        with ZipFile(archive_path) as archive:
            for member in archive.namelist():
                assert member in rows and member not in seen
                path = PurePosixPath(member)
                assert not path.is_absolute() and '..' not in path.parts
                assert member.startswith('assets/pokemon/picasso-v340/')
                data = archive.read(member)
                assert hashlib.sha256(data).hexdigest() == rows[member]['sha256']
                destination = root / member
                destination.parent.mkdir(parents=True, exist_ok=True)
                if not destination.exists() or destination.read_bytes() != data:
                    destination.write_bytes(data)
                seen.add(member)
    assert seen == set(rows)
    old_faces = dict(images['pokemonFaces'])
    forms = {record['speciesId']: record for record in catalog['forms']['species']}
    for kind, bindings in manifest['bindings'].items():
        records = forms if kind.endswith('BySpecies') else catalog['pokemon']
        assert set(bindings) <= set(records)
        assert set(bindings.values()) <= seen
        images[kind].update(bindings)
    for key, face in images['pokemonFaces'].items():
        if images['pokemon'].get(key) == old_faces.get(key):
            images['pokemon'][key] = face
    # Missing full-body artwork keeps an existing full image, then the exact form's face.
    for key, face in images['pokemonFacesBySpecies'].items():
        images['pokemonBySpecies'].setdefault(key, face)
    print('Standard artwork: 233 portraits / 238 normal full-body images verified and connected')
