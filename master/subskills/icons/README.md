# サブスキル画像の差し替え

画像ファイルの名前は `assets/subskills/manifest.json` のSVG名から拡張子だけを外したものです。例：きのみの数Sは `icons/berry_count_s.webp`、スキル確率アップMは `icons/skill_trigger_m.webp`。PNG/JPEGも使えます。

未追加なら既存の `assets/subskills/` のSVGバッジを使います。`data.json` の効果値には画像を入れません。画像を追加した後は `python3 PSG_build_master.py` で `review.html` を再生成します。
