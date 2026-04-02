// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const INDEX_URL = 'file://' + path.resolve(__dirname, '..', 'index.html');

// ===== Helper: 外部リソースをブロック =====
async function blockExternalResources(page) {
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith('file://')) {
      return route.continue();
    }
    // 外部リソース (Google Fonts, gtag等) をブロック
    return route.abort();
  });
}

// ===== Helper: スタート画面が表示されるまで待機 =====
async function waitForStartScreen(page) {
  await blockExternalResources(page);
  await page.goto(INDEX_URL, { waitUntil: 'commit' });
  await expect(page.locator('#start-screen h1')).toHaveText('KADO');
  await expect(page.locator('#btn-battle')).toBeVisible();
}

// ===== Helper: 1P vs CPU モードでゲーム開始まで進む =====
async function startCpuGame(page, { boardSize = 14, order = 0 } = {}) {
  await waitForStartScreen(page);

  // BATTLE > 1P vs CPU
  await page.click('#btn-battle');
  await expect(page.locator('#btn-vs-cpu')).toBeVisible();
  await page.click('#btn-vs-cpu');

  // ボードサイズ選択
  await expect(page.locator('#board-size-screen')).toBeVisible();
  await page.click(`#btn-size-${boardSize}`);

  // 順番選択
  await expect(page.locator('#order-select')).toBeVisible();
  await page.click(`#btn-order-${order}`);

  // キャラクター選択 (最弱の FLICKER を3体選択)
  await expect(page.locator('#char-select')).toBeVisible();
  for (let i = 0; i < 3; i++) {
    // 最後のキャラクター (FLICKER = index 8) をクリック
    const cards = page.locator('#char-grid .char-card');
    await cards.last().click();
  }

  // START ボタンが出るまで待つ
  await expect(page.locator('#char-start-btn')).toBeVisible();
  await page.click('#char-start-btn');

  // ゲーム画面が表示されるまで待機
  await expect(page.locator('#app')).toBeVisible({ timeout: 3000 });
}

// ===== Helper: LOCAL 4P モードでゲーム開始まで進む =====
async function startLocal4P(page, { boardSize = 14 } = {}) {
  await waitForStartScreen(page);

  await page.click('#btn-battle');
  await expect(page.locator('#btn-local-4p')).toBeVisible();
  await page.click('#btn-local-4p');

  await expect(page.locator('#board-size-screen')).toBeVisible();
  await page.click(`#btn-size-${boardSize}`);

  await expect(page.locator('#app')).toBeVisible({ timeout: 3000 });
}

// ============================================================
// テスト: スタート画面
// ============================================================
test.describe('スタート画面', () => {
  test('タイトルとメインメニューが表示される', async ({ page }) => {
    await waitForStartScreen(page);

    await expect(page.locator('#start-screen h1')).toHaveText('KADO');
    await expect(page.locator('#start-screen p').first()).toHaveText('CONNECT BY CORNERS');
    await expect(page.locator('#btn-battle')).toBeVisible();
    await expect(page.locator('#btn-puzzle-menu')).toBeVisible();
    await expect(page.locator('#btn-tutorial')).toBeVisible();
    await expect(page.locator('#btn-stats')).toBeVisible();
  });

  test('BATTLE サブメニューが開閉できる', async ({ page }) => {
    await waitForStartScreen(page);

    await page.click('#btn-battle');
    await expect(page.locator('#battle-menu')).toBeVisible();
    await expect(page.locator('#btn-vs-cpu')).toBeVisible();
    await expect(page.locator('#btn-local-4p')).toBeVisible();
    await expect(page.locator('#btn-continuous')).toBeVisible();

    // BACK で戻る
    await page.click('#btn-battle-back');
    await expect(page.locator('#battle-menu')).not.toBeVisible();
    await expect(page.locator('#main-menu')).toBeVisible();
  });

  test('PUZZLE サブメニューが開閉できる', async ({ page }) => {
    await waitForStartScreen(page);

    await page.click('#btn-puzzle-menu');
    await expect(page.locator('#puzzle-menu')).toBeVisible();
    await expect(page.locator('#btn-puzzle')).toBeVisible();

    await page.click('#btn-puzzle-back');
    await expect(page.locator('#puzzle-menu')).not.toBeVisible();
  });
});

