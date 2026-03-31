# KADO - 角でつなぐボードゲーム

iPhone / スマホ / PC で遊べるポリオミノ戦略ボードゲーム。
外部ライブラリ不要。

🎮 Play here: https://tetutetu214.com/game/kado

## 遊び方

### ゲームモード

| モード | 説明 |
|--------|------|
| 1P vs CPU | あなた vs CPU 3体 |
| LOCAL 4P | ローカル対戦（1台で交代プレイ） |
| PERFECT PLACE | 1人パズルモード。4色すべてを操作し、全ピース配置を目指す |
| TETROMINO RECT | テトロミノ長方形パズル。8×10ボードに4色×5種＝20ピースをぴったり敷き詰める |
| CONTINUOUS BATTLE | 連続対戦モード。3 / 5 / 10ラウンドの累計スコアで勝敗を決める |

### ボードサイズ

| サイズ | ピース数/人 | カバー率 | スタイル |
|--------|------------|----------|----------|
| 14×14 | 12（n=1〜4 + ペントミノ3種） | 90% | クイックゲーム |
| 20×20 | 21（n=1〜5、標準） | 89% | スタンダード |
| 24×24 | 28（n=1〜5 + ヘキソミノ7種） | 91% | じっくり戦略戦 |

### キャラクター

16bitピクセルアートのCPU 9体。3体を選んで対戦（同じキャラも選択可）。

| Rank | 名前 | タイプ | キャッチコピー |
|------|------|--------|---------------|
| 1 | BLAZE | 攻撃 | Relentless force |
| 2 | AEGIS | 防御 | Unbreakable wall |
| 3 | CHAOS | 運 | Brilliant madness |
| 4 | SPIKE | 攻撃 | Sharp striker |
| 5 | PROXY | 防御 | Steady shield |
| 6 | GLITCH | 運 | Unpredictable |
| 7 | EMBER | 攻撃 | Fading spark |
| 8 | ECHO | 防御 | Faint signal |
| 9 | FLICKER | 運 | Static noise |

Rank 1が最強。同タイプ内では色の濃さで強さが異なる。

### 操作方法

1. 画面下のピース一覧からピースを選択
2. **↻** 回転 / **↔** 反転
3. ボードをタップして配置（ドットが置ける場所を表示）
4. **UNDO** で直前の1手を取り消し
5. 置けるピースがない場合は自動パス（通知あり）
6. **HOME** でゲームを保存してタイトルへ

### ルール

- 各プレイヤーはポリオミノピースのセットを持つ
- 最初のピースは自分の**コーナー（角）**に置く
- 2手目以降は自分の既存ピースと**角で接する**位置に置く
- 自分のピース同士は**辺で接してはいけない**
- 他プレイヤーのピースとの辺の接触はOK
- 全員がパスしたらゲーム終了

### スコア

- 残ったピースのマス数 × -1点
- 全ピース配置で **+15ボーナス**
- 最高スコアのプレイヤーが勝ち

## 主な機能

- **5種のゲームモード**: 1P vs CPU / LOCAL 4P / PERFECT PLACE / TETROMINO RECT / CONTINUOUS BATTLE
- **3種のボードサイズ**: 14×14 / 20×20 / 24×24（数学的にバランス調整済み）
- **9体のCPUキャラクター**: 攻撃/防御/運の3軸パーソナリティ
- **キャラ別戦績**: 対戦相手ごとの勝率・平均スコアを記録
- **直近10戦グラフ**: 順位とスコアの推移を可視化
- **途中保存・再開**: ブラウザに自動保存、CONTINUEで再開
- **1手戻し（UNDO）**: 直前の配置を取り消し
- **自動パス**: 置けるピースがない場合に自動パス＋通知
- **配置可能ドット**: 実際に置ける場所のみにドットを表示
- **全CPUハイライト**: 直前ラウンドの全CPUの配置を強調
- **ゴーストプレビュー**: ホバー（PC）やドラッグ（スマホ）で配置前プレビュー
- **ネオンアーケードUI**: 90年代ゲーセン風のグローエフェクト
- **NEW RECORD演出**: 最高スコア更新時にネオングロー表示
- **順位付きリザルト**: ゲーム終了時にスコア順で#1〜#4を表示
- **色覚対応**: カラーユニバーサルデザイン準拠のカラーパレット

## アーキテクチャ

```
index.html          ← HTML + CSS + UI（ES module）
js/
  game-logic.js     ← ゲームロジック（DOM非依存、Single Source of Truth）
  test-logic.js     ← モジュール単体テスト（32件）
test.js             ← 統合テスト（79件）
```

ゲームロジックはUIから分離。テスト可能で、将来のiOSアプリ移行時にそのまま再利用可能。

## インフラ・ドメイン構成

### URL構成

| URL | 内容 |
|-----|------|
| `https://tetutetu214.com/game/kado` | KADOゲーム（正式URL） |
| `https://tetutetu214.com/blog` | 技術ブログ（準備中） |
| `https://tetutetu214.com/app/xxx` | 各種アプリ（今後追加予定） |
| `https://kado-game.pages.dev` | 旧URL（引き続きアクセス可能） |

### ドメイン移行の経緯

| 項目 | 移行前 | 移行後 |
|------|--------|--------|
| ドメイン管理 | Xserver（tetutetu.net） | Cloudflare Registrar（tetutetu214.com） |
| DNS管理 | AWS Route 53 | Cloudflare DNS（無料） |
| 年間コスト | 約2,892円 | 約1,621円（約1,271円節約） |

コスト削減・管理の一本化・将来的な拡張性確保を目的にCloudflareへ移行。

### ルーティング構成（Cloudflare Workers）

Cloudflare Workersでパスベースのルーティングを行い、各Cloudflare Pagesに転送している。

```javascript
// /game/kado → kado-game.pages.dev に転送
if (path.startsWith("/game/kado")) {
  const newPath = path.replace("/game/kado", "");
  return fetch("https://kado-game.pages.dev" + (newPath || "/"));
}
```

新しいアプリやサービスを追加する場合は、Workerにルートを1行追記するだけで拡張できる。

## 開発フロー（デプロイ戦略）

### 方針
mainブランチへの直接pushはしない。ブランチ運用とCloudflare Pagesのプレビュー機能を組み合わせてリスクを低減する。

### フロー

```
feature/xxxブランチで作業
        ↓
feature/xxxにpush
        ↓
Cloudflare PagesがプレビューURLを自動生成（本番に影響なし）
        ↓
プレビューURLで動作確認
        ↓
問題なければmainにマージ → 本番（kado-game.pages.dev）に反映
```

### ブランチ命名規則

| プレフィックス | 用途 | 例 |
|---|---|---|
| `feature/` | 新機能追加 | `feature/bmc-widget` |
| `fix/` | バグ修正 | `fix/endgame-rank` |
| `docs/` | ドキュメント更新 | `docs/readme-update` |

### なぜこの構成か
GitHub Actionsを使わずにCI/CDに近い安全性を実現している。Cloudflare Pagesはmainブランチ以外へのpushに対して自動でプレビューデプロイを行う機能を持っており、テスト環境として活用できる。

## ローカルでの実行

ES modulesを使用しているため、HTTPサーバー経由で開く必要があります（file://では動作しません）：

```bash
# Python
python3 -m http.server 9000

# Node.js
npx serve
```

http://localhost:9000 を開く

## テスト

```bash
# 統合テスト
node test.js            # 79件

# モジュール単体テスト
node js/test-logic.js   # 32件
```

## SEO・OGP の仕組み

### なぜ検索に出るのか（SEO）

Googleのクローラー（bot）は定期的にWeb上を巡回し、ページの内容を読み取ってインデックス（データベース）に登録する。検索結果に出るのは「Googleがページの存在を知っていて、内容を理解している」状態。

```
ユーザーが検索
    ↓
Googleのインデックスを参照
    ↓
<title> や <meta name="description"> の内容が一致
    ↓
検索結果に表示される
```

`sitemap.xml` はGoogleに「このURLを優先的にクロールしてほしい」と伝える地図の役割。`robots.txt` はクローラーへの許可証。

### なぜXのリンクプレビューに画像が出るのか（OGP）

OGP（Open Graph Protocol）はFacebookが策定した規格で、SNSがURLをシェアされたときに「どんなタイトル・説明・画像を表示するか」を定義する仕組み。XやSlackも同じ規格を読んでいる。

```
ユーザーがXにURLを貼る
    ↓
XのサーバーがそのURLにアクセス
    ↓
<head> 内の og:title / og:description / og:image を読み取る
    ↓
カード形式のプレビューを生成して表示する
```

つまり、プレビューを作っているのはユーザーのブラウザではなく **XのサーバーがURLを読みに来ている**。だからキャッシュが残ると古い状態が表示され続ける（Twitter Card Validatorでリセット可能）。

### Google Search Console の役割

所有権確認＋サイトマップ送信で「このサイトは自分のものです、クロールしてください」とGoogleに申請した状態になる。Search Consoleでは以下が確認できる。

| 機能 | 内容 |
|------|------|
| カバレッジ | Googleがインデックス済みのページ数 |
| 検索パフォーマンス | どのキーワードで表示・クリックされたか |
| URL検査 | 特定URLのインデックス状況を確認 |

## 技術スタック

- HTML / CSS / JavaScript（ES modules）
- Canvas API によるボード描画
- タッチイベント対応（iPhone Safari / Android Chrome）
- マウスホバープレビュー（PC）
- localStorage によるゲーム保存・戦績記録
- CPU AI: 攻撃/防御/運の3軸による重み付きスコアリング
- カラーユニバーサルデザイン準拠パレット
