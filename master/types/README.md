# タイプ画像

採用済みの18タイプシートを個別の `icon.png` に切り出し、`manifest.json` の英字IDのフォルダーに登録しました。たとえば、みずタイプは `types/water/icon.png` です。1タイプにつき1ファイルです。差し替える場合は同じフォルダーの古いアイコンを削除し、`icon.webp` / `icon.png` / `icon.jpg` / `icon.jpeg` のいずれか一つを置きます。

画像がないタイプは、既存の18タイプ画像シートから作るドット絵アイコンを表示します。18種類が揃っている場合、生成HTMLはシートを参照しません。画像を変更した後は `python3 PSG_build_master.py` で `review.html` を再生成します。
