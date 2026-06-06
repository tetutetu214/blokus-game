// Test for game-logic.js module (run with: node --experimental-vm-modules js/test-logic.js)
// Or use dynamic import

let pass = 0, fail = 0;
function assert(name, condition) {
  if (condition) { pass++; console.log('  \x1b[32mPASS\x1b[0m ' + name); }
  else { fail++; console.log('  \x1b[31mFAIL\x1b[0m ' + name); }
}
function section(name) { console.log('\n\x1b[33m' + name + '\x1b[0m'); }

async function runTests() {
  const GL = await import('./game-logic.js');

  // Setup a mock state
  function makeState(boardSize) {
    return {
      BOARD_SIZE: boardSize,
      board: Array.from({ length: boardSize }, () => Array(boardSize).fill(-1)),
      playerPieces: [],
      lastPlacedCells: [[], [], [], []],
    };
  }

  section('Module exports');
  assert('PIECE_SHAPES exported', GL.PIECE_SHAPES.length === 28);
  assert('Standard pieces = 21', GL.PIECE_SHAPES.slice(0, 21).length === 21);
  assert('PIECES_14 exported', GL.PIECES_14.length === 12);
  assert('PIECES_24 exported', GL.PIECES_24.length === 28);
  assert('setGameState is function', typeof GL.setGameState === 'function');

  section('Pure functions (no state needed)');
  assert('rotateCW', GL.rotateCW([[0,0],[1,0]]).length === 2);
  assert('flipH', GL.flipH([[0,0],[1,0]]).length === 2);
  assert('normalize', GL.normalize([[1,1],[0,0]])[0][0] === 0);
  assert('getAllOrientations 1-cell = 1', GL.getAllOrientations([[0,0]]).length === 1);
  assert('getAllOrientations 2-cell = 2', GL.getAllOrientations([[0,0],[1,0]]).length === 2);

  section('20x20 placement');
  {
    const s = makeState(20);
    GL.setGameState(s);
    assert('isFirstMove P0 = true', GL.isFirstMove(0));
    assert('getStartCorner P0 = [0,0]', JSON.stringify(GL.getStartCorner(0)) === '[0,0]');
    assert('getStartCorner P1 = [0,19]', JSON.stringify(GL.getStartCorner(1)) === '[0,19]');
    assert('canPlace at corner OK', GL.canPlace(0, [[0,0]], 0, 0));
    assert('canPlace off corner NG', !GL.canPlace(0, [[0,0]], 5, 5));
    GL.placePiece(0, [[0,0]], 0, 0);
    assert('board[0][0] = 0 after place', s.board[0][0] === 0);
    assert('isFirstMove P0 = false after place', !GL.isFirstMove(0));
    assert('diagonal [1,1] OK', GL.canPlace(0, [[0,0]], 1, 1));
    assert('edge [1,0] NG', !GL.canPlace(0, [[0,0]], 1, 0));
  }

  section('14x14 placement');
  {
    const s = makeState(14);
    GL.setGameState(s);
    assert('14x14 corner P0 = [0,0]', JSON.stringify(GL.getStartCorner(0)) === '[0,0]');
    assert('14x14 corner P2 = [13,13]', JSON.stringify(GL.getStartCorner(2)) === '[13,13]');
    assert('14x14 canPlace at [0,0] OK', GL.canPlace(0, [[0,0]], 0, 0));
    assert('14x14 out of bounds [0,14] NG', !GL.canPlace(0, [[0,0]], 0, 14));
  }

  section('24x24 placement');
  {
    const s = makeState(24);
    GL.setGameState(s);
    assert('24x24 corner P2 = [23,23]', JSON.stringify(GL.getStartCorner(2)) === '[23,23]');
    assert('24x24 I6 at [0,0] OK', GL.canPlace(0, GL.PIECE_SHAPES[21], 0, 0));
  }

  section('getScore');
  {
    const s = makeState(20);
    s.playerPieces = [GL.PIECE_SHAPES.slice(0, 21).map(sh => ({ shape: sh.map(c => [...c]), used: false }))];
    GL.setGameState(s);
    assert('all unused = -89', GL.getScore(0) === -89);
    s.playerPieces[0].forEach(p => p.used = true);
    assert('all used = +15', GL.getScore(0) === 15);
  }

  section('hasValidMove');
  {
    const s = makeState(20);
    s.playerPieces = [GL.PIECE_SHAPES.slice(0, 21).map(sh => ({ shape: sh.map(c => [...c]), used: false }))];
    GL.setGameState(s);
    assert('has valid move at start', GL.hasValidMove(0));
  }

  section('cpuMove');
  {
    const s = makeState(20);
    s.playerPieces = [
      GL.PIECE_SHAPES.slice(0, 21).map(sh => ({ shape: sh.map(c => [...c]), used: false })),
      GL.PIECE_SHAPES.slice(0, 21).map(sh => ({ shape: sh.map(c => [...c]), used: false })),
    ];
    GL.setGameState(s);
    const params = { sizeWeight: 10, cornerWeight: 3, centerWeight: 2, blockWeight: 2, randomness: 0 };
    const move = GL.cpuMove(0, params);
    assert('cpuMove returns a move', move !== null);
    assert('move has idx', typeof move.idx === 'number');
    assert('move has shape', Array.isArray(move.shape));
    assert('move has br/bc', typeof move.br === 'number' && typeof move.bc === 'number');
  }


  section('LOCAL 2P / team mode: teamOf の写像（teamMode=true）');
  {
    // teamMode=true のとき: slot0→0, slot1→1, slot2→0, slot3→1
    GL.setGameState({ BOARD_SIZE: 20, board: [], teamMode: true });
    assert('teamMode=true: slot0 は team0', GL.teamOf(0) === 0);
    assert('teamMode=true: slot1 は team1', GL.teamOf(1) === 1);
    assert('teamMode=true: slot2 は team0（P1の2番目トレイ）', GL.teamOf(2) === 0);
    assert('teamMode=true: slot3 は team1（P2の2番目トレイ）', GL.teamOf(3) === 1);
  }

  section('LOCAL 2P / team mode: teamOf の写像（teamMode=false）');
  {
    // teamMode=false のとき恒等写像 → 4人モードの挙動が保たれる
    GL.setGameState({ BOARD_SIZE: 20, board: [], teamMode: false });
    assert('teamMode=false: slot0 は 0（恒等写像）', GL.teamOf(0) === 0);
    assert('teamMode=false: slot1 は 1（恒等写像）', GL.teamOf(1) === 1);
    assert('teamMode=false: slot2 は 2（恒等写像）', GL.teamOf(2) === 2);
    assert('teamMode=false: slot3 は 3（恒等写像）', GL.teamOf(3) === 3);
  }

  section('LOCAL 2P / team mode: 同チームのピース同士は辺で接触できない');
  {
    // 盤面: slot0のピースが(5,5)に置かれている。slot2が辺隣接(5,6)に置こうとする → NG
    const s = makeState(20);
    s.teamMode = true;
    s.playerPieces = Array.from({ length: 4 }, () =>
      GL.PIECE_SHAPES.slice(0, 21).map(sh => ({ shape: sh.map(c => [...c]), used: false }))
    );
    s.board[5][5] = 0; // slot0 のピース
    GL.setGameState(s);
    // slot2 が (5,6) に1マスピースを置こうとする（slot0 と辺接触）→ canPlace false
    assert('同チーム（slot0 と slot2）は辺で接触できない', !GL.canPlace(2, [[0,0]], 5, 6));
  }

  section('LOCAL 2P / team mode: 同チームのピース同士は角で接触できる');
  {
    // 盤面: slot0のピースが(5,5)に置かれている。slot2が対角(6,6)に置く → OK
    const s = makeState(20);
    s.teamMode = true;
    s.playerPieces = Array.from({ length: 4 }, () =>
      GL.PIECE_SHAPES.slice(0, 21).map(sh => ({ shape: sh.map(c => [...c]), used: false }))
    );
    s.board[5][5] = 0; // slot0 のピース
    // slot2 の first-move: スタート角は [m,m] = [19,19]。角接続テストのため first-move 状態を脱出させる
    s.board[19][19] = 2; // slot2 のピース（スタート角）
    GL.setGameState(s);
    // slot2 が (4,4) に置く（slot0 の対角）→ canPlace true（辺接触なし、角接続あり）
    assert('同チーム（slot0 と slot2）は角で接触できる', GL.canPlace(2, [[0,0]], 4, 4));
  }

  section('LOCAL 2P / team mode: 異チームのピースとは辺で接触できる');
  {
    // slot1 のピースが(3,3)から角接続候補の(2,2)に置こうとする。
    // (2,2) の辺隣接(2,3)に slot0（team0）のピースがある。
    // 異チームなのでこの辺接触はブロックされず、canPlace は true を返すべき。
    const s = makeState(20);
    s.teamMode = true;
    s.playerPieces = Array.from({ length: 4 }, () =>
      GL.PIECE_SHAPES.slice(0, 21).map(sh => ({ shape: sh.map(c => [...c]), used: false }))
    );
    s.board[0][19] = 1; // slot1 のスタート角（first-move 脱出）
    s.board[3][3] = 1;  // slot1 の別ピース（(2,2) が角接続候補になる）
    s.board[2][3] = 0;  // slot0（team0）のピース（(2,2)に置いた場合の辺接触位置）
    GL.setGameState(s);
    // slot1（team1）が (2,2) に置く: slot0 の (2,3) と辺接触するが異チームなのでOK
    assert('異チーム（slot0 と slot1）は辺で接触できる', GL.canPlace(1, [[0,0]], 2, 2));
  }

  section('LOCAL 2P / 後方互換: teamMode=false では slot0 と slot2 は辺で接触できる');
  {
    // teamMode=false（通常の4人モード）では slot0 と slot2 は別プレイヤーなので辺接触OK
    // slot2 のピース(19,19)から角接続候補(18,18)に置くとき、
    // slot0 のピースが (18,19) にある（(18,18) の辺接触位置）。
    // teamMode=false なら異チームなので辺接触はブロックされない。
    const s = makeState(20);
    s.teamMode = false;
    s.playerPieces = Array.from({ length: 4 }, () =>
      GL.PIECE_SHAPES.slice(0, 21).map(sh => ({ shape: sh.map(c => [...c]), used: false }))
    );
    s.board[19][19] = 2; // slot2 のピース（スタート角 first-move 脱出）
    s.board[18][19] = 0; // slot0（別プレイヤー）のピース
    GL.setGameState(s);
    // slot2 が (18,18) に置く: slot0 の (18,19) と辺接触するが teamMode=false では別チーム扱いでOK
    assert('teamMode=false: slot0 と slot2 は辺で接触できる（後方互換）', GL.canPlace(2, [[0,0]], 18, 18));
  }

  section('LOCAL 2P / team mode: 各スロットは自スロットのスタート角からスタートする');
  {
    // isFirstMove / getStartCorner はスロット単位のまま
    // slot2 の first-move では [m,m] = [19,19] を覆う必要がある
    const s = makeState(20);
    s.teamMode = true;
    s.playerPieces = Array.from({ length: 4 }, () =>
      GL.PIECE_SHAPES.slice(0, 21).map(sh => ({ shape: sh.map(c => [...c]), used: false }))
    );
    s.board[0][0] = 0; // slot0 は置き済み（first-move 終了）
    GL.setGameState(s);
    // slot2 は isFirstMove なので [m,m] = [19,19] を覆わないと配置不可
    assert('local2p で slot2 の first-move は [19,19] を覆う必要がある', GL.canPlace(2, [[0,0]], 19, 19));
    assert('local2p で slot2 の first-move は [0,0] を覆っても不可（自スロットのコーナーでない）', !GL.canPlace(2, [[0,0]], 0, 0));
  }

  section('LOCAL 2P / チームスコア集計: getScore(0)+getScore(2) が team0 スコア');
  {
    // team0 スコア = getScore(0) + getScore(2)。純粋関数として検証
    const s = makeState(20);
    s.playerPieces = Array.from({ length: 4 }, () =>
      GL.PIECE_SHAPES.slice(0, 21).map(sh => ({ shape: sh.map(c => [...c]), used: false }))
    );
    GL.setGameState(s);
    const team0Score = GL.getScore(0) + GL.getScore(2);
    const team1Score = GL.getScore(1) + GL.getScore(3);
    // 両チーム未配置なので各スロットは -89、チームスコアは -178
    assert('team0 スコア（全未配置）は getScore(0)+getScore(2)=-178', team0Score === -178);
    assert('team1 スコア（全未配置）は getScore(1)+getScore(3)=-178', team1Score === -178);
    // slot0,2 を全使用にすると team0 スコアは 15+15=30
    s.playerPieces[0].forEach(p => p.used = true);
    s.playerPieces[2].forEach(p => p.used = true);
    GL.setGameState(s);
    assert('team0 スコア（全使用）は 30', GL.getScore(0) + GL.getScore(2) === 30);
    assert('team1 スコア（全未配置のまま）は -178', GL.getScore(1) + GL.getScore(3) === -178);
  }

  // Results
  console.log('\n' + '='.repeat(40));
  if (fail === 0) {
    console.log('\x1b[32mAll tests passed: ' + pass + '/' + (pass + fail) + '\x1b[0m');
  } else {
    console.log('\x1b[31mFailed: PASS=' + pass + ' FAIL=' + fail + '\x1b[0m');
  }
  process.exit(fail > 0 ? 1 : 0);
}

runTests();