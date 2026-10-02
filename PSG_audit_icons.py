"""Report the image coverage of the type, ingredient and berry masters."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent / 'master'
EXTENSIONS = ('.webp', '.png', '.jpg', '.jpeg')


def image_for(folder):
    matches = [folder / f'icon{ext}' for ext in EXTENSIONS if (folder / f'icon{ext}').is_file()]
    if len(matches) > 1:
        raise ValueError(f'画像が重複しています: {folder}')
    return matches[0] if matches else None


def main():
    types = json.loads((ROOT / 'types/manifest.json').read_text())
    for category in ('types', 'ingredients', 'berries'):
        if category == 'types':
            entries = [(slug, name) for slug, name in types.items()]
        else:
            entries = []
            for path in sorted((ROOT / category).glob('*/data.json')):
                data = json.loads(path.read_text())
                if data['id'] != path.parent.name:
                    raise ValueError(f'IDとフォルダー名が異なります: {path}')
                entries.append((data['id'], data['name']))
        available = 0
        missing = []
        for slug, name in entries:
            if image_for(ROOT / category / slug):
                available += 1
            else:
                missing.append(f'{name} ({slug})')
        print(f'{category}: {available}/{len(entries)}')
        if missing:
            print('  画像待ち: ' + '、'.join(missing))


if __name__ == '__main__':
    main()
