"""Resolve existing master artwork and prepare legacy sheet configuration.

No image pixels are rewritten during the build. Runtime rendering lives in
templates/images; master files remain the source of adopted artwork.
"""
import hashlib
import json


def image_path(root, folder, basename):
    """Return the existing asset's relative URL; reject ambiguous extensions."""
    found = [p for p in folder.glob(f'{basename}.*')
             if p.suffix.lower() in ('.webp', '.png', '.jpg', '.jpeg', '.svg')]
    assert len(found) <= 1, f'ambiguous image: {folder}/{basename}'
    if not found:
        return None
    return found[0].relative_to(root).as_posix()


def face_sheet_script(root, script, sheet):
    """Keep face coordinates in their existing renderer; supply its sheet URL."""
    source = script.read_text()
    assert source.count('/* PSG_BUILD_FACE_SHEET */') == 1
    return source.replace('/* PSG_BUILD_FACE_SHEET */',
                          json.dumps(sheet.relative_to(root).as_posix()))


def type_sheet_config(root, master, images, sheet):
    """Use original sheet bounds only when no replacement icon was adopted."""
    metadata = json.loads((master / 'types/sheet-icons.json').read_text())
    icons = {}
    for type_id, name in json.loads((master / 'types/manifest.json').read_text()).items():
        info = metadata['icons'][type_id]
        custom_path = images.get(name)
        if not custom_path or hashlib.sha256((root / custom_path).read_bytes()).hexdigest() == info['sha256']:
            icons[name] = info['bounds']
    return {'url': sheet.relative_to(root).as_posix(), 'icons': icons}
