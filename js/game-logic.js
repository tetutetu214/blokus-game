// game-logic.js - Pure game logic (no DOM dependencies)
// Single Source of Truth: all game state lives here.
// UI reads state via `state` object, modifies through functions.
// Loaded as a plain script (no ES modules) for maximum compatibility.

var state = {
  BOARD_SIZE: 20,
  board: [],
  currentPlayer: 0,
  playerPieces: [],
  passCount: 0,
  gameOver: false,
  playerPassed: [false, false, false, false],
  lastPlacedCells: [[], [], [], []],
  humanPlayer: 0,
  gameMode: 'cpu',
};

function initState(boardSize, gameMode, humanPlayer) {
  state.BOARD_SIZE = boardSize;
  state.board = Array.from({ length: boardSize }, () => Array(boardSize).fill(-1));
  state.currentPlayer = 0;
  state.passCount = 0;
  state.gameOver = false;
  state.playerPassed = [false, false, false, false];
  state.lastPlacedCells = [[], [], [], []];
  state.humanPlayer = humanPlayer;
  state.gameMode = gameMode;

  const activeIdx = (boardSize === 14) ? PIECES_14 : (boardSize === 24) ? PIECES_24 : null;
  state.playerPieces = [];
  for (let p = 0; p < 4; p++) {
    if (activeIdx) {
      state.playerPieces.push(activeIdx.map(i => ({ shape: PIECE_SHAPES[i].map(s => [...s]), used: false })));
    } else {
      state.playerPieces.push(PIECE_SHAPES.slice(0, 21).map(shape => ({ shape: shape.map(s => [...s]), used: false })));
    }
  }
}

function restoreState(saveData) {
  state.BOARD_SIZE = saveData.boardSize || 20;
  state.board = saveData.board;
  state.currentPlayer = saveData.currentPlayer;
  state.passCount = saveData.passCount;
  state.gameOver = saveData.gameOver;
  state.playerPassed = saveData.playerPassed;
  state.lastPlacedCells = saveData.lastPlacedCells || [[], [], [], []];
  state.humanPlayer = saveData.humanPlayer !== undefined ? saveData.humanPlayer : 0;
  state.gameMode = saveData.gameMode;

  const activeIdx = (state.BOARD_SIZE === 14) ? PIECES_14 : (state.BOARD_SIZE === 24) ? PIECES_24 : null;
  state.playerPieces = [];
  for (let p = 0; p < 4; p++) {
    if (activeIdx) {
      state.playerPieces.push(activeIdx.map((si, idx) => ({ shape: PIECE_SHAPES[si].map(s => [...s]), used: saveData.pieceUsed[p][idx] })));
    } else {
      state.playerPieces.push(PIECE_SHAPES.slice(0, 21).map((shape, idx) => ({ shape: shape.map(s => [...s]), used: saveData.pieceUsed[p][idx] })));
    }
  }
}

// Legacy compatibility (for setGameState during transition)
function setGameState(s) {
  Object.assign(state, s);
}

// ===== Constants =====
var PIECE_SHAPES = [
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
  // Hexominoes (indices 21-27) for 24x24 mode
  [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0]],
  [[0,0],[1,0],[2,0],[3,0],[4,0],[4,1]],
  [[0,0],[1,0],[2,0],[3,0],[4,0],[2,1]],
  [[0,0],[1,0],[2,0],[2,1],[3,1],[4,1]],
  [[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],
  [[0,0],[1,0],[2,0],[3,0],[4,0],[1,1]],
  [[0,0],[1,0],[1,1],[2,1],[2,2],[3,2]],
];

var PIECES_14 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
var PIECES_24 = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27];

// ===== Piece Manipulation =====
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

// ===== Placement Validation =====
function isFirstMove(player) {
  const bs = state.BOARD_SIZE;
  for (let r = 0; r < bs; r++)
    for (let c = 0; c < bs; c++)
      if (state.board[r][c] === player) return false;
  return true;
}

function getStartCorner(player) {
  const m = state.BOARD_SIZE - 1;
  return [[0,0],[0,m],[m,m],[m,0]][player];
}

function canPlace(player, shape, br, bc) {
  const bs = state.BOARD_SIZE;
  const cells = shape.map(([dr, dc]) => [br + dr, bc + dc]);

  for (const [r, c] of cells) {
    if (r < 0 || r >= bs || c < 0 || c >= bs) return false;
    if (state.board[r][c] >= 0) return false;
  }

  for (const [r, c] of cells) {
    const adj = [[r-1,c],[r+1,c],[r,c-1],[r,c+1]];
    for (const [ar, ac] of adj) {
      if (ar >= 0 && ar < bs && ac >= 0 && ac < bs) {
        if (state.board[ar][ac] === player) return false;
      }
    }
  }

  if (isFirstMove(player)) {
    const [sr, sc] = getStartCorner(player);
    return cells.some(([r, c]) => r === sr && c === sc);
  }

  for (const [r, c] of cells) {
    const diag = [[r-1,c-1],[r-1,c+1],[r+1,c-1],[r+1,c+1]];
    for (const [dr, dc] of diag) {
      if (dr >= 0 && dr < bs && dc >= 0 && dc < bs) {
        if (state.board[dr][dc] === player) return true;
      }
    }
  }
  return false;
}

function placePiece(player, shape, br, bc) {
  state.lastPlacedCells[player] = [];
  shape.forEach(([dr, dc]) => {
    state.board[br + dr][bc + dc] = player;
    state.lastPlacedCells[player].push([br + dr, bc + dc]);
  });
}

// ===== AI Helpers =====
function getCornerPositions(player) {
  const bs = state.BOARD_SIZE;
  const corners = [];
  if (isFirstMove(player)) {
    const [sr, sc] = getStartCorner(player);
    corners.push([sr, sc]);
    return corners;
  }
  const seen = new Set();
  for (let r = 0; r < bs; r++) {
    for (let c = 0; c < bs; c++) {
      if (state.board[r][c] !== player) continue;
      const diag = [[r-1,c-1],[r-1,c+1],[r+1,c-1],[r+1,c+1]];
      for (const [dr, dc] of diag) {
        if (dr < 0 || dr >= bs || dc < 0 || dc >= bs) continue;
        if (state.board[dr][dc] >= 0) continue;
        const key = dr + ',' + dc;
        if (seen.has(key)) continue;
        // Check not edge-adjacent to own pieces
        const adj = [[dr-1,dc],[dr+1,dc],[dr,dc-1],[dr,dc+1]];
        let blocked = false;
        for (const [ar, ac] of adj) {
          if (ar >= 0 && ar < bs && ac >= 0 && ac < bs && state.board[ar][ac] === player) {
            blocked = true; break;
          }
        }
        if (!blocked) { seen.add(key); corners.push([dr, dc]); }
      }
    }
  }
  return corners;
}

function countNewCorners(player, shape, br, bc) {
  const bs = state.BOARD_SIZE;
  const placed = new Set(shape.map(([dr, dc]) => `${br+dr},${bc+dc}`));
  let count = 0;
  for (const [dr, dc] of shape) {
    const r = br + dr;
    const c = bc + dc;
    const diag = [[r-1,c-1],[r-1,c+1],[r+1,c-1],[r+1,c+1]];
    for (const [cr, cc] of diag) {
      if (cr < 0 || cr >= bs || cc < 0 || cc >= bs) continue;
      if (state.board[cr][cc] >= 0) continue;
      if (placed.has(`${cr},${cc}`)) continue;
      let edgeBlocked = false;
      const adj = [[cr-1,cc],[cr+1,cc],[cr,cc-1],[cr,cc+1]];
      for (const [ar, ac] of adj) {
        if (placed.has(`${ar},${ac}`)) { edgeBlocked = true; break; }
        if (ar >= 0 && ar < bs && ac >= 0 && ac < bs && state.board[ar][ac] === player) {
          edgeBlocked = true; break;
        }
      }
      if (!edgeBlocked) count++;
    }
  }
  return count;
}

