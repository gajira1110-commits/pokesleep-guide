# 追加データの参照元

照合日: 2026-09-28（UTC）。参照元の数値はゲーム更新で変わるため、更新する際に再確認してください。食材確率・スキル確率は資料サイトの推算で、公表された確定値としては扱いません。出典に差のある項目は `data.json` に入れていません。

| 図鑑番号 | 参照元 |
| --- | --- |
| 0002–0003 | [フシギソウ](https://wiki.pokesleep.com/ja/pokemon/ivysaur), [フシギバナ](https://wiki.pokesleep.com/ja/pokemon/venusaur) |
| 0004–0006 | [ヒトカゲ](https://wiki.pokesleep.com/ja/pokemon/charmander), [リザード](https://wiki.pokesleep.com/ja/pokemon/charmeleon), [リザードン](https://wiki.pokesleep.com/ja/pokemon/charizard), [Game8 リザード](https://game8.jp/pokemonsleep/541974), [Game8 リザードン](https://game8.jp/pokemonsleep/541975)。ヒトカゲの食材確率20.1%・スキル確率1.1%は資料サイトの推算 |
| 0007–0009 | [ゼニガメ](https://wiki.pokesleep.com/ja/pokemon/squirtle), [カメール](https://wiki.pokesleep.com/en/pokemon/wartortle), [カメックス](https://wiki.pokesleep.com/ja/pokemon/blastoise), [Game8 ゼニガメ](https://game8.jp/pokemonsleep/541976)。カメールは所持数19・食材確率27.1%・スキル確率2.0%、カメックスは所持数27を確認。確率は資料サイトの推算 |
| 0010–0012 | [キャタピー](https://wiki.pokesleep.com/ja/pokemon/caterpie), [トランセル](https://wiki.pokesleep.com/ja/pokemon/metapod), [バタフリー](https://wiki.pokesleep.com/ja/pokemon/butterfree), [Game8 バタフリー](https://game8.jp/pokemonsleep/541981)。キャタピーの食材確率17.9%・スキル確率0.8%は資料サイトの推算 |
| 0025–0026 | [ピカチュウ](https://wiki.pokesleep.com/ja/pokemon/pikachu), [ライチュウ](https://wiki.pokesleep.com/ja/pokemon/raichu), [Game8 ライチュウ](https://game8.jp/pokemonsleep/541987)。ピカチュウの所持数22、ライチュウの所持数31を詳細ページで確認 |
| エナジーチャージS | [スキル効果](https://wiki.pokesleep.com/ja/main-skills/chargestrengths) |
| ワカクサカレーパン | [料理データ・Lv.70](https://wiki.pokesleep.com/ja/dishes/greengrasscurrybun)。2026-08-10追加。食材63個、Lv.1=10,945、Lv.70=39,183。 |

既存の No.1/4/10 と料理データは従来のレビューHTMLから移しました。食材とスキルのフォルダーも従来の収録値を引き継いでいます。

日産仮試算のげんき帯は[げんきの仕組み](https://wiki.pokesleep.com/ja/energy)を参照。10分ごとに1減少し、げんき81以上／61–80／41–60／1–40／0のおてつだい間隔倍率をそれぞれ0.45／0.52／0.58／0.66／1.00とする。睡眠中も減少し、睡眠結果の回復は次の起床時に適用する。現在の画面は料理・スキル・道具による回復を含まない。

v146のメインスキル期待回数は[スキル発動機会とストック](https://wiki.pokesleep.com/ja/skill-expectation)および[最大所持数といつのまに育成](https://wiki.pokesleep.com/ja/inventory)を参照。通常のおてつだいに個体補正後の発動確率を適用し、満杯前だけを対象とする。回収ごとにストックを受け取る仮定で、きのみ・食材得意は1回、スキル・オール得意は2回を上限とする。おてつだい回数の期待値を用いたポアソン近似であり、天井やスキル発動タイミングの細部を再現しない。食材ゲットSのランダム食材は通常の食材合計に加えず、エナジーチャージSはきのみエナジーと区別して表示する。

v147のきのみLv.1基礎エナジーは[ドリのみ](https://wiki.pokesleep.com/ja/berries/durinberry)30、[オレンのみ](https://wiki.pokesleep.com/en/berries/oranberry)31、[ヒメリのみ](https://wiki.pokesleep.com/ja/berries/leppaberry)27、[ラムのみ](https://wiki.pokesleep.com/en/berries/lumberry)24、[ウブのみ](https://wiki.pokesleep.com/en/berries/grepaberry)25。各資料サイトに掲載の `ROUND(MAX(B + L − 1, B × 1.025^(L − 1)))` を使用。ポケモンのLv.で1個当たりの基礎エナジーを算出し、日産きのみ個数を掛ける。フィールド好物倍率、エリアボーナス、料理、ランダム食材からの調理エナジーは含めない。

v148の[プクリン](https://wiki.pokesleep.com/ja/pokemon/wigglytuff)は2026年5月調整後のおてつだい間隔2750秒・所持数32、推定の食材19.1%・スキル4.0%、食材候補・寝顔名を同ページから照合。[モモンのみ](https://wiki.pokesleep.com/ja/berries/pechaberry)の基礎エナジー26、[げんきオールS](https://wiki.pokesleep.com/ja/main-skills/energyforeveryones)のLv.1–6回復量5／7／9／11／15／18を参照。回復は[げんきの仕組み](https://wiki.pokesleep.com/ja/energy)に従い最大150、受け手の性格補正を適用。日産では回収時に期待回復量をまとめて適用する近似とし、その時間帯内の実際の発動時点と10分減少タイマーのリセットは再現しない。睡眠8時間の回収は翌朝なので当日生産には戻さない。

v148のいいキャンプチケットの[公式サポート](https://app-psl.pokemon-support.com/hc/ja/articles/29517911255065--%E3%81%84%E3%81%84%E3%82%AD%E3%83%A3%E3%83%B3%E3%83%97%E3%83%81%E3%82%B1%E3%83%83%E3%83%88-%E3%81%AE%E5%8A%B9%E6%9E%9C%E3%81%8C%E3%81%82%E3%82%8A%E3%81%BE%E3%81%9B%E3%82%93)によると速度と所持上限が各1.2倍、鍋容量が1.5倍。日産では速度・所持上限のみ適用し、期待所持数は小数のまま扱う。鍋・睡眠リサーチは別機能で適用する。

v149の料理によるげんき回復量は[げんきの仕様資料](https://wiki.pokesleep.com/ja/energy)のVer.3.5.0表を参照。食前のげんき81以上で+1、71–80で+2、61–70で+3、51–60で+4、41–50で+5、31–40で+6、21–30で+7、11–20で+8、0–10で+9。料理回復上限150、性格補正なし。日産では起床直後・6時間後・12時間後に食べる仮定でON/OFFし、料理の食材消費やレシピエナジーは計算しない。実際の食事時刻はユーザーごとに異なる。


v150の通常フィールド好物きのみはユーザーが週ごとに手入力。公式の[イベント告知](https://www.pokemonsleep.net/en/news/333032323439373635393330373935303039/)には3種類の好物設定例があり、[EXモードの告知](https://www.pokemonsleep.net/en/news/323932383138363132393037393333363937/)は通常とは異なるメイン・サブ好物と速度補正を明示する。したがってv150はEXに適用しない。好物2倍およびエリアボーナスのエナジーへの乗算は通常フィールド用の計算仮定。イベント固有の倍率、料理エナジー、鍋容量には反映しない。


v151のフィールド名（通常7フィールド）は[公式イベント案内](https://www.pokemonsleep.net/news/333334383432323435393232373835/)の開催フィールド一覧に照合。EXは別マスター化まで選択肢に含めない。[公式EX説明](https://www.pokemonsleep.net/news/323932383136333030323233323334303439/)は通常と異なるメイン／サブ好物およびEXフィールドボーナスを明示。週の切替（月曜4時）はアプリの現地時間を使う設計仮定。イベント時の好物は手動で変更し、自動告知連携は未実装。


v152で通常フィールドの好物きのみをマスターへ追加。ワカクサ本島は週替わりとし、[きのみ一覧](https://game8.jp/pokemonsleep/542465)の説明と照合。固定フィールドは[シアンの砂浜](https://game8.jp/pokemonsleep/543674)、[トープ洞窟](https://game8.jp/pokemonsleep/545058)、[ウノハナ雪原](https://game8.jp/pokemonsleep/546951)、[ラピスラズリ湖畔](https://game8.jp/pokemonsleep/585892)、[ゴールド旧発電所](https://game8.jp/pokemonsleep/639651)の通常モード掲載値を参照。[アンバー渓谷の3種](https://www.pokemonsleep.net/news/333135323932343836363035393936303333/)は公式予告に明記。イベントは一時的に異なることがあるため週単位で手動上書きし、翌週は通常値に戻す。ランクごとの出現・必要ねむけパワーは未投入。

v153で通常フィールドの寝顔出現例をフィールド別マスターへ投入。[フシギダネ](https://wiki.pokesleep.com/ja/pokemon/bulbasaur)のワカクサ本島・ラピスラズリ湖畔、[ライチュウ](https://wiki.pokesleep.com/ja/pokemon/raichu)のワカクサ本島・ゴールド旧発電所の各寝顔の最低カビゴンランクと必要ねむけパワー（DPR）を照合。資料サイトは非公式のためゲーム内の確定公表値とは区別する。DPRはリサーチ抽選に使うねむけパワーであり、カビゴンのランク判定エナジーではない。未投入の組み合わせを「出現しない」とは判定しない。EXフィールドは対象外。

v156で収録済み残り13種の寝顔4種ずつを照合し、通常フィールドの出現条件を追加。参照先：[フシギソウ](https://wiki.pokesleep.com/ja/pokemon/ivysaur)、[フシギバナ](https://wiki.pokesleep.com/ja/pokemon/venusaur)、[ヒトカゲ](https://wiki.pokesleep.com/ja/pokemon/charmander)、[リザード](https://wiki.pokesleep.com/ja/pokemon/charmeleon)、[リザードン](https://wiki.pokesleep.com/ja/pokemon/charizard)、[ゼニガメ](https://wiki.pokesleep.com/ja/pokemon/squirtle)、[カメール（英語版）](https://wiki.pokesleep.com/en/pokemon/wartortle)、[カメックス](https://wiki.pokesleep.com/ja/pokemon/blastoise)、[キャタピー](https://wiki.pokesleep.com/ja/pokemon/caterpie)、[トランセル](https://wiki.pokesleep.com/ja/pokemon/metapod)、[バタフリー](https://wiki.pokesleep.com/ja/pokemon/butterfree)、[ピカチュウ](https://wiki.pokesleep.com/ja/pokemon/pikachu)、[プクリン](https://wiki.pokesleep.com/ja/pokemon/wigglytuff)。カメールの英語版ランク Basic/Great/Ultra/Master はノーマル/スーパー/ハイパー/マスターに対応させた。現行マスターの15種・寝顔60種で119件のフィールド別組み合わせを収録。ウノハナ雪原とアンバー渓谷はこの15種に関する通常フィールド出現資料を投入していない。「未掲載＝出現しない」と解釈しない。必要ねむけパワーはランク閾値の代用にしない。

v157で通常7フィールドのカビゴンランク必要エナジーをノーマル1〜マスター20の35段階で追加。出典：[ワカクサ本島](https://wiki.pokesleep.com/ja/areas/greengrass)、[シアンの砂浜](https://wiki.pokesleep.com/ja/areas/cyan)、[トープ洞窟](https://wiki.pokesleep.com/ja/areas/taupe)、[ウノハナ雪原](https://wiki.pokesleep.com/ja/areas/snowdrop)、[ラピスラズリ湖畔](https://wiki.pokesleep.com/ja/areas/lapis)、[ゴールド旧発電所](https://wiki.pokesleep.com/ja/areas/old-gold)、[アンバー渓谷](https://wiki.pokesleep.com/ja/areas/amber-canyon)。すべて非公式資料であり、ゲーム更新時は再照合。ランク閾値はカビゴンの累積エナジーであり、寝顔のDPR（必要ねむけパワー）とは別の数値。イベント・EXの特別なランク条件には適用しない。


v159で[プリン](https://wiki.pokesleep.com/ja/pokemon/jigglypuff)と[ププリン](https://wiki.pokesleep.com/ja/pokemon/igglybuff)の基礎おてつだい時間、最大所持数、食材候補、推定食材・スキル確率、4種ずつの寝顔と進化条件を照合。通常フィールドのワカクサ本島・シアンの砂浜に計14組の最低ランクと必要ねむけパワーを登録。両ページは非公式資料で、確率は推定。EXの出現値は別ルールのため登録していない。グリーングラスの★3は掲載がないため未収録とし、出現しないと断定しない。画像は未投入。


v160で[ピチュー](https://wiki.pokesleep.com/ja/pokemon/pichu)の能力、食材、寝顔4種、ピカチュウへの進化条件を照合。ワカクサ本島・ゴールド旧発電所の通常フィールド出現7組を登録。両フィールドの★3／ワカクサ出現は資料に掲載がないため未収録。確率は非公式資料の推定値であり、EX値は別管理。画像は未投入。図鑑No.172のまま扱い、進化リンクと図鑑番号順を分離する。


v161で[コダック](https://wiki.pokesleep.com/ja/pokemon/psyduck)、[ゴルダック](https://wiki.pokesleep.com/ja/pokemon/golduck)、[ワニノコ](https://wiki.pokesleep.com/ja/pokemon/totodile)、[アリゲイツ](https://wiki.pokesleep.com/ja/pokemon/croconaw)、[オーダイル](https://wiki.pokesleep.com/ja/pokemon/feraligatr)の能力、食材候補、寝顔4種ずつ、通常フィールド出現を照合。[エナジーチャージS（ランダム）](https://wiki.pokesleep.com/ja/main-skills/chargestrengthsvar)のLv.1〜7の下限・上限を新スキルマスターへ追加。日産では上下限の単純平均を発動1回の期待値とする近似。実際の抽選分布が一様であることを示す公式資料ではない。ランク・DPR、能力の確率は非公式資料。EXデータ・画像は未投入。

v162で[マダツボミ](https://wiki.pokesleep.com/ja/pokemon/bellsprout)→[ウツドン](https://wiki.pokesleep.com/ja/pokemon/weepinbell)→[ウツボット](https://wiki.pokesleep.com/ja/pokemon/victreebel)、[ヤドン](https://wiki.pokesleep.com/ja/pokemon/slowpoke)→[ヤドラン](https://wiki.pokesleep.com/ja/pokemon/slowbro)／[ヤドキング](https://wiki.pokesleep.com/ja/pokemon/slowking)、[メリープ](https://wiki.pokesleep.com/ja/pokemon/mareep)→[モココ](https://wiki.pokesleep.com/ja/pokemon/flaaffy)→[デンリュウ](https://wiki.pokesleep.com/ja/pokemon/ampharos)、[ガーディ](https://wiki.pokesleep.com/ja/pokemon/growlithe)→[ウインディ](https://wiki.pokesleep.com/ja/pokemon/arcanine)の11種を登録。各ページの基礎値・食材候補・寝顔4種、通常フィールドの最低ランクと必要ねむけパワーを照合した。新食材のおいしいシッポ・ふといながねぎもIDを分けた。スキルLv値は[げんきチャージS](https://wiki.pokesleep.com/ja/main-skills/chargeenergys)、[げんきエールS](https://wiki.pokesleep.com/ja/main-skills/energizingcheers)、[エナジーチャージM](https://wiki.pokesleep.com/ja/main-skills/chargestrengthm)、[おてつだいサポートS](https://wiki.pokesleep.com/ja/main-skills/extrahelpfuls)を参照。いずれも非公式資料で、食材・スキル確率は推定値。げんきエールの対象は実際には均等でない可能性があるが、日次予測では5匹への均等割りを暫定仮定する。おてつだいサポートの発動回数と即時おてつだい回数は表示するが、きのみ・食材の日産量には未反映。各スキルを持つ全ポケモンではなく、この版では各1系列を追加した。

v171として、2026-09-29に[ディグダ](https://wiki.pokesleep.com/ja/pokemon/diglett)→[ダグトリオ](https://wiki.pokesleep.com/ja/pokemon/dugtrio)（No.50–51）のタイプ・得意・睡眠タイプ、基礎おてつだい時間、所持数、食材候補、メインスキル、Lv.20／アメ40個の進化条件を照合。両ページに掲載された寝顔は各3種だけを登録し、★4を推測して追加していない。[フィラのみ](https://wiki.pokesleep.com/ja/berries/figyberry)のLv.1基礎エナジー29を参照。食材確率とスキル確率は非公式資料サイトの推定値。寝顔のフィールド別ランク・必要ねむけパワーは別担当範囲の `master/fields/` に未投入であり、未収録を非出現と解釈しない。画像・EXデータも未投入。

2026-09-29のメインスキル追加：[ゆめのかけらゲットS](https://wiki.pokesleep.com/ja/main-skills/dreamshardmagnets)（固定）はLv.1〜8で240／340／480／670／920／1260／1800／2500個、[料理パワーアップS](https://wiki.pokesleep.com/ja/main-skills/cookingpower-ups)はLv.1〜7で次回のなべ容量を7／10／12／17／22／27／31個増やす値を照合。いずれも非公式資料サイトの掲載値。スキル一覧・図鑑・Boxでは説明を表示するが、日産のゆめのかけらと料理のなべ容量には未接続であり、カビゴンのエナジーには換算しない。追加したドードー系統のスキルは既存のげんきチャージSで、この2スキルは同系統には割り当てない。

v173のポケモン担当として[ドードー](https://wiki.pokesleep.com/ja/pokemon/doduo)→[ドードリオ](https://wiki.pokesleep.com/ja/pokemon/dodrio)（No.84–85）を照合。タイプ・得意・睡眠タイプ、基礎おてつだい時間、所持数、食材候補、既存のげんきチャージS、Lv.23／アメ40個の進化条件、寝顔各4種を登録。[シーヤのみ](https://wiki.pokesleep.com/ja/berries/pamtreberry)のLv.1基礎エナジー24を追加。ドードリオのおてつだい間隔2,300秒は2025年6月の調整後の値。食材確率18.4%・スキル確率2.0%は非公式資料の推定値として扱う。通常フィールドのランク・DPR、EX、画像は未投入であり、未収録を非出現と解釈しない。

v177のスキル追加：料理チャンスS、きのみバースト、ゆめのかけらゲットS（ランダム）、ゆびをふる、へんしん(スキルコピー)、ものまね(スキルコピー)の6件。名称と特殊効果は[ミュウの習得候補](https://www.pokemonsleep.net/news/333832393732393736363935333435313533/)、[ワシボン／ウォーグル](https://www.pokemonsleep.net/news/323233353635363139353632323833303039/)、[Ver.2.3.0の説明変更・スキルコピー](https://www.pokemonsleep.net/news/323133343231303831373832393130393737/)などの公式告知と照合。Lv別の数値は非公式資料の[料理チャンスS](https://wiki.pokesleep.com/ja/main-skills/tastychances)、[きのみバースト](https://wiki.pokesleep.com/ja/main-skills/berryburst)、[ゆめのかけらゲットS（ランダム）](https://wiki.pokesleep.com/ja/main-skills/dreamshardmagnetsvar)を参照。抽選・蓄積・複合効果は日産予測に未接続で、画面では効果説明に限る。収録ポケモンが未登録のスキルも含む。

v178のポケモン追加：[コラッタ](https://wiki.pokesleep.com/ja/pokemon/rattata)・[ラッタ](https://wiki.pokesleep.com/ja/pokemon/raticate)（No.19–20）のタイプ・得意・睡眠タイプ、きのみ、食材候補、基礎おてつだい時間、所持数、進化条件、寝顔4種およびワカクサ本島・ウノハナ雪原の通常出現条件を照合。[キーのみ](https://wiki.pokesleep.com/ja/berries/persimberry)のLv.1基礎エナジー28を追加。ラッタの2,950秒は[公式Ver.2.4.0調整](https://www.pokemonsleep.net/en/news/323234333137373937353632333138383439/)後。食材確率・スキル確率は非公式資料サイトの推定値。画像とEXは未投入。

v179のポケモン追加：[アーボ](https://wiki.pokesleep.com/ja/pokemon/ekans)・[アーボック](https://wiki.pokesleep.com/ja/pokemon/arbok)（No.23–24）のタイプ・得意・睡眠タイプ、きのみ、食材候補、基礎おてつだい時間、所持数、進化条件、寝顔4種およびワカクサ本島・アンバー渓谷の通常出現条件を照合。[カゴのみ](https://wiki.pokesleep.com/ja/berries/chestoberry)のLv.1基礎エナジー32を追加。アーボックの3,400秒は[公式Ver.2.3.0調整](https://www.pokemonsleep.net/news/323133343231303831373832393130393737/)後として資料サイトと照合。食材確率・スキル確率は非公式資料サイトの推定値。画像とEXは未投入。

v180のデータ追加：[公式のサンド・サンドパン告知](https://www.pokemonsleep.net/en/news/333838303933353530313930393139363832/)で実装とタイプ・睡眠タイプ・フィールドを確認し、[サンド](https://wiki.pokesleep.com/ja/pokemon/sandshrew)・[サンドパン](https://wiki.pokesleep.com/ja/pokemon/sandslash)の能力、食材候補、進化、寝顔と通常フィールドの出現条件を非公式資料で照合。食材確率・スキル確率は推定値。[食材セレクトS](https://wiki.pokesleep.com/ja/main-skills/ingredientdraws)のLv.1–7は5／6／8／11／13／16／18個。抽選される食材の内訳は未登録で、日産食材へは加算しない。料理は[とくせんリンゴカレー](https://game8.jp/pokemonsleep/546421)と[とくせんリンゴサラダ](https://game8.jp/pokemonsleep/546435)の必要数とLv.1／Lv.70エナジーを照合。料理の画像は未登録。

v181のデータ追加：[ロコン](https://wiki.pokesleep.com/ja/pokemon/vulpix)・[キュウコン](https://wiki.pokesleep.com/ja/pokemon/ninetales)の能力、食材、進化、寝顔、通常フィールドの最低ランクとDPRを非公式資料で照合。食材・スキル確率は推定値で、アローラのすがたは別扱いとして未登録。[おてつだいブースト](https://wiki.pokesleep.com/ja/main-skills/helperboost)のほのお版Lv.1–6の基礎回数と異なるほのおタイプ種数ごとの追加回数を登録。即時のおてつだいによる産出は日産予測に未反映。[モーモーホットミルク](https://game8.jp/pokemonsleep/546449)と[クラフトサイコソーダ](https://game8.jp/pokemonsleep/546450)の必要食材とLv.1／Lv.70エナジーを照合。追加分の画像は未登録。食材セレクトSのランダム食材は、抽選仕様の相談まで引き続き予測に含めない。

v182のデータ追加：[ニャース](https://wiki.pokesleep.com/ja/pokemon/meowth)・[ペルシアン](https://wiki.pokesleep.com/ja/pokemon/persian)の能力、食材、進化、寝顔、ワカクサ本島・ラピスラズリ湖畔の最低ランクとDPRを非公式資料で照合。確率は推定値。[おてつだいブースト](https://wiki.pokesleep.com/ja/main-skills/helperboost)の「みず」版Lv.1–6の基礎回数と異なるみずタイプ種数による追加回数を登録し、日産の即時おてつだいへは未反映。[たんじゅんホワイトシチュー](https://game8.jp/pokemonsleep/546423)と[ねがいごとアップルパイ](https://game8.jp/pokemonsleep/546444)の必要食材、Lv.1／Lv.70エナジーを照合。画像・EXデータは未登録。

v183のデータ追加：[ライコウ](https://wiki.pokesleep.com/ja/pokemon/raikou)・[エンテイ](https://wiki.pokesleep.com/ja/pokemon/entei)・[スイクン](https://wiki.pokesleep.com/ja/pokemon/suicune)の能力・食材・寝顔3種・通常フィールドのランクとDPRを照合。確率は推定値。[公式のお知らせ](https://www.pokemonsleep.net/news/333032323439373435303334373732343831/)で3匹を特別なポケモンと確認し、チーム内合計1匹に制限。チームからの選択・保存データ読込・バックアップ復元に共通の制限を適用。[おてつだいブースト](https://wiki.pokesleep.com/ja/main-skills/helperboost)のでんき版Lv.1–6を追加。即時おてつだいによる日産は未反映。画像とEX出現データは未登録。


v190：2026-09-30にコイル、レアコイル、ジバコイルの能力・食材・進化条件・各3種の寝顔を照合。出典は各ポケモンのdata.jsonに記録。ユーザー提供の実機画像IMG_1530.png（コイル・レアコイル）とIMG_1539.png（ジバコイル）でも寝顔の分母が3と確認できる。発見済みの分子は取り込まない。食材・スキル確率は非公式資料の推定値。画像・フィールド別出現値は未投入。

メインスキル「ビルドアップ(料理アシストS)」をLv.1〜7の食材数と大成功確率上昇量付きで追加。名称・効果の存在は公式Ver.3.3.0、数値は攻略・検証Wikiの効果量表で照合。スキル一覧の表示用で、チーム日産や料理大成功計算への適用は未対応。


v191：ヘラクロスを追加し、公式Ver.3.3.0告知に合わせて固有メインスキル「ビルドアップ(料理アシストS)」へ紐付け。能力・食材候補は攻略・検証Wikiとポケスリ総合資料サイトで照合し、食材／スキル確率は推定値。画像・フィールド別出現値は未投入。スキルの固有所持種をnativePokemonNosで明記（コピーやゆびをふる等による間接発動の対象とは別）。
寝顔4種は寝顔図鑑/寝顔の一覧のID-1〜4と照合。

## v193：実機のデザート資料
ユーザー提供のIMG_1522〜1527.pngから、全27品の料理名・食材数と表示レベルのエナジーを確認。18品を追加。赤い食材数はユーザーの不足表示であり、必要数としてそのまま採用する。energy.observedは当該レベルでの実機表示値で、Lv.1/Lv.70に換算しない。既存の確認済みmin/maxは保持する。スクショ・料理の絵は公開ファイルへ含めない。

日産予想はホームとボックスで共通の近似計算を使用。発動率、食材枠の等確率、所持数の期待値、げんき回復の期待値に依存する。おてつだいブースト・食材ゲット等による日産の加算、リボン補正、天井・実際の発動時刻は未対応。単体とチームを明示し、スキルの回数と効果量を区別する。

めざましコーヒーの正式名：公式Ver.2.0.0案内 https://www.pokemonsleep.net/news/313835353431303939363634373033343839/ 。食材画像・基礎エナジーは未投入。
