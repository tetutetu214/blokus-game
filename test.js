// ブロックス ゲームロジック テスト (Node.js)
const BOARD_SIZE = 20;

function rotateCW(shape) {
  return shape.map(([r, c]) => [c, -r]);
}

function flipH(shape) {
  return shape.map(([r, c]) => [r, -c]);
}

function normalize(shape) {
  const minR = Math.min(...shape.map(s => s[0]));
  const minC = Math.min(...shape.map(s => s[1]));
  return shape.map(([r, c]) => [r - minR, c - minC]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

function getAllOrientations(shape) {
  const orientations = [];
  const seen = new Set();
  let s = shape.map(c => [...c]);
  for (let flip = 0; flip < 2; flip++) {
    for (let rot = 0; rot < 4; rot++) {
      const norm = normalize(s);
      const key = JSON.stringify(norm);
      if (!seen.has(key)) {
        seen.add(key);
        orientations.push(norm);
      }
      s = rotateCW(s);
    }
    s = flipH(shape.map(c => [...c]));
  }
  return orientations;
}

function isFirstMove(board, player) {
  for (let r = 0; r < BOARD_SIZE; r++)
    for (let c = 0; c < BOARD_SIZE; c++)
      if (board[r][c] === player) return false;
  return true;
}

function getStartCorner(player) {
  const corners = [[0,0],[0,BOARD_SIZE-1],[BOARD_SIZE-1,BOARD_SIZE-1],[BOARD_SIZE-1,0]];
  return corners[player];
}

function canPlace(board, player, shape, br, bc) {
  const cells = shape.map(([dr, dc]) => [br + dr, bc + dc]);
  for (const [r, c] of cells) {
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return false;
    if (board[r][c] >= 0) return false;
  }
  for (const [r, c] of cells) {
    const adj = [[r-1,c],[r+1,c],[r,c-1],[r,c+1]];
    for (const [ar, ac] of adj) {
      if (ar >= 0 && ar < BOARD_SIZE && ac >= 0 && ac < BOARD_SIZE) {
        if (board[ar][ac] === player) return false;
      }
    }
  }
  if (isFirstMove(board, player)) {
    const [sr, sc] = getStartCorner(player);
    return cells.some(([r, c]) => r === sr && c === sc);
  }
  for (const [r, c] of cells) {
    const diag = [[r-1,c-1],[r-1,c+1],[r+1,c-1],[r+1,c+1]];
    for (const [dr, dc] of diag) {
      if (dr >= 0 && dr < BOARD_SIZE && dc >= 0 && dc < BOARD_SIZE) {
        if (board[dr][dc] === player) return true;
      }
    }
  }
  return false;
}

function placePiece(board, player, shape, br, bc) {
  shape.forEach(([dr, dc]) => {
    board[br + dr][bc + dc] = player;
  });
}

function getScore(playerPieces, player) {
  const pieces = playerPieces[player];
  let total = 0;
  pieces.forEach(p => {
    if (!p.used) total -= p.shape.length;
  });
  const allUsed = pieces.every(p => p.used);
  if (allUsed) total += 15;
  return total;
}

function makeBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(-1));
}

const PIECE_SHAPES = [
  [[0,0]],
  [[0,0],[1,0]],
  [[0,0],[1,0],[2,0]],
  [[0,0],[1,0],[1,1]],
  [[0,0],[1,0],[2,0],[3,0]],
  [[0,0],[1,0],[2,0],[2,1]],
  [[0,0],[1,0],[2,0],[1,1]],
  [[0,0],[1,0],[0,1],[1,1]],
  [[0,0],[1,0],[1,1],[2,1]],
  [[0,0],[1,0],[2,0],[3,0],[4,0]],
  [[0,0],[1,0],[2,0],[3,0],[3,1]],
  [[0,0],[1,0],[2,0],[3,0],[2,1]],
  [[0,0],[0,1],[1,0],[1,1],[2,0]],
  [[0,0],[1,0],[2,0],[2,1],[3,1]],
  [[0,0],[1,0],[2,0],[2,1],[2,2]],
  [[0,0],[1,0],[2,0],[0,1],[2,1]],
  [[0,0],[1,0],[2,0],[1,1],[1,2]],
  [[0,0],[1,0],[1,1],[2,1],[2,2]],
  [[0,0],[1,0],[1,1],[1,2],[2,2]],
  [[0,0],[1,0],[1,1],[2,1],[1,2]],
  [[0,1],[1,0],[1,1],[1,2],[2,1]],
];

