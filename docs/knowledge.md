# KADO 開発ナレッジ

開発中の判断・知見・ハマりどころの記録。

## 設計判断

### LOCAL 2P モードの実装方式（2026-06-07）

**決定**: 4人エンジン（4色・4コーナー・4ピースセット、ターン `% 4`）を作り替えず、`teamOf()` でチームに束ねる方式で2人対戦を実装。

- **採用ルール**: 本家ブロックス公式の2人ルール（1人2トレイ・対角2色を担当し盤をフル活用）。見た目は1人1色に統一し、自分のピースは色＝1チームとして一体扱い（自陣同士は辺接触NG・角接触OK、相手とは辺接触OK）。
- **チーム割り当て**: `teamOf(slot) = slot % 2`。P1=チーム0=slot{0,2}（青・角[0,0]と[m,m]）、P2=チーム1=slot{1,3}（橙・角[0,m]と[m,0]）。対角ペア。
- **理由**: コアロジック `js/game-logic.js` と既存テストを無改造で再利用でき低リスク。`teamMode=false` のとき `teamOf` は恒等写像になり4人モードの挙動が完全不変。変更は `canPlace`/`getCornerPositions` の `=== player` を `teamOf(...) === teamOf(player)` に置換する数行＋UI層（`js/main.js`・`index.html`・`en/index.html`）に集中。
- **却下案**: 「2色だけ・2コーナーの純粋1対1」。盤の半分が空く＋エンジン根本作り替えが必要で高コスト。本家ルール（2トレイ）なら20×20でも盤が埋まる。
- **各トレイの初手**: `isFirstMove`/`getStartCorner` はスロット単位のまま据え置き（各トレイが自分の角からスタート）。初手後は同チーム全ピースに角接続できる。
- **配置場所**: 現行メニューは BATTLE→battle-menu サブメニュー（1P vs CPU / LOCAL 4P / CONTINUOUS BATTLE）構成。LOCAL 2P は battle-menu 内（LOCAL 4P の隣）に追加。
- **i18n**: `index.html` と `en/index.html` は同じ `js/main.js` を共有するため、両方に `btn-local-2p` 要素が必要（片方に無いと `getElementById(...).addEventListener` が null で落ち、そのページのイベント登録全体が壊れる）。

**実装ファイル**: `js/game-logic.js`（teamOf追加・state.teamMode・比較置換・exports追加）、`js/main.js`（PLAYERS_LOCAL_2P / startGame・resumeGame・confirmBoardSize分岐 / showSingleGameResult・showScores 2チーム表示 / セーブラベル / イベント登録）、`index.html`・`en/index.html`（battle-menuにボタン）、`js/test-logic.js`（チームモードテスト追加）。

## ハマりどころ

### ローカルmainが本番より70コミット遅れていた事故（2026-06-07）

LOCAL 2P を一度実装してPR #148まで作ったが、**作業開始時に `git fetch` せず、本番(origin/main)より70コミット古いローカルmainからブランチを切っていた**。古い版にはメニューが `1P vs CPU / LOCAL 4P` 直置きの旧構造しかなく、本番にある TUTORIAL・PUZZLE・CONTINUOUS BATTLE・UIロジックの `js/main.js` 分離などが全く無かった。てつてつが「チュートリアルが消えた」と気づいて発覚。本番は無傷。PR #148 はクローズ・ブランチ破棄し、最新mainの上で作り直した（このファイルの実装はその再実装版）。

**教訓**: 作業開始時、特に既存リポジトリの続きをやるときは**必ず最初に `git fetch && git status` でリモートとの整合を確認**してからブランチを切る。`git rev-list --count main..origin/main` で遅れを数えるのが確実。

### Codex委譲時のdiff膨張（初回実装時）

初回はCodexに委譲したが、`index.html`(当時インラインJS)全体を再インデントされ diff が3500行に膨張。`git diff -w` で実変更だけ確認→ `git checkout HEAD` で戻し手で再適用、が必要だった。再実装は self-implement で対応。

## 学習済み概念

理解度テストで確認済みの概念（次回以降スキップ判定に使用）。

- **本家ブロックス2人ルール / チーム方式の本質**（2026-06-07）: 2人対戦でも4色とも盤に出る（1人が2トレイ＝2色を交代で置く）。エンジンを4人のまま `teamOf` で束ねることで既存テストを無改造で再利用できる。トレードオフは各人が2トレイを管理する操作の複雑さ。
- **PR3軸（変更点/技術判断/学び）**（2026-06-07）: 変更点＝自己判定を「スロット番号」から「チーム番号(teamOf)」に変更。技術判断＝`teamMode=false` で `teamOf` を恒等写像にして後方互換を確保。学び＝Codexのdiff膨張は空白ノイズなので `git diff -w` で実変更だけ抽出。全問正答済み。
