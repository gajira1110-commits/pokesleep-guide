# CSSの編集場所

`PSG_build_master.py` は、番号順にCSSを連結して単一ファイル `review.html` に埋め込みます。`PSG_styles.css` も互換用に同じ内容で再生成します。変更は `styles/` 内の該当ファイルに加え、`python3 PSG_build_master.py` を実行してください。

| ファイル | 主な範囲 |
| --- | --- |
| `01-foundation.css` | 共通部品、一覧、初期の詳細画面 |
| `02-detail-layout.css` | 詳細画面の構造と初期の調整 |
| `03-food-and-skill.css` | 食材・スキル周辺 |
| `04-basic-blocks.css` | 基本能力と進化ブロック |
| `05-responsive-detail.css` | 詳細画面の幅別レイアウト |
| `06-mobile-overrides.css` | スマホの後期調整 |
| `07-current-ui.css` | 一覧、料理、寝顔、詳細画面の共通調整 |
| `08-box-detail.css` | ボックス詳細・個体編集・スマホでの圧縮 |

ボックス詳細専用ルールを08に集め、元のルール順を保っています。共通ルールは07に残しています。同じセレクタが複数ファイルにある場合、後のファイルが優先されます。今後の整理は各画面を確認しながら段階的に行います。