// ===== テストランナー =====
let pass = 0, fail = 0;
function assert(name, condition) {
  if (condition) {
    console.log(`  \x1b[32mPASS\x1b[0m ${name}`);
    pass++;
  } else {
    console.log(`  \x1b[31mFAIL\x1b[0m ${name}`);
    fail++;
  }
}
function section(name) { console.log(`\n\x1b[33m${name}\x1b[0m`); }
function arrEq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// ===== テスト =====

section('rotateCW (時計回り回転)');
assert('1マスピースは回転しても変わらない', arrEq(rotateCW([[0,0]]), [[0,0]]));
assert('横棒を回転', arrEq(rotateCW([[0,0],[1,0]]), [[0,0],[0,-1]]));
assert('L字を回転', arrEq(rotateCW([[0,0],[1,0],[1,1]]), [[0,0],[0,-1],[1,-1]]));

section('flipH (左右反転)');
assert('1マスピースは変わらない', arrEq(flipH([[0,0]]), [[0,0]]));
assert('L字を反転', arrEq(flipH([[0,0],[1,0],[1,1]]), [[0,0],[1,0],[1,-1]]));

section('normalize (正規化)');
assert('負の座標を正規化', arrEq(normalize([[0,-1],[0,0],[1,0]]), [[0,0],[0,1],[1,1]]));
assert('ソート順が正しい', arrEq(normalize([[1,0],[0,1],[0,0]]), [[0,0],[0,1],[1,0]]));
assert('大きなオフセットを正規化', arrEq(normalize([[5,5],[5,6]]), [[0,0],[0,1]]));

section('getAllOrientations (全方向取得)');
assert('1マスピース → 1方向', getAllOrientations([[0,0]]).length === 1);
assert('2マス棒 → 2方向', getAllOrientations([[0,0],[1,0]]).length === 2);
assert('正方形2x2 → 1方向', getAllOrientations([[0,0],[1,0],[0,1],[1,1]]).length === 1);
assert('L字 → 4方向', getAllOrientations([[0,0],[1,0],[1,1]]).length === 4);
assert('3マス棒 → 2方向', getAllOrientations([[0,0],[1,0],[2,0]]).length === 2);
assert('T字 → 4方向', getAllOrientations([[0,0],[1,0],[2,0],[1,1]]).length === 4);
assert('S字 → 4方向', getAllOrientations([[0,0],[1,0],[1,1],[2,1]]).length === 4);

section('isFirstMove (初手判定)');
{
  const b = makeBoard();
  assert('空ボード → プレイヤー0は初手', isFirstMove(b, 0));
  b[0][0] = 0;
  assert('配置後 → プレイヤー0は初手でない', !isFirstMove(b, 0));
  assert('配置後 → プレイヤー1はまだ初手', isFirstMove(b, 1));
}

section('getStartCorner (開始コーナー)');
assert('P0 → [0,0]', arrEq(getStartCorner(0), [0,0]));
assert('P1 → [0,19]', arrEq(getStartCorner(1), [0,19]));
assert('P2 → [19,19]', arrEq(getStartCorner(2), [19,19]));
assert('P3 → [19,0]', arrEq(getStartCorner(3), [19,0]));

