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
| `14-detail-controller.html` | 図鑑詳細の共通状態・DOM初期化、クロージャの開始 |
| `detail/02-sleep-and-fields.html` | 寝顔の表示・登録・保存、フィールド出現情報、登録情報の再読み込み |
| `detail/03-identity.html` | タブ切り替え、名前・前後ナビの表示、基本能力 |
| `detail/04-food.html` | 食材候補・数量・対応料理の表示 |
| `detail/05-skill.html` | メインスキル・効果・各レベルの表示 |
| `detail/06-evolution.html` | 進化条件・系統探索・通常進化・途中分岐・イーブイの表示 |
| `detail/07-navigation.html` | 詳細を開く処理、一覧への復帰、戻る／進む履歴、イベント接続、クロージャの終了 |
| `15-auto-images.html` | 画像パスの接続 |
| `16-swipe.html` | スワイプ操作 |
| `17-skill-controller.html` | スキル一覧の処理 |
| `18-recipe-controller.html` | 料理一覧の処理 |

ファイル境界は表示順を保つためのものです。新しい部品を追加する場合は、`PSG_build_master.py` の `TEMPLATE_PARTS` に挿入位置を指定してください。CSSは `styles/` を編集します。

12 → 21 → 19 → 20 は同じスクリプトとクロージャの断片です。順番を変えたり単独の script タグで囲んだりしないでください。個体詳細の変更は19、HTMLは10、CSSは08-box-detail.cssで行います。

日産の基本数値検証：`node tests/check_daily_calculator.cjs`。UI確認とは別に24時間・げんき0・所持数十分の既知条件、キャンプ、満杯、未選択を検証します。

## 図鑑詳細を編集するとき

14 → detail/02 → 03 → 04 → 05 → 06 → 07 は、同じスクリプトとクロージャの断片です。ビルド時にそのまま連結します。断片を単独のscriptタグで囲まず、順序を維持してください。共通状態をwindowへ追加公開する必要はありません。

- データ参照・状態：`V`、`byNo`、`skillOf`、`currentNo`、`currentTab` は14で用意します。
- 表示先：`hero`、`tabs`、`ability`、`sleep`、`field` は14で初期化します。
- 表示更新：07の `openPokemonDetail` が各表示関数を呼び出します。表示内容を変える場合は、その担当ファイルの関数を編集してください。
- 公開入口：`window.openPokemonDetail`、`window.openDexCard`、`window.PS_DETAIL_NAV` は07、寝顔再読み込みの `window.PSG_REFRESH_SLEEP_FOUND` は02です。既存の呼び出し元が使う入口を維持します。

v208の分割では処理内容を変更せず、断片の連結が元のコントローラーと完全一致することを確認しました。生成テンプレート・review.htmlも、Reviewのバージョン表示以外はv207と同一です。