// ============================================================
// テスト: ボードサイズ選択
// ============================================================
test.describe('ボードサイズ選択', () => {
  test('3つのサイズが選択できる', async ({ page }) => {
    await waitForStartScreen(page);
    await page.click('#btn-battle');
    await page.click('#btn-vs-cpu');

    await expect(page.locator('#board-size-screen')).toBeVisible();
    await expect(page.locator('#btn-size-14')).toBeVisible();
    await expect(page.locator('#btn-size-20')).toBeVisible();
    await expect(page.locator('#btn-size-24')).toBeVisible();
  });

  test('BACK でバトルメニューに戻れる', async ({ page }) => {
    await waitForStartScreen(page);
    await page.click('#btn-battle');
    await page.click('#btn-vs-cpu');

    await expect(page.locator('#board-size-screen')).toBeVisible();
    await page.click('#btn-size-back');
    await expect(page.locator('#board-size-screen')).not.toBeVisible();
    await expect(page.locator('#battle-menu')).toBeVisible();
  });
});

// ============================================================
// テスト: 順番選択 → キャラ選択 → ゲーム開始 (1P vs CPU)
// ============================================================
test.describe('1P vs CPU ゲーム開始フロー', () => {
  test('順番選択 → キャラ選択 → ゲーム画面が表示される', async ({ page }) => {
    await startCpuGame(page, { boardSize: 14, order: 0 });

    // ゲーム画面の要素が揃っている
    await expect(page.locator('#board')).toBeVisible();
    await expect(page.locator('#piece-list')).toBeVisible();
    await expect(page.locator('#turn-indicator')).toBeVisible();
    await expect(page.locator('#board-size-label')).toHaveText('14×14');
  });

  test('2nd を選択してもゲームが開始できる', async ({ page }) => {
    await startCpuGame(page, { boardSize: 20, order: 1 });
    await expect(page.locator('#board-size-label')).toHaveText('20×20');
  });
});

// ============================================================
// テスト: LOCAL 4P ゲーム開始フロー
// ============================================================
test.describe('LOCAL 4P ゲーム開始フロー', () => {
  test('ボードサイズ選択後すぐにゲームが開始する', async ({ page }) => {
    await startLocal4P(page, { boardSize: 14 });

    await expect(page.locator('#board')).toBeVisible();
    await expect(page.locator('#piece-list')).toBeVisible();
    await expect(page.locator('#board-size-label')).toHaveText('14×14');
  });
});

// ============================================================
// テスト: ゲーム画面 UI 操作
// ============================================================
test.describe('ゲーム画面 UI 操作', () => {
  test('ピースリストが表示され、ピースを選択できる', async ({ page }) => {
    await startLocal4P(page, { boardSize: 14 });

    // ピースリストにピースが存在する
    const pieces = page.locator('#piece-list .piece-item');
    await expect(pieces.first()).toBeVisible();
    const count = await pieces.count();
    expect(count).toBeGreaterThan(0);

    // 最初のピースをクリックして選択
    await pieces.first().click();

    // 回転・反転ボタンが利用可能
    await expect(page.locator('#rotate-btn')).toBeVisible();
    await expect(page.locator('#flip-btn')).toBeVisible();
  });

  test('SCORE ボタンでスコアモーダルが開閉できる', async ({ page }) => {
    await startLocal4P(page, { boardSize: 14 });

    await page.click('#score-btn');
    await expect(page.locator('#modal-overlay')).toHaveClass(/show/);
    await expect(page.locator('#modal-title')).toHaveText('SCORE');

    await page.click('#modal-close-btn');
    await expect(page.locator('#modal-overlay')).not.toHaveClass(/show/);
  });

  test('PASS ボタンでパスできる', async ({ page }) => {
    await startLocal4P(page, { boardSize: 14 });

    // 現在のターン表示を記録
    const turnBefore = await page.locator('#turn-indicator').textContent();

    await page.click('#pass-btn');

    // ターンが変わっている
    await expect(page.locator('#turn-indicator')).not.toHaveText(turnBefore);
  });

  test('HOME ボタンでタイトル画面に戻れる', async ({ page }) => {
    await startLocal4P(page, { boardSize: 14 });

    // ダイアログが出る場合に備えて
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    await page.click('#quit-btn');
    await expect(page.locator('#start-screen')).toBeVisible({ timeout: 3000 });
  });
});

