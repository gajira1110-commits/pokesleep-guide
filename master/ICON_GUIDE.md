# アイコンのマスター

| 種類 | IDの一覧 | 正式な置き場所 | 登録状況 |
| --- | --- | --- | --- |
| タイプ | `types/manifest.json` | `types/<id>/icon.png` | 採用済み18種を個別登録済み |
| 食材 | `ingredients/<id>/data.json` | `ingredients/<id>/icon.png` | 画像照合待ち |
| きのみ | `berries/<id>/data.json` | `berries/<id>/icon.png` | 画像照合待ち |

各フォルダーの画像は `icon.webp`, `icon.png`, `icon.jpg`, `icon.jpeg` のいずれか一つです。ビルド時に画像ファイルの相対URLをHTMLへ登録します。画像ファイルも同じ構成で配信します。画像の有無は `python3 PSG_audit_icons.py` で確認します。同じIDに複数の拡張子を置くとビルドは停止します。

`icon_sources/initial_collage.jpg` は初期の食材・きのみ・タイプ一覧の参照画像です。食材ときのみには同じ品目の重複、英名や日本語名のずれ、マスターにない候補があります。この画像から無条件で切り出して登録せず、IDと絵柄を1件ずつ照合してから正式な `icon.*` に配置します。未登録の食材は現行の画面内の代替図案を使います。
