# 編集元と参照の境界

`master/`は種族・スキル・料理等のマスター、`templates/`はHTMLとJavaScript、`styles/`はCSS。`PSG_build_master.py`が順序を決めて組み立てる。`review.html`、`PSG_source_template.html`、`PSG_styles.css`は生成物であり直接編集しない。公開はGitHub Actionsのビルドから行う。

## 種族・姿の参照

`templates/01-species-catalog.html`はマスターと画像の初期接続後、Boxを読み込む前に実行する。

| 用途 | 参照先 | 注意 |
| --- | --- | --- |
| 全国番号・明示IDから個体の種族を解決 | `PS_SPECIES(item, catalog)` | 不正ID・番号の不一致・曖昧なサイズはnull。通常姿へ置き換えない |
| 個別の姿を解決 | `PS_FORMS.resolve(speciesId)` | Box個体は上記の番号整合チェックも必要 |
| 通常と姿別の全レコード | `PS_SPECIES_CATALOG.all(catalog)` | 248件。画面に応じてdexVisible等を絞り込む |
| 共通のID生成 | `PS_SPECIES_CATALOG.key(species)` | 通常は4桁番号_default、姿別は固有speciesId |
| Box登録候補と並び | `PS_SPECIES_CATALOG.box()` | 通常のdexVisible、姿別のboxEligibleを維持 |
| 図鑑の代表エントリー | 通常マスター＋`PS_FORMS.dexEntries` | サイズの代表表示を含む235項目。全248件の集合と区別 |

マスターは種族の基本能力、Boxは個体の選択食材・解放・サブスキル・ミュウのセット効果を保持する。全件集合を取得しても、未対応の日産や未確認の出現条件が計算可能になったとは扱わない。

## コア内部

`12-core-controller.html`は共有状態と定数、`core/01-box-storage.html`はBox正規化・読み込み・保存。以後の`core/`・`team/`・`box/`は同じコントローラー内へ組み立てられる。関数宣言は後方参照できるが、初期化時に呼ぶグローバルは先に読み込む。

`21-day-calculator.html`は日産計算、`core/09-day-view.html`と`box/02-daily-forecast.html`は結果表示、`box/05-actions.html`は編集操作。日産保留を0や部分合計に変換しない。Box保存キーとバックアップ形式は構成整理だけで変更しない。

## 整理後の確認

ビルドと`check_fragment_assembly.cjs`で組み立て・構文を確認。種族参照変更は`check_species_catalog.cjs`（前版HTMLを任意指定して同値比較）、登録/保存変更は`check_all_pokemon.cjs`、姿の進化は`check_size_evolution.cjs`、候補表示は`check_form_providers.cjs`、計算は`check_daily_calculator.cjs`を使う。検証対象に応じて選び、一度に機能変更と構成変更を広げない。