section('canPlace - 初手配置');
{
  const b = makeBoard();
  assert('コーナーに1マス配置OK', canPlace(b, 0, [[0,0]], 0, 0));
  assert('コーナー以外に配置NG', !canPlace(b, 0, [[0,0]], 1, 1));
  assert('L字をコーナー含む位置に配置OK', canPlace(b, 0, [[0,0],[1,0],[1,1]], 0, 0));
  assert('P1のコーナーに配置OK', canPlace(b, 1, [[0,0]], 0, 19));
  assert('ボード外にはみ出すNG', !canPlace(b, 0, [[0,0],[1,0]], -1, 0));
}

section('canPlace - 2手目以降');
{
  const b = makeBoard();
  b[0][0] = 0;
  assert('角で接する[1,1]に配置OK', canPlace(b, 0, [[0,0]], 1, 1));
  assert('辺で接する[1,0]に配置NG', !canPlace(b, 0, [[0,0]], 1, 0));
  assert('辺で接する[0,1]に配置NG', !canPlace(b, 0, [[0,0]], 0, 1));
  assert('角でも辺でもない[2,2]に配置NG', !canPlace(b, 0, [[0,0]], 2, 2));
  assert('既存セルに配置NG', !canPlace(b, 0, [[0,0]], 0, 0));
}

section('canPlace - 複数マスピース');
{
  const b = makeBoard();
  b[0][0] = 0;
  assert('L字が角接触する配置OK', canPlace(b, 0, [[0,0],[0,1],[1,0]], 1, 1));
  assert('ピースの一部が辺で接する配置NG', !canPlace(b, 0, [[0,0],[0,1]], 0, 1));
  assert('ボード端ではみ出す配置NG', !canPlace(b, 0, [[0,0],[1,0]], 19, 19));
}

section('canPlace - 他プレイヤーとの干渉');
{
  const b = makeBoard();
  b[0][0] = 0;
  b[0][19] = 1;
  assert('他プレイヤー占有セルには置けない', !canPlace(b, 0, [[0,0]], 0, 19));
  assert('自分の角接触あれば配置OK', canPlace(b, 0, [[0,0]], 1, 1));
}

section('placePiece (ピース配置)');
{
  const b = makeBoard();
  placePiece(b, 0, [[0,0],[1,0],[1,1]], 0, 0);
  assert('[0,0] がP0', b[0][0] === 0);
  assert('[1,0] がP0', b[1][0] === 0);
  assert('[1,1] がP0', b[1][1] === 0);
  assert('[0,1] は空', b[0][1] === -1);
}

section('getScore (スコア計算)');
{
  const pp = [PIECE_SHAPES.map(s => ({ shape: s.map(c => [...c]), used: false }))];
  assert('全未使用 → -89点', getScore(pp, 0) === -89);

  const ppAll = [PIECE_SHAPES.map(s => ({ shape: s.map(c => [...c]), used: true }))];
  assert('全使用済 → +15点', getScore(ppAll, 0) === 15);

  const ppPartial = [PIECE_SHAPES.map((s, i) => ({ shape: s.map(c => [...c]), used: i < 2 }))];
  assert('1マス+2マスのみ使用 → -86点', getScore(ppPartial, 0) === -86);

  const ppAlmost = [PIECE_SHAPES.map((s, i) => ({ shape: s.map(c => [...c]), used: i > 0 }))];
  assert('1マスだけ未使用 → -1点', getScore(ppAlmost, 0) === -1);
}

section('統合テスト: 回転後の配置');
{
  const b = makeBoard();
  const rotated = normalize(rotateCW([[0,0],[1,0],[1,1]]));
  assert('回転後L字がコーナーに配置OK', canPlace(b, 0, rotated, 0, 0));
}

section('統合テスト: 連続配置');
{
  const b = makeBoard();
  placePiece(b, 0, [[0,0]], 0, 0);
  assert('2手目 [1,1] に配置可能', canPlace(b, 0, [[0,0]], 1, 1));
  placePiece(b, 0, [[0,0]], 1, 1);
  assert('3手目 [2,2] に配置可能', canPlace(b, 0, [[0,0]], 2, 2));
  assert('辺接触 [2,1] はNG', !canPlace(b, 0, [[0,0]], 2, 1));
}

