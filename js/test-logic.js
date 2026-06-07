// Test for game-logic.js module (run with: node --experimental-vm-modules js/test-logic.js)
// Or use dynamic import

let pass = 0, fail = 0;
function assert(name, condition) {
  if (condition) { pass++; console.log('  \x1b[32mPASS\x1b[0m ' + name); }
  else { fail++; console.log('  \x1b[31mFAIL\x1b[0m ' + name); }
}
function section(name) { console.log('\n\x1b[33m' + name + '\x1b[0m'); }

async function runTests() {
  const GL = require('./game-logic.js');

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
    s.lastPlacedCells[0] = [[0, 0], [0, 1]];
    assert('all used, last piece >1 tile = +15', GL.getScore(0) === 15);
    s.lastPlacedCells[0] = [[0, 0]];
    assert('all used, last piece 1 tile = +20', GL.getScore(0) === 20);
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

  // ===== initState テスト =====
  section('initState - ボードサイズ別初期化');
  {
    GL.initState(14, 'cpu', 0);
    assert('initState 14: BOARD_SIZE=14', GL.state.BOARD_SIZE === 14);
    assert('initState 14: board 14x14', GL.state.board.length === 14 && GL.state.board[0].length === 14);
    assert('initState 14: 全セル空(-1)', GL.state.board.every(row => row.every(v => v === -1)));
    assert('initState 14: 4プレイヤー分のピース', GL.state.playerPieces.length === 4);
    assert('initState 14: 各プレイヤー12ピース', GL.state.playerPieces.every(pp => pp.length === 12));
    assert('initState 14: 全ピース未使用', GL.state.playerPieces.every(pp => pp.every(p => !p.used)));
    assert('initState 14: currentPlayer=0', GL.state.currentPlayer === 0);
    assert('initState 14: gameOver=false', GL.state.gameOver === false);
    assert('initState 14: passCount=0', GL.state.passCount === 0);
    assert('initState 14: gameMode=cpu', GL.state.gameMode === 'cpu');
    assert('initState 14: humanPlayer=0', GL.state.humanPlayer === 0);

    GL.initState(20, 'local', 2);
    assert('initState 20: BOARD_SIZE=20', GL.state.BOARD_SIZE === 20);
    assert('initState 20: board 20x20', GL.state.board.length === 20 && GL.state.board[0].length === 20);
    assert('initState 20: 各プレイヤー21ピース', GL.state.playerPieces.every(pp => pp.length === 21));
    assert('initState 20: gameMode=local', GL.state.gameMode === 'local');
    assert('initState 20: humanPlayer=2', GL.state.humanPlayer === 2);

    GL.initState(24, 'puzzle', 1);
    assert('initState 24: BOARD_SIZE=24', GL.state.BOARD_SIZE === 24);
    assert('initState 24: board 24x24', GL.state.board.length === 24 && GL.state.board[0].length === 24);
    assert('initState 24: 各プレイヤー28ピース', GL.state.playerPieces.every(pp => pp.length === 28));
    assert('initState 24: gameMode=puzzle', GL.state.gameMode === 'puzzle');
    assert('initState 24: humanPlayer=1', GL.state.humanPlayer === 1);
  }

  section('initState - ピースのディープコピー確認');
  {
    GL.initState(20, 'cpu', 0);
    // ピースを変更しても元のPIECE_SHAPESに影響しない
    GL.state.playerPieces[0][0].shape[0][0] = 99;
    assert('ピース変更がPIECE_SHAPESに影響しない', GL.PIECE_SHAPES[0][0][0] === 0);
    GL.state.playerPieces[0][0].used = true;
    assert('プレイヤー間でused状態が独立', !GL.state.playerPieces[1][0].used);
  }

  // ===== restoreState テスト =====
  section('restoreState - 正常データ復元');
  {
    const board20 = Array.from({ length: 20 }, () => Array(20).fill(-1));
    board20[0][0] = 0;
    const pieceUsed = [
      Array(21).fill(false),
      Array(21).fill(false),
      Array(21).fill(false),
      Array(21).fill(false),
    ];
    pieceUsed[0][0] = true;

    GL.restoreState({
      boardSize: 20,
      board: board20,
      currentPlayer: 1,
      passCount: 2,
      gameOver: false,
      playerPassed: [true, false, true, false],
      lastPlacedCells: [[[0,0]], [], [], []],
      humanPlayer: 3,
      gameMode: 'local',
      pieceUsed: pieceUsed,
    });
    assert('restore: boardSize=20', GL.state.BOARD_SIZE === 20);
    assert('restore: board[0][0]=0', GL.state.board[0][0] === 0);
    assert('restore: currentPlayer=1', GL.state.currentPlayer === 1);
    assert('restore: passCount=2', GL.state.passCount === 2);
    assert('restore: gameOver=false', GL.state.gameOver === false);
    assert('restore: playerPassed正しい', JSON.stringify(GL.state.playerPassed) === '[true,false,true,false]');
    assert('restore: humanPlayer=3', GL.state.humanPlayer === 3);
    assert('restore: gameMode=local', GL.state.gameMode === 'local');
    assert('restore: P0 piece0がused', GL.state.playerPieces[0][0].used);
    assert('restore: P0 piece1が未used', !GL.state.playerPieces[0][1].used);
  }

  section('restoreState - 14x14復元');
  {
    const board14 = Array.from({ length: 14 }, () => Array(14).fill(-1));
    const pieceUsed14 = Array.from({ length: 4 }, () => Array(12).fill(false));
    GL.restoreState({
      boardSize: 14,
      board: board14,
      currentPlayer: 0,
      passCount: 0,
      gameOver: false,
      playerPassed: [false, false, false, false],
      lastPlacedCells: [[], [], [], []],
      humanPlayer: 0,
      gameMode: 'cpu',
      pieceUsed: pieceUsed14,
    });
    assert('restore 14: 各プレイヤー12ピース', GL.state.playerPieces.every(pp => pp.length === 12));
  }

  section('restoreState - 24x24復元');
  {
    const board24 = Array.from({ length: 24 }, () => Array(24).fill(-1));
    const pieceUsed24 = Array.from({ length: 4 }, () => Array(28).fill(false));
    GL.restoreState({
      boardSize: 24,
      board: board24,
      currentPlayer: 0,
      passCount: 0,
      gameOver: false,
      playerPassed: [false, false, false, false],
      lastPlacedCells: [[], [], [], []],
      humanPlayer: 0,
      gameMode: 'cpu',
      pieceUsed: pieceUsed24,
    });
    assert('restore 24: 各プレイヤー28ピース', GL.state.playerPieces.every(pp => pp.length === 28));
  }

  section('restoreState - 不正データのエラーハンドリング');
  {
    let threw;

    threw = false;
    try { GL.restoreState(null); } catch (e) { threw = true; }
    assert('null → Error', threw);

    threw = false;
    try { GL.restoreState('string'); } catch (e) { threw = true; }
    assert('文字列 → Error', threw);

    threw = false;
    try { GL.restoreState(42); } catch (e) { threw = true; }
    assert('数値 → Error', threw);

    threw = false;
    try {
      GL.restoreState({
        boardSize: 20,
        board: [[1, 2]], // サイズ不一致
        pieceUsed: Array.from({ length: 4 }, () => []),
      });
    } catch (e) { threw = true; }
    assert('board行数不一致 → Error', threw);

    threw = false;
    try {
      const badBoard = Array.from({ length: 20 }, () => Array(10).fill(-1)); // 列数不一致
      GL.restoreState({
        boardSize: 20,
        board: badBoard,
        pieceUsed: Array.from({ length: 4 }, () => []),
      });
    } catch (e) { threw = true; }
    assert('board列数不一致 → Error', threw);

    threw = false;
    try {
      GL.restoreState({
        boardSize: 20,
        board: Array.from({ length: 20 }, () => Array(20).fill(-1)),
        // pieceUsed欠落
      });
    } catch (e) { threw = true; }
    assert('pieceUsed欠落 → Error', threw);

    threw = false;
    try {
      GL.restoreState({
        boardSize: 20,
        board: Array.from({ length: 20 }, () => Array(20).fill(-1)),
        pieceUsed: [[], []], // 4未満
      });
    } catch (e) { threw = true; }
    assert('pieceUsed要素数不足 → Error', threw);

    threw = false;
    try {
      GL.restoreState({
        boardSize: 20,
        board: Array.from({ length: 20 }, () => Array(20).fill(-1)),
        pieceUsed: ['not array', [], [], []],
      });
    } catch (e) { threw = true; }
    assert('pieceUsed要素が配列でない → Error', threw);
  }

  section('restoreState - デフォルト値フォールバック');
  {
    const board20 = Array.from({ length: 20 }, () => Array(20).fill(-1));
    const pieceUsed20 = Array.from({ length: 4 }, () => Array(21).fill(false));
    GL.restoreState({
      boardSize: 99, // 不正 → 20にフォールバック
      board: board20,
      currentPlayer: -5, // 不正 → 0にフォールバック
      passCount: 10, // 不正 → 0にフォールバック
      gameOver: 'yes', // 不正 → false
      playerPassed: 'bad', // 不正 → デフォルト
      lastPlacedCells: null, // 不正 → デフォルト
      humanPlayer: 99, // 不正 → 0
      gameMode: 'invalid', // 不正 → cpu
      pieceUsed: pieceUsed20,
    });
    assert('不正boardSize → 20にフォールバック', GL.state.BOARD_SIZE === 20);
    assert('不正currentPlayer → 0にフォールバック', GL.state.currentPlayer === 0);
    assert('不正passCount → 0にフォールバック', GL.state.passCount === 0);
    assert('不正gameOver → falseにフォールバック', GL.state.gameOver === false);
    assert('不正playerPassed → デフォルト', JSON.stringify(GL.state.playerPassed) === '[false,false,false,false]');
    assert('不正lastPlacedCells → デフォルト', JSON.stringify(GL.state.lastPlacedCells) === '[[],[],[],[]]');
    assert('不正humanPlayer → 0にフォールバック', GL.state.humanPlayer === 0);
    assert('不正gameMode → cpuにフォールバック', GL.state.gameMode === 'cpu');
  }

  // ===== getCornerPositions テスト =====
  section('getCornerPositions');
  {
    const s = makeState(20);
    GL.setGameState(s);

    // 初手: スタートコーナーのみ
    const firstCorners = GL.getCornerPositions(0);
    assert('初手: コーナー1つ', firstCorners.length === 1);
    assert('初手: [0,0]', JSON.stringify(firstCorners[0]) === '[0,0]');

    const firstCornersP2 = GL.getCornerPositions(2);
    assert('P2初手: [19,19]', JSON.stringify(firstCornersP2[0]) === '[19,19]');

    // 1ピース配置後
    GL.placePiece(0, [[0,0]], 0, 0);
    const corners1 = GL.getCornerPositions(0);
    assert('1ピース配置後: コーナー1つ([1,1])', corners1.length === 1 && JSON.stringify(corners1[0]) === '[1,1]');

    // L字配置後、コーナーが複数出る
    const s2 = makeState(20);
    GL.setGameState(s2);
    GL.placePiece(0, [[0,0],[1,0],[1,1]], 0, 0); // L字を[0,0]に配置
    const corners2 = GL.getCornerPositions(0);
    assert('L字配置後: 複数コーナー', corners2.length >= 2);
    // [2,2]は対角で、辺接触なし
    assert('L字配置後: [2,2]がコーナーに含まれる',
      corners2.some(([r,c]) => r === 2 && c === 2));

    // 辺で接するセルはコーナーにならない
    assert('L字配置後: [0,1]はコーナーでない (辺接触)',
      !corners2.some(([r,c]) => r === 0 && c === 1));
  }

  // ===== countNewCorners テスト =====
  section('countNewCorners');
  {
    const s = makeState(20);
    GL.setGameState(s);

    // 空ボードに1マスピースを[0,0]に置いた場合
    const newCorners1 = GL.countNewCorners(0, [[0,0]], 0, 0);
    assert('1マス[0,0]配置: コーナー角の新規コーナー=1', newCorners1 === 1);

    // L字を[0,0]に置いた場合
    const newCornersL = GL.countNewCorners(0, [[0,0],[1,0],[1,1]], 0, 0);
    assert('L字[0,0]配置: 新規コーナー>=2', newCornersL >= 2);

    // ピース配置後に別のピースのコーナー数
    GL.placePiece(0, [[0,0]], 0, 0);
    const newCorners2 = GL.countNewCorners(0, [[0,0]], 1, 1);
    assert('既存ピース隣に配置: 新規コーナー計算可能', typeof newCorners2 === 'number' && newCorners2 >= 0);
  }

  // ===== countBlockedOpponentCorners テスト =====
  section('countBlockedOpponentCorners');
  {
    const s = makeState(20);
    GL.setGameState(s);

    // 相手のスタートコーナー付近に配置
    // P1のスタートコーナーは[0,19]
    const blocked = GL.countBlockedOpponentCorners(0, [[0,0]], 0, 18);
    assert('相手コーナー近くに配置: ブロック数>=0', typeof blocked === 'number' && blocked >= 0);

    // 相手がピースを配置済みの場合
    GL.placePiece(1, [[0,0]], 0, 19); // P1がスタートコーナーに配置
    const blocked2 = GL.countBlockedOpponentCorners(0, [[0,0]], 1, 18);
    assert('相手のコーナー位置に辺接触: ブロック数>0', blocked2 > 0);
  }

  // ===== getCenterDistance テスト =====
  section('getCenterDistance');
  {
    const s = makeState(20);
    GL.setGameState(s);
    // center = 10

    // ボード中央付近に配置
    const distCenter = GL.getCenterDistance([[0,0]], 10, 10);
    assert('中央[10,10]: 距離=0', distCenter === 0);

    // コーナー[0,0]に配置
    const distCorner = GL.getCenterDistance([[0,0]], 0, 0);
    assert('コーナー[0,0]: 距離=20', distCorner === 20);

    // 2マスピースの平均距離
    const dist2 = GL.getCenterDistance([[0,0],[1,0]], 9, 10);
    // [9,10]と[10,10]: dist = (1+0 + 0+0)/2 = 0.5
    assert('2マスピース[9,10]: 平均距離=0.5', dist2 === 0.5);

    // 14x14ボードでのテスト
    const s14 = makeState(14);
    GL.setGameState(s14);
    // center = 7
    const dist14center = GL.getCenterDistance([[0,0]], 7, 7);
    assert('14x14中央[7,7]: 距離=0', dist14center === 0);

    const dist14corner = GL.getCenterDistance([[0,0]], 0, 0);
    assert('14x14コーナー[0,0]: 距離=14', dist14corner === 14);
  }

  // ===== cpuMove 詳細テスト =====
  section('cpuMove - 返り値の配置可能性検証');
  {
    // 20x20 初手
    const s = makeState(20);
    s.playerPieces = [];
    for (let p = 0; p < 4; p++) {
      s.playerPieces.push(GL.PIECE_SHAPES.slice(0, 21).map(sh => ({ shape: sh.map(c => [...c]), used: false })));
    }
    GL.setGameState(s);
    const params = { sizeWeight: 10, cornerWeight: 3, centerWeight: 2, blockWeight: 2, randomness: 0 };
    const move = GL.cpuMove(0, params);
    assert('cpuMove初手: 配置可能な手を返す', move !== null && GL.canPlace(0, move.shape, move.br, move.bc));

    // 配置後の2手目
    GL.placePiece(0, move.shape, move.br, move.bc);
    s.playerPieces[0][move.idx].used = true;
    const move2 = GL.cpuMove(0, params);
    assert('cpuMove 2手目: 配置可能な手を返す', move2 !== null && GL.canPlace(0, move2.shape, move2.br, move2.bc));
  }

  section('cpuMove - 14x14ボード');
  {
    GL.initState(14, 'cpu', 0);
    const params = { sizeWeight: 10, cornerWeight: 3, centerWeight: 2, blockWeight: 2, randomness: 0 };
    const move14 = GL.cpuMove(0, params);
    assert('cpuMove 14x14: 手が返る', move14 !== null);
    assert('cpuMove 14x14: 配置可能', GL.canPlace(0, move14.shape, move14.br, move14.bc));
  }

  section('cpuMove - 24x24ボード');
  {
    GL.initState(24, 'cpu', 0);
    const params = { sizeWeight: 10, cornerWeight: 3, centerWeight: 2, blockWeight: 2, randomness: 0 };
    const move24 = GL.cpuMove(0, params);
    assert('cpuMove 24x24: 手が返る', move24 !== null);
    assert('cpuMove 24x24: 配置可能', GL.canPlace(0, move24.shape, move24.br, move24.bc));
  }

  section('cpuMove - 全ピース使用済み');
  {
    const s = makeState(20);
    s.playerPieces = [];
    for (let p = 0; p < 4; p++) {
      s.playerPieces.push(GL.PIECE_SHAPES.slice(0, 21).map(sh => ({ shape: sh.map(c => [...c]), used: true })));
    }
    GL.setGameState(s);
    const params = { sizeWeight: 10, cornerWeight: 3, centerWeight: 2, blockWeight: 2, randomness: 0 };
    const moveNone = GL.cpuMove(0, params);
    assert('全ピース使用済み → null', moveNone === null);
  }

  // ===== hasValidMove 詳細テスト =====
  section('hasValidMove - 様々なシナリオ');
  {
    // 初手は必ず有効手あり
    GL.initState(20, 'cpu', 0);
    assert('20x20初手: 有効手あり', GL.hasValidMove(0));

    GL.initState(14, 'cpu', 0);
    assert('14x14初手: 有効手あり', GL.hasValidMove(0));

    GL.initState(24, 'cpu', 0);
    assert('24x24初手: 有効手あり', GL.hasValidMove(0));

    // 全ピース使用済み → 有効手なし
    GL.initState(20, 'cpu', 0);
    GL.state.playerPieces[0].forEach(p => p.used = true);
    assert('全ピース使用済み → 有効手なし', !GL.hasValidMove(0));

    // 囲まれて配置不可
    GL.initState(20, 'cpu', 0);
    GL.state.board[0][0] = 0; // P0のピース
    // P0の全コーナー位置を他プレイヤーで埋める
    GL.state.board[1][1] = 1;
    // 辺も埋める
    GL.state.board[1][0] = 1;
    GL.state.board[0][1] = 1;
    // コーナー位置がすべて埋まっているので有効手なし
    assert('コーナー全封鎖 → 有効手なし', !GL.hasValidMove(0));
  }

  section('LOCAL 2P / team mode: teamOf の写像（teamMode=true）');
  {
    GL.setGameState({ BOARD_SIZE: 20, board: [], teamMode: true });
    assert('teamMode=true: slot0 は team0', GL.teamOf(0) === 0);
    assert('teamMode=true: slot1 は team1', GL.teamOf(1) === 1);
    assert('teamMode=true: slot2 は team0（P1の2番目トレイ）', GL.teamOf(2) === 0);
    assert('teamMode=true: slot3 は team1（P2の2番目トレイ）', GL.teamOf(3) === 1);
  }

  section('LOCAL 2P / team mode: teamOf の写像（teamMode=false）');
  {
    GL.setGameState({ BOARD_SIZE: 20, board: [], teamMode: false });
    assert('teamMode=false: slot0 は 0（恒等写像）', GL.teamOf(0) === 0);
    assert('teamMode=false: slot1 は 1（恒等写像）', GL.teamOf(1) === 1);
    assert('teamMode=false: slot2 は 2（恒等写像）', GL.teamOf(2) === 2);
    assert('teamMode=false: slot3 は 3（恒等写像）', GL.teamOf(3) === 3);
  }

  section('LOCAL 2P / team mode: 同チームのピース同士は辺で接触できない');
  {
    const s = makeState(20);
    s.teamMode = true;
    s.board[5][5] = 0; // slot0 のピース
    GL.setGameState(s);
    assert('同チーム（slot0 と slot2）は辺で接触できない', !GL.canPlace(2, [[0,0]], 5, 6));
  }

  section('LOCAL 2P / team mode: 同チームのピース同士は角で接触できる');
  {
    const s = makeState(20);
    s.teamMode = true;
    s.board[5][5] = 0;   // slot0 のピース
    s.board[19][19] = 2; // slot2 のスタート角（first-move 脱出）
    GL.setGameState(s);
    assert('同チーム（slot0 と slot2）は角で接触できる', GL.canPlace(2, [[0,0]], 4, 4));
  }

  section('LOCAL 2P / team mode: 異チームのピースとは辺で接触できる');
  {
    const s = makeState(20);
    s.teamMode = true;
    s.board[0][19] = 1; // slot1 のスタート角（first-move 脱出）
    s.board[3][3] = 1;  // slot1 の別ピース（(2,2) が角接続候補になる）
    s.board[2][3] = 0;  // slot0（team0）のピース（(2,2)に置いた場合の辺接触位置）
    GL.setGameState(s);
    assert('異チーム（slot0 と slot1）は辺で接触できる', GL.canPlace(1, [[0,0]], 2, 2));
  }

  section('LOCAL 2P / 後方互換: teamMode=false では slot0 と slot2 は辺で接触できる');
  {
    const s = makeState(20);
    s.teamMode = false;
    s.board[19][19] = 2; // slot2 のピース（スタート角 first-move 脱出）
    s.board[18][19] = 0; // slot0（別プレイヤー）のピース
    GL.setGameState(s);
    assert('teamMode=false: slot0 と slot2 は辺で接触できる（後方互換）', GL.canPlace(2, [[0,0]], 18, 18));
  }

  section('LOCAL 2P / team mode: 各スロットは自スロットのスタート角からスタートする');
  {
    const s = makeState(20);
    s.teamMode = true;
    s.board[0][0] = 0; // slot0 は置き済み（first-move 終了）
    GL.setGameState(s);
    assert('local2p で slot2 の first-move は [19,19] を覆う必要がある', GL.canPlace(2, [[0,0]], 19, 19));
    assert('local2p で slot2 の first-move は空の非コーナー[10,10]には置けない', !GL.canPlace(2, [[0,0]], 10, 10));
  }

  section('LOCAL 2P / チームスコア集計: getScore(0)+getScore(2) が team0 スコア');
  {
    const s = makeState(20);
    s.playerPieces = Array.from({ length: 4 }, () =>
      GL.PIECE_SHAPES.slice(0, 21).map(sh => ({ shape: sh.map(c => [...c]), used: false }))
    );
    GL.setGameState(s);
    assert('team0 スコア（全未配置）は getScore(0)+getScore(2)=-178', GL.getScore(0) + GL.getScore(2) === -178);
    assert('team1 スコア（全未配置）は getScore(1)+getScore(3)=-178', GL.getScore(1) + GL.getScore(3) === -178);
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
