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
