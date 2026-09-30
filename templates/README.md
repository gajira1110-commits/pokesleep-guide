# HTMLの編集場所

`PSG_build_master.py` は以下を `TEMPLATE_PARTS` の指定順に連結し、`review.html` を生成します。従来の `PSG_source_template.html` は互換用の結合結果で、ビルド時に再生成されます。画面の変更は該当する `templates/` のファイルに加えてください。

| ファイル | 内容 |
| --- | --- |
| `01-shell-head.html` | 文書の先頭、画像設定、共通ヘッダー |
| `02-home.html` | ホーム |
| `03-box.html` | ボックス一覧 |
| `04-dex.html` | 図鑑一覧 |
| `05-info.html` | 情報の入口 |
| `06-skills.html` | スキル一覧 |
| `07-recipes.html` | 料理一覧 |
| `08-fields.html` | フィールド |
| `09-dex-detail.html` | 図鑑詳細 |
| `10-box-detail.html` | 個体詳細 |
| `11-navigation.html` | ナビゲーションと共通の画面構造 |
| `12-core-controller.html` | 保存・補正計算、チーム・一覧の処理、共通クロージャの開始 |
| `21-day-calculator.html` | ホームとボックス共通の日産近似計算 |
| `19-box-detail-controller.html` | ボックス詳細の表示・個体編集・レベル操作 |
| `20-core-initialize.html` | 一覧イベント・追加削除・初期化、共通クロージャの終了 |
| `13-catalog-adapter.html` | 図鑑データの接続 |
| `14-detail-controller.html` | 図鑑詳細の処理 |
| `15-auto-images.html` | 画像パスの接続 |
| `16-swipe.html` | スワイプ操作 |
| `17-skill-controller.html` | スキル一覧の処理 |
| `18-recipe-controller.html` | 料理一覧の処理 |

ファイル境界は表示順を保つためのものです。新しい部品を追加する場合は、`PSG_build_master.py` の `TEMPLATE_PARTS` に挿入位置を指定してください。CSSは `styles/` を編集します。

12 → 21 → 19 → 20 は同じスクリプトとクロージャの断片です。順番を変えたり単独の script タグで囲んだりしないでください。個体詳細の変更は19、HTMLは10、CSSは08-box-detail.cssで行います。

日産の基本数値検証：`node tests/check_daily_calculator.cjs`。UI確認とは別に24時間・げんき0・所持数十分の既知条件、キャンプ、満杯、未選択を検証します。