section('ピース定義の検証');
assert('ピース数は21個', PIECE_SHAPES.length === 21);
assert('1マスピースは1個', PIECE_SHAPES.filter(s => s.length === 1).length === 1);
assert('2マスピースは1個', PIECE_SHAPES.filter(s => s.length === 2).length === 1);
assert('3マスピースは2個', PIECE_SHAPES.filter(s => s.length === 3).length === 2);
assert('4マスピースは5個', PIECE_SHAPES.filter(s => s.length === 4).length === 5);
assert('5マスピースは12個', PIECE_SHAPES.filter(s => s.length === 5).length === 12);
assert('合計マス数は89', PIECE_SHAPES.reduce((sum, s) => sum + s.length, 0) === 89);

// ===== 14x14 ボードサイズテスト =====
const PIECES_14 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

section('14x14 ピースセットの検証');
{
  const pieces14 = PIECES_14.map(i => PIECE_SHAPES[i]);
  assert('14x14ピース数は12個', pieces14.length === 12);
  const totalSquares = pieces14.reduce((sum, s) => sum + s.length, 0);
  assert('14x14 合計マス数は44', totalSquares === 44);
  assert('14x14 カバー率は約89%', Math.abs((totalSquares * 4) / (14 * 14) - 0.898) < 0.01);
  assert('14x14 n=1含む', pieces14.some(s => s.length === 1));
  assert('14x14 n=2含む', pieces14.some(s => s.length === 2));
  assert('14x14 n=3含む', pieces14.some(s => s.length === 3));
  assert('14x14 n=4含む', pieces14.some(s => s.length === 4));
  assert('14x14 n=5含む', pieces14.some(s => s.length === 5));
}

section('14x14 配置テスト');
{
  const BS14 = 14;
  function makeBoard14() { return Array.from({ length: BS14 }, () => Array(BS14).fill(-1)); }
  function canPlace14(board, player, shape, br, bc) {
    const cells = shape.map(([dr, dc]) => [br + dr, bc + dc]);
    for (const [r, c] of cells) {
      if (r < 0 || r >= BS14 || c < 0 || c >= BS14) return false;
      if (board[r][c] >= 0) return false;
    }
    for (const [r, c] of cells) {
      const adj = [[r-1,c],[r+1,c],[r,c-1],[r,c+1]];
      for (const [ar, ac] of adj) {
        if (ar >= 0 && ar < BS14 && ac >= 0 && ac < BS14 && board[ar][ac] === player) return false;
      }
    }
    const isFirst = !board.some(row => row.some(v => v === player));
    if (isFirst) {
      const m = BS14 - 1;
      const corners = [[0,0],[0,m],[m,m],[m,0]];
      const [sr, sc] = corners[player];
      return cells.some(([r, c]) => r === sr && c === sc);
    }
    return cells.some(([r, c]) => {
      const diag = [[r-1,c-1],[r-1,c+1],[r+1,c-1],[r+1,c+1]];
      return diag.some(([dr, dc]) => dr >= 0 && dr < BS14 && dc >= 0 && dc < BS14 && board[dr][dc] === player);
    });
  }
  const b14 = makeBoard14();
  assert('14x14 P0コーナー[0,0]に配置OK', canPlace14(b14, 0, [[0,0]], 0, 0));
  assert('14x14 P1コーナー[0,13]に配置OK', canPlace14(b14, 1, [[0,0]], 0, 13));
  assert('14x14 P2コーナー[13,13]に配置OK', canPlace14(b14, 2, [[0,0]], 13, 13));
  assert('14x14 P3コーナー[13,0]に配置OK', canPlace14(b14, 3, [[0,0]], 13, 0));
  assert('14x14 ボード外[0,14]はNG', !canPlace14(b14, 0, [[0,0]], 0, 14));
  assert('14x14 ボード外[14,0]はNG', !canPlace14(b14, 0, [[0,0]], 14, 0));
}

