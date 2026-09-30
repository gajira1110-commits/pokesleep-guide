# 追加・更新手順（v186）

1. ポケモンはpokemon/<4桁No>/data.jsonを追加。既存レコードの構造に従い、参照する食材・きのみ・スキルを先に登録する。
2. 同じフォルダーへface.webp（一覧）、full.webp（詳細）を配置。png/jpg/jpegも可。各用途は1ファイルのみ。
3. 寝顔はdata.jsonのsleepStylesに定義したIDと一致するsleep/<ID>.webpへ配置。
4. 食材・きのみはそれぞれのIDフォルダーにdata.jsonとicon.webpを配置。タイプはtypes/manifest.jsonのID、得意はspecialtiesの既存IDを使う。
5. python3 PSG_audit_icons.pyで登録状況、python3 PSG_build_master.pyで参照を検査してreview.htmlを生成する。
6. 確認はフォルダー一式をHTTPで配信する。HTML単体を渡すと画像は欠ける。

GitHub反映は現在停止。再開後は変更したソース・画像だけ反映し、Actionsで生成・公開する。新しい特殊効果はデータだけでなく処理の追加も必要。