function countBlockedOpponentCorners(player, shape, br, bc) {
  let blocked = 0;
  const placed = new Set(shape.map(([dr, dc]) => `${br+dr},${bc+dc}`));
  for (let p = 0; p < 4; p++) {
    if (p === player) continue;
    const oppCorners = getCornerPositions(p);
    for (const [cr, cc] of oppCorners) {
      if (placed.has(`${cr},${cc}`)) blocked++;
      for (const [dr, dc] of shape) {
        const r = br + dr, c = bc + dc;
        if ((Math.abs(r-cr) === 1 && c === cc) || (Math.abs(c-cc) === 1 && r === cr)) {
          blocked++;
          break;
        }
      }
    }
  }
  return blocked;
}

function getCenterDistance(shape, br, bc) {
  const center = state.BOARD_SIZE / 2;
  let totalDist = 0;
  for (const [dr, dc] of shape) {
    const r = br + dr, c = bc + dc;
    totalDist += Math.abs(r - center) + Math.abs(c - center);
  }
  return totalDist / shape.length;
}

// ===== CPU AI =====
function cpuMove(player, cpuParams) {
  const pieces = state.playerPieces[player];
  const cornerPositions = getCornerPositions(player);
  if (cornerPositions.length === 0 && !isFirstMove(player)) return null;

  const p = cpuParams;
  let bestMove = null;
  let bestScore = -Infinity;

  const pieceIndices = pieces.map((_, i) => i).filter(i => !pieces[i].used);
  pieceIndices.sort((a, b) => pieces[b].shape.length - pieces[a].shape.length);

  for (const idx of pieceIndices) {
    const piece = pieces[idx];
    const orientations = getAllOrientations(piece.shape);
    const positions = isFirstMove(player) ? [getStartCorner(player)] : cornerPositions;

    for (const orient of orientations) {
      for (const [cr, cc] of positions) {
        for (const [dr, dc] of orient) {
          const br = cr - dr;
          const bc = cc - dc;
          if (canPlace(player, orient, br, bc)) {
            const sizeScore = orient.length * p.sizeWeight;
            const cornerScore = countNewCorners(player, orient, br, bc) * p.cornerWeight;
            const centerScore = (state.BOARD_SIZE - getCenterDistance(orient, br, bc)) * p.centerWeight;
            const blockScore = countBlockedOpponentCorners(player, orient, br, bc) * p.blockWeight;
            const randomScore = (Math.random() - 0.5) * p.randomness * 10;
            const total = sizeScore + cornerScore + centerScore + blockScore + randomScore;
            if (total > bestScore) {
              bestScore = total;
              bestMove = { idx, shape: orient, br, bc };
            }
          }
        }
      }
    }
  }
  return bestMove;
}

// ===== Scoring =====
function getScore(player) {
  const pieces = state.playerPieces[player];
  const remaining = pieces.filter(p => !p.used).reduce((sum, p) => sum + p.shape.length, 0);
  if (remaining === 0) {
    const lastPiece = pieces[pieces.length - 1];
    return lastPiece.shape.length === 1 ? 20 : 15;
  }
  return -remaining;
}

// ===== Valid Move Check =====
function hasValidMove(player) {
  const pieces = state.playerPieces[player];
  const corners = getCornerPositions(player);
  if (corners.length === 0 && !isFirstMove(player)) return false;
  const positions = isFirstMove(player) ? [getStartCorner(player)] : corners;

  for (let idx = 0; idx < pieces.length; idx++) {
    if (pieces[idx].used) continue;
    const orientations = getAllOrientations(pieces[idx].shape);
    for (const orient of orientations) {
      for (const [cr, cc] of positions) {
        for (const [dr, dc] of orient) {
          const br = cr - dr;
          const bc = cc - dc;
          if (canPlace(player, orient, br, bc)) return true;
        }
      }
    }
  }
  return false;
}