// ===== 24x24 ボードサイズテスト =====
const HEXOMINOES = [
  [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0]],
  [[0,0],[1,0],[2,0],[3,0],[4,0],[4,1]],
  [[0,0],[1,0],[2,0],[3,0],[4,0],[2,1]],
  [[0,0],[1,0],[2,0],[2,1],[3,1],[4,1]],
  [[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],
  [[0,0],[1,0],[2,0],[3,0],[4,0],[1,1]],
  [[0,0],[1,0],[1,1],[2,1],[2,2],[3,2]],
];
const PIECES_24 = [];
for (let i = 0; i < 28; i++) PIECES_24.push(i);
const ALL_SHAPES_24 = PIECE_SHAPES.concat(HEXOMINOES);

section('24x24 ピースセットの検証');
{
  const pieces24 = PIECES_24.map(i => ALL_SHAPES_24[i]);
  assert('24x24ピース数は28個', pieces24.length === 28);
  const totalSquares = pieces24.reduce((sum, s) => sum + s.length, 0);
  assert('24x24 合計マス数は131', totalSquares === 131);
  const coverage = (totalSquares * 4) / (24 * 24);
  assert('24x24 カバー率は約91%', coverage > 0.89 && coverage < 0.93);
  assert('24x24 ヘキソミノ7種含む', pieces24.filter(s => s.length === 6).length === 7);
  assert('24x24 全ヘキソミノは6マス', HEXOMINOES.every(h => h.length === 6));
}

section('24x24 配置テスト');
{
  const BS24 = 24;
  function makeBoard24() { return Array.from({ length: BS24 }, () => Array(BS24).fill(-1)); }
  function canPlace24(board, player, shape, br, bc) {
    const cells = shape.map(([dr, dc]) => [br + dr, bc + dc]);
    for (const [r, c] of cells) {
      if (r < 0 || r >= BS24 || c < 0 || c >= BS24) return false;
      if (board[r][c] >= 0) return false;
    }
    for (const [r, c] of cells) {
      const adj = [[r-1,c],[r+1,c],[r,c-1],[r,c+1]];
      for (const [ar, ac] of adj) {
        if (ar >= 0 && ar < BS24 && ac >= 0 && ac < BS24 && board[ar][ac] === player) return false;
      }
    }
    const isFirst = !board.some(row => row.some(v => v === player));
    if (isFirst) {
      const m = BS24 - 1;
      const corners = [[0,0],[0,m],[m,m],[m,0]];
      const [sr, sc] = corners[player];
      return cells.some(([r, c]) => r === sr && c === sc);
    }
    return cells.some(([r, c]) => {
      const diag = [[r-1,c-1],[r-1,c+1],[r+1,c-1],[r+1,c+1]];
      return diag.some(([dr, dc]) => dr >= 0 && dr < BS24 && dc >= 0 && dc < BS24 && board[dr][dc] === player);
    });
  }
  const b24 = makeBoard24();
  assert('24x24 P0コーナー[0,0]に配置OK', canPlace24(b24, 0, [[0,0]], 0, 0));
  assert('24x24 P2コーナー[23,23]に配置OK', canPlace24(b24, 2, [[0,0]], 23, 23));
  assert('24x24 ボード外[0,24]はNG', !canPlace24(b24, 0, [[0,0]], 0, 24));
  assert('24x24 I6ヘキソミノ配置OK', canPlace24(b24, 0, HEXOMINOES[0], 0, 0));
}

// ===== 結果 =====
console.log(`\n${'='.repeat(40)}`);
if (fail === 0) {
  console.log(`\x1b[32m全テスト合格: ${pass}/${pass + fail}\x1b[0m`);
} else {
  console.log(`\x1b[31mテスト失敗あり: PASS=${pass} FAIL=${fail}\x1b[0m`);
}
process.exit(fail > 0 ? 1 : 0);