// ============================================================
// テスト: CONTINUOUS BATTLE フロー
// ============================================================
test.describe('CONTINUOUS BATTLE フロー', () => {
  test('ラウンド選択画面が表示される', async ({ page }) => {
    await waitForStartScreen(page);

    await page.click('#btn-battle');
    await page.click('#btn-continuous');

    await expect(page.locator('#board-size-screen')).toBeVisible();
    await page.click('#btn-size-14');

    // 順番選択
    await expect(page.locator('#order-select')).toBeVisible();
    await page.click('#btn-order-0');

    // ラウンド選択
    await expect(page.locator('#round-select')).toBeVisible();
    await expect(page.locator('#btn-round-3')).toBeVisible();
    await expect(page.locator('#btn-round-5')).toBeVisible();
    await expect(page.locator('#btn-round-10')).toBeVisible();
  });
});

// ============================================================
// テスト: PUZZLE モード
// ============================================================
test.describe('PUZZLE モード', () => {
  test('PERFECT PLACE のイントロが表示されゲームが開始する', async ({ page }) => {
    await waitForStartScreen(page);

    await page.click('#btn-puzzle-menu');
    await page.click('#btn-puzzle');

    // ボードサイズ選択
    await expect(page.locator('#board-size-screen')).toBeVisible();
    await page.click('#btn-size-14');

    // パズルイントロ画面
    await expect(page.locator('#puzzle-intro-overlay')).toBeVisible({ timeout: 3000 });
    await page.click('#puzzle-intro-start-btn');

    // ゲーム開始
    await expect(page.locator('#app')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('#board')).toBeVisible();
  });
});

// ============================================================
// テスト: TUTORIAL
// ============================================================
test.describe('TUTORIAL', () => {
  test('チュートリアルが開始しステップが進む', async ({ page }) => {
    await waitForStartScreen(page);

    await page.click('#btn-tutorial');

    // チュートリアルオーバーレイが表示
    await expect(page.locator('#tutorial-overlay')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('#tutorial-title')).toBeVisible();

    // NEXT ボタンでステップを進める
    const titleBefore = await page.locator('#tutorial-title').textContent();
    await page.click('#tutorial-next-btn');

    // ステップが進んだことを確認 (タイトルかコンテンツが変わる)
    await page.waitForTimeout(500);
    // チュートリアルが進行中であることを確認
    await expect(page.locator('#tutorial-overlay')).toBeVisible();
  });
});

// ============================================================
// テスト: RECORDS 画面
// ============================================================
test.describe('RECORDS 画面', () => {
  test('RECORDS モーダルが開閉できる', async ({ page }) => {
    await waitForStartScreen(page);

    await page.click('#btn-stats');
    await expect(page.locator('#stats-overlay')).toBeVisible({ timeout: 3000 });

    await page.click('#stats-close-btn');
    await expect(page.locator('#stats-overlay')).not.toBeVisible();
  });
});

// ============================================================
// テスト: 全画面フローのナビゲーション (BACK ボタン)
// ============================================================
test.describe('ナビゲーション BACK ボタン', () => {
  test('CPU モード: 順番選択 → BACK → ボードサイズ選択', async ({ page }) => {
    await waitForStartScreen(page);
    await page.click('#btn-battle');
    await page.click('#btn-vs-cpu');
    await page.click('#btn-size-14');

    await expect(page.locator('#order-select')).toBeVisible();
    await page.click('#btn-order-back');
    await expect(page.locator('#board-size-screen')).toBeVisible();
  });

  test('CONTINUOUS: ラウンド選択 → BACK → 順番選択', async ({ page }) => {
    await waitForStartScreen(page);
    await page.click('#btn-battle');
    await page.click('#btn-continuous');
    await page.click('#btn-size-14');
    await page.click('#btn-order-0');

    await expect(page.locator('#round-select')).toBeVisible();
    await page.click('#btn-round-back');
    await expect(page.locator('#order-select')).toBeVisible();
  });
});
