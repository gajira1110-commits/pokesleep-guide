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
| `12-core-controller.html` | 共通状態・保存キー・ボックス読込保存、クロージャの開始 |
| `core/02-team.html` | チーム構成・食材・料理チェック・メンバー選択・並べ替え・顔ドック |
| `core/03-profiles.html` | 寝顔記録の検証、フィールド・週の料理・好物・エリアボーナスの保存 |
| `core/04-backup.html` | バックアップ書き出し・復元プレビュー・確認・失敗時の保存復旧 |
| `core/05-navigation-and-filters.html` | 共通画面ナビ、検索・タイプ・食材・得意フィルター、代替アイコン |
| `core/06-lists.html` | 図鑑・ボックスカード一覧、チームへ登録する個体の選択 |
| `core/07-corrections.html` | レベル上限・サブスキル解放・性格と個体補正・チーム速度補正 |
| `core/08-fields.html` | フィールド選択・一覧・寝顔出現・好物・今週の料理の操作 |
| `core/09-day-view.html` | ホームの日産予想表示・キャンプ・食事・起床時げんきの操作 |
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
| `15-auto-images.html` | 自動画像処理の共通状態・読み込みキャッシュ、クロージャの開始 |
| `images/02-type-alignment.html` | タイプアイコンの可視領域の検出、中央配置 |
| `images/03-type-sheet.html` | 旧タイプシートの切り抜き、採用済みマスター画像を優先 |
| `images/04-catalog-assets.html` | ポケモン・きのみ・食材・スキルの画像パス接続 |
| `images/05-refresh.html` | 読み込み完了後の画面更新、クロージャの終了 |
| `16-swipe.html` | スワイプ操作 |
| `17-skill-controller.html` | スキル一覧の処理 |
| `18-recipe-controller.html` | 料理一覧の処理 |

ファイル境界は表示順を保つためのものです。新しい部品を追加する場合は、`PSG_build_master.py` の `TEMPLATE_PARTS` に挿入位置を指定してください。CSSは `styles/` を編集します。

12 → core/02〜09 → 21 → 19 → 20 は同じスクリプトとクロージャの断片です。順番を変えたり単独の script タグで囲んだりしないでください。個体詳細の変更は19、HTMLは10、CSSは08-box-detail.cssで行います。

日産の基本数値検証：`node tests/check_daily_calculator.cjs`。UI確認とは別に24時間・げんき0・所持数十分の既知条件、キャンプ、満杯、未選択を検証します。

## ホーム・ボックスの共通処理を編集するとき

共通状態 `state` と `master`、保存キーは12にあります。チームの `team` はcore/02、週ごとのフィールド・料理設定 `fieldProfile` はcore/03で初期化します。これらは同じクロージャ内で共有し、windowに新しい状態を公開していません。

- カードの表示はcore/06、検索・絞り込みはcore/05、個体補正の計算はcore/07を編集します。
- ホームの日産の見せ方はcore/09、計算そのものは21を編集します。ボックスの日産も21を使います。
- フィールドの保存形式・週切替はcore/03、画面表示と操作はcore/08を編集します。
- バックアップはcore/04、通常の個体保存は12です。既存の保存キー・検証・復元確認・保存失敗時の処理を維持してください。
- 起動時のイベント接続と `window.PS` の公開は20です。後続の `13-catalog-adapter.html` がカタログを接続します。

v210では741行の共通コントローラーを担当別に分割しました。断片の連結は元の処理と完全一致し、生成テンプレート・review.htmlもバージョン表示以外v209と同一です。

## 図鑑詳細を編集するとき

14 → detail/02 → 03 → 04 → 05 → 06 → 07 は、同じスクリプトとクロージャの断片です。ビルド時にそのまま連結します。断片を単独のscriptタグで囲まず、順序を維持してください。共通状態をwindowへ追加公開する必要はありません。

- データ参照・状態：`V`、`byNo`、`skillOf`、`currentNo`、`currentTab` は14で用意します。
- 表示先：`hero`、`tabs`、`ability`、`sleep`、`field` は14で初期化します。
- 表示更新：07の `openPokemonDetail` が各表示関数を呼び出します。表示内容を変える場合は、その担当ファイルの関数を編集してください。
- 公開入口：`window.openPokemonDetail`、`window.openDexCard`、`window.PS_DETAIL_NAV` は07、寝顔再読み込みの `window.PSG_REFRESH_SLEEP_FOUND` は02です。既存の呼び出し元が使う入口を維持します。

v208の分割では処理内容を変更せず、断片の連結が元のコントローラーと完全一致することを確認しました。生成テンプレート・review.htmlも、Reviewのバージョン表示以外はv207と同一です。

## 画像処理を編集するとき

15 → images/02 → 03 → 04 → 05 も同じスクリプトの断片です。単独のscriptタグで囲まず、順番を維持してください。`catalog`、`assets`、`explicit`、`lookup`、`jobs` は15の共通状態です。公開入口 `PS_AUTO_ASSETS.ready` は05で設定します。

- タイプの位置合わせは02、旧シートからの切り抜きは03を編集します。採用済みの画像は描き直さず、表示用の画像だけを中央配置します。
- 未登録画像の自動探索は04を編集します。明示されたマスター画像を優先し、存在しないファイルは現在の表示を維持します。同じパスの読み込みは15のキャッシュを共有します。
- 読み込み後の一覧・詳細の再表示は05を編集します。
- ビルド側の画像パス・シート設定は `PSG_image_assets.py` にあります。`PSG_build_master.py` はこのモジュールを呼び出します。
- 顔シートの座標は `PSG_face_sheet.js`、画像のプレースホルダーと共通設定は `01-shell-head.html`、採用画像そのものは `master/` を編集します。

v209の整理でも、生成テンプレート・review.htmlはバージョン表示以外v208と同一です。画像ファイルと座標は変更していません。
