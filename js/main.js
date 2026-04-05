
// ===== View Transition Helper =====
function withViewTransition(callback) {
  if (document.startViewTransition) {
    document.startViewTransition(callback);
  } else {
    callback();
  }
}

// ===== Constants =====
// state.BOARD_SIZE is now in state (game-logic.js)

const PLAYERS = [
  { id: 0, name: 'YOU', color: '#0072B2', light: '#4da6d9' },
  { id: 1, name: 'CPU1', color: '#F0E442', light: '#f5ed7a' },
  { id: 2, name: 'CPU2', color: '#9467BD', light: '#b394d4' },
  { id: 3, name: 'CPU3', color: '#D55E00', light: '#e8885a' }
];

const PLAYERS_LOCAL = [
  { id: 0, name: 'P1', color: '#0072B2', light: '#4da6d9' },
  { id: 1, name: 'P2', color: '#F0E442', light: '#f5ed7a' },
  { id: 2, name: 'P3', color: '#9467BD', light: '#b394d4' },
  { id: 3, name: 'P4', color: '#D55E00', light: '#e8885a' }
];

const PLAYERS_PUZZLE = [
  { id: 0, name: 'BLUE', color: '#0072B2', light: '#4da6d9' },
  { id: 1, name: 'YELLOW', color: '#F0E442', light: '#f5ed7a' },
  { id: 2, name: 'PURPLE', color: '#9467BD', light: '#b394d4' },
  { id: 3, name: 'ORANGE', color: '#D55E00', light: '#e8885a' }
];

// CPU Character System (9 characters, Rank 1-9)
let cpuCharacters = [null, null, null];

const CPU_CHARACTERS = [
  { id: 'blaze',   rank: 1, name: 'BLAZE',   caption: 'Relentless force',  atk: 5, def: 2, rng: 0 },
  { id: 'aegis',   rank: 2, name: 'AEGIS',   caption: 'Unbreakable wall',  atk: 1, def: 5, rng: 0 },
  { id: 'chaos',   rank: 3, name: 'CHAOS',   caption: 'Brilliant madness', atk: 3, def: 3, rng: 5 },
  { id: 'spike',   rank: 4, name: 'SPIKE',   caption: 'Sharp striker',     atk: 4, def: 1, rng: 0 },
  { id: 'proxy',   rank: 5, name: 'PROXY',   caption: 'Steady shield',     atk: 1, def: 4, rng: 0 },
  { id: 'glitch',  rank: 6, name: 'GLITCH',  caption: 'Unpredictable',     atk: 2, def: 1, rng: 4 },
  { id: 'ember',   rank: 7, name: 'EMBER',   caption: 'Fading spark',      atk: 3, def: 0, rng: 0 },
  { id: 'echo',    rank: 8, name: 'ECHO',    caption: 'Faint signal',      atk: 0, def: 3, rng: 0 },
  { id: 'flicker', rank: 9, name: 'FLICKER', caption: 'Static noise',      atk: 0, def: 0, rng: 3 }
];

const CHAR_PIXELS = {
blaze:[[0,0,0,0,0,0,0,0,0,0,0,0,2,1,0,0],[0,0,0,0,0,0,0,0,0,0,0,2,3,2,1,0],[0,0,0,0,0,0,0,0,0,0,2,3,3,2,0,0],[0,0,0,0,0,0,0,0,0,2,3,3,2,0,0,0],[0,0,0,0,0,0,0,0,2,3,3,2,0,0,0,0],[0,0,0,0,0,0,0,2,3,3,2,0,0,0,0,0],[0,0,0,0,0,0,2,3,3,2,0,0,0,0,0,0],[0,0,1,0,0,2,3,3,2,0,0,0,0,0,0,0],[0,0,0,1,2,3,3,2,0,0,0,0,0,0,0,0],[0,0,0,2,3,3,2,0,0,0,0,0,0,0,0,0],[0,0,2,3,3,2,0,0,0,0,0,0,0,0,0,0],[0,1,2,3,2,1,0,0,0,0,0,0,0,0,0,0],[1,2,1,2,1,2,1,0,0,0,0,0,0,0,0,0],[0,1,0,2,0,1,0,0,0,0,0,0,0,0,0,0],[0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0]],
spike:[[0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,2,1,0,0,0,0,0,0,1,2,0,0,0],[0,0,0,0,2,1,0,0,0,0,1,2,0,0,0,0],[0,0,0,0,0,2,1,0,0,1,2,0,0,0,0,0],[0,0,0,0,0,0,2,1,1,2,0,0,0,0,0,0],[0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0],[0,0,0,0,0,1,2,2,2,2,1,0,0,0,0,0],[0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0],[0,0,0,0,0,1,2,1,1,2,1,0,0,0,0,0],[0,0,0,0,1,2,1,0,0,1,2,1,0,0,0,0],[0,0,0,1,2,1,0,0,0,0,1,2,1,0,0,0],[0,0,1,2,1,0,0,0,0,0,0,1,2,1,0,0],[0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
ember:[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0],[0,0,0,0,0,0,0,0,0,1,2,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,2,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,2,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,2,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,2,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,0],[0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,1,2,1,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
aegis:[[0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],[0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],[0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],[0,1,2,2,2,1,1,1,1,1,1,2,2,2,1,0],[0,1,2,2,1,2,2,3,3,2,2,1,2,2,1,0],[1,2,2,2,1,2,3,3,3,3,2,1,2,2,2,1],[1,2,2,2,1,2,3,2,2,3,2,1,2,2,2,1],[1,2,2,2,1,2,3,2,2,3,2,1,2,2,2,1],[1,2,2,2,1,2,3,3,3,3,2,1,2,2,2,1],[1,2,2,2,1,2,2,3,3,2,2,1,2,2,2,1],[0,1,2,2,2,1,1,1,1,1,1,2,2,2,1,0],[0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],[0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],[0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0],[0,0,0,0,0,1,1,2,2,1,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0]],
proxy:[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0],[0,0,1,2,2,2,2,1,1,2,2,2,2,1,0,0],[0,1,2,2,2,2,2,1,1,2,2,2,2,2,1,0],[0,1,2,2,2,2,2,1,1,2,2,2,2,2,1,0],[0,1,2,1,1,1,1,1,1,1,1,1,1,2,1,0],[0,1,2,1,1,1,1,1,1,1,1,1,1,2,1,0],[0,1,2,2,2,2,2,1,1,2,2,2,2,2,1,0],[0,1,2,2,2,2,2,1,1,2,2,2,2,2,1,0],[0,0,1,2,2,2,2,1,1,2,2,2,2,1,0,0],[0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0],[0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
echo:[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],[0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],[0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],[0,0,0,0,0,1,2,2,2,2,1,0,0,0,0,0],[0,0,0,0,0,1,2,2,2,2,1,0,0,0,0,0],[0,0,0,0,0,1,2,1,1,2,1,0,0,0,0,0],[0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
chaos:[[0,0,0,0,1,1,1,0,0,0,0,1,1,0,0,0],[0,0,0,1,2,2,1,0,0,0,1,2,1,0,0,0],[0,0,1,2,2,1,0,0,0,1,2,1,0,0,0,0],[0,1,2,2,1,0,0,0,1,2,1,0,0,0,0,0],[1,2,2,2,1,1,1,1,2,2,1,0,0,0,0,0],[1,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0],[0,1,1,1,1,1,2,2,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,2,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,2,2,1,1,1,1,0,0,0,0,0,0],[0,0,1,2,2,2,2,2,2,1,0,0,0,0,0,0],[0,0,1,1,1,1,2,2,2,2,1,0,0,0,0,0],[0,0,0,0,0,1,2,2,1,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,2,1,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
glitch:[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,1,1,1,0,0,0,2,0,0,0],[0,0,0,0,0,1,2,2,1,0,0,0,0,0,0,0],[0,0,0,0,1,2,2,1,0,0,0,0,0,0,0,0],[0,2,0,1,2,2,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,2,2,1,1,1,0,0,2,0,0,0,0],[0,0,0,1,2,2,2,2,1,0,0,0,0,0,0,0],[0,0,0,0,1,1,2,2,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,2,1,0,0,0,0,0,2,0,0],[0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,0],[0,0,2,0,1,2,1,0,0,2,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
flicker:[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],[0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,0],[0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,2,2,1,0,0,0,0,0,0,0,0,0],[0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]
};

const CHAR_PALETTES = {
  blaze:   ['#ff2255', '#ff6688', '#ffaacc'],
  spike:   ['#cc1144', '#cc5566', '#cc8899'],
  ember:   ['#771133', '#884455', '#996677'],
  aegis:   ['#0088ff', '#44bbff', '#aaddff'],
  proxy:   ['#0066bb', '#3388cc', '#66aadd'],
  echo:    ['#003366', '#335577', '#557799'],
  chaos:   ['#ffaa00', '#ffcc33', '#ffee88'],
  glitch:  ['#bb8800', '#ccaa33', '#ddcc66'],
  flicker: ['#665500', '#887733', '#aa9955']
};

function getCharBreatheClass(charId) {
  var ch = CPU_CHARACTERS.find(function(c) { return c.id === charId; });
  if (!ch) return 'char-breathe-def';
  if (ch.rng >= 3) return 'char-breathe-rng';
  if (ch.atk >= ch.def) return 'char-breathe-atk';
  return 'char-breathe-def';
}

function drawCharPixelArt(canvas, charId) {
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 16, 16);
  var px = CHAR_PIXELS[charId];
  var pal = CHAR_PALETTES[charId];
  if (!px || !pal) return;
  for (var y = 0; y < 16; y++) {
    for (var x = 0; x < 16; x++) {
      var v = px[y][x];
      if (v >= 1 && v <= 3) {
        ctx.fillStyle = pal[v - 1];
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

// Generate AI params from character atk/def/rng values
function getCpuParams(ch) {
  if (!ch) return { sizeWeight: 10, cornerWeight: 3, centerWeight: 2, blockWeight: 2, randomness: 3 };
  var a = ch.atk, d = ch.def, r = ch.rng;
  return {
    sizeWeight:   4 + a * 3,
    cornerWeight: 1 + Math.max(a, d) * 1.2,
    centerWeight: 1 + a * 0.9,
    blockWeight:  d * 2.4,
    randomness:   r * 3
  };
}

function getCpuCharacter(player) {
  if (player === state.humanPlayer) return null;
  let cpuIdx = 0;
  for (let i = 0; i < 4; i++) {
    if (i === state.humanPlayer) continue;
    if (i === player) return cpuCharacters[cpuIdx] || null;
    cpuIdx++;
  }
  return null;
}

// 24x24 uses all 21 standard + 7 hexominoes = 28 pieces, ~131 squares/player

// ===== Game State =====
// Core game state is in game-logic.js `state` object (Single Source of Truth)
// Below are UI-only variables
let selectedPieceIdx = null;
let currentShape = null;
let ghostPos = null;
let players = PLAYERS;
let cpuThinking = false;
let viewingPlayer = null;
let placeableCornersCache = null;
let undoState = null;
let hoverPos = null;

// ===== Canvas Setup =====
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
let cellSize = 0;

function resizeBoard() {
  const container = document.getElementById('board-container');
  const available = Math.min(container.clientWidth, container.clientHeight) - 8;
  cellSize = Math.floor(available / state.BOARD_SIZE);
  const size = cellSize * state.BOARD_SIZE;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawBoard();
}

// ===== Board Drawing =====
function drawBoard() {
  const logicalW = cellSize * state.BOARD_SIZE;
  ctx.clearRect(0, 0, logicalW, logicalW);

  for (let r = 0; r < state.BOARD_SIZE; r++) {
    for (let c = 0; c < state.BOARD_SIZE; c++) {
      const x = c * cellSize;
      const y = r * cellSize;
      if (state.board[r][c] >= 0) {
        ctx.fillStyle = players[state.board[r][c]].color;
        ctx.fillRect(x, y, cellSize, cellSize);
        ctx.strokeStyle = players[state.board[r][c]].light;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
      } else {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#2a2a4a' : '#252545';
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }
  }

  ctx.strokeStyle = '#333355';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= state.BOARD_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, state.BOARD_SIZE * cellSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(state.BOARD_SIZE * cellSize, i * cellSize);
    ctx.stroke();
  }

  // Highlight last placed piece for each player
  for (let pi = 0; pi < 4; pi++) {
    if (state.lastPlacedCells[pi].length > 0) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 6;
      for (const [lr, lc] of state.lastPlacedCells[pi]) {
        ctx.strokeRect(lc * cellSize + 2, lr * cellSize + 2, cellSize - 4, cellSize - 4);
      }
      ctx.shadowBlur = 0;
    }
  }

  // Starting corners
  const corners = [[0,0],[0,state.BOARD_SIZE-1],[state.BOARD_SIZE-1,state.BOARD_SIZE-1],[state.BOARD_SIZE-1,0]];
  corners.forEach((pos, i) => {
    if (state.board[pos[0]][pos[1]] < 0) {
      const cx = pos[1] * cellSize;
      const cy = pos[0] * cellSize;
      // Highlight current player's start corner prominently on first move
      if (isFirstMove(state.currentPlayer) && i === state.currentPlayer && !state.gameOver) {
        // Pulsing glow effect for current player's corner
        ctx.fillStyle = players[i].color;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(cx, cy, cellSize, cellSize);
        ctx.globalAlpha = 1;
        // Draw star marker
        ctx.fillStyle = players[i].light;
        ctx.font = Math.max(12, cellSize - 4) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u2605', cx + cellSize / 2, cy + cellSize / 2);
        // Bright border
        ctx.strokeStyle = players[i].light;
        ctx.lineWidth = 2;
        ctx.shadowColor = players[i].light;
        ctx.shadowBlur = 8;
        ctx.strokeRect(cx + 1, cy + 1, cellSize - 2, cellSize - 2);
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = players[i].color;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(cx, cy, cellSize, cellSize);
        ctx.globalAlpha = 1;
      }
    }
  });

  // Highlight corners where current player can actually place a piece (cached)
  if (!state.gameOver && !cpuThinking && !isCpuPlayer(state.currentPlayer) && placeableCornersCache) {
    for (const [cr, cc] of placeableCornersCache) {
      const dotX = cc * cellSize + cellSize / 2;
      const dotY = cr * cellSize + cellSize / 2;
      ctx.fillStyle = players[state.currentPlayer].light;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(dotX, dotY, cellSize * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // Ghost preview (ghostPos from touch/click, hoverPos from mouse hover)
  const previewPos = ghostPos || hoverPos;
  if (previewPos && currentShape) {
    const valid = canPlace(state.currentPlayer, currentShape, previewPos.r, previewPos.c);
    currentShape.forEach(([dr, dc]) => {
      const rr = previewPos.r + dr;
      const cc = previewPos.c + dc;
      if (rr >= 0 && rr < state.BOARD_SIZE && cc >= 0 && cc < state.BOARD_SIZE) {
        ctx.fillStyle = valid ? players[state.currentPlayer].light : '#ff0000';
        ctx.globalAlpha = 0.4;
        ctx.fillRect(cc * cellSize, rr * cellSize, cellSize, cellSize);
        ctx.globalAlpha = 1;
      }
    });
  }
}

// Get all unique orientations of a shape (up to 8: 4 rotations x 2 flips)
function rotatePiece() {
  if (cpuThinking) return;
  if (currentShape) {
    currentShape = normalize(rotateCW(currentShape));
    drawBoard();
    updatePieceList();
  }
}

function flipPiece() {
  if (cpuThinking) return;
  if (currentShape) {
    currentShape = normalize(flipH(currentShape));
    drawBoard();
    updatePieceList();
  }
}

// Web Worker for CPU AI (separate thread)
var cpuWorker = null;
var workerFailed = false;

function initWorker() {
  if (cpuWorker) return;
  try {
    cpuWorker = new Worker('./js/worker.js');
  } catch(e) {
    console.warn('Worker creation failed, using main thread fallback:', e);
    workerFailed = true;
    return;
  }

  cpuWorker.onmessage = function(e) {
    var move = e.data;
    if (move) {
      placePiece(state.currentPlayer, move.shape, move.br, move.bc);
      state.playerPieces[state.currentPlayer][move.idx].used = true;
      state.passCount = 0;
    } else {
      state.playerPassed[state.currentPlayer] = true;
      state.passCount++;
    }

    cpuThinking = false;
    document.getElementById('cpu-thinking').style.display = 'none';
    saveGame();

    if (state.passCount >= 4 || checkAllPassed()) {
      endGame();
      return;
    }

    nextTurn();
  };

  cpuWorker.onerror = function(e) {
    console.warn('Worker error, falling back to main thread:', e);
    workerFailed = true;
    if (cpuThinking) {
      setTimeout(cpuMoveFallback, 100);
    }
  };
}

function cleanupWorker() {
  if (cpuWorker) {
    cpuWorker.terminate();
    cpuWorker = null;
  }
}

initWorker();

window.addEventListener('beforeunload', cleanupWorker);

function cpuMoveFallback() {
  var ch = getCpuCharacter(state.currentPlayer);
  var params = getCpuParams(ch);
  var move = cpuMove(state.currentPlayer, params);

  if (move) {
    placePiece(state.currentPlayer, move.shape, move.br, move.bc);
    state.playerPieces[state.currentPlayer][move.idx].used = true;
    state.passCount = 0;
  } else {
    state.playerPassed[state.currentPlayer] = true;
    state.passCount++;
  }

  cpuThinking = false;
  document.getElementById('cpu-thinking').style.display = 'none';
  saveGame();

  if (state.passCount >= 4 || checkAllPassed()) {
    endGame();
    return;
  }

  nextTurn();
}

function executeCpuTurn() {
  if (state.gameOver || !isCpuPlayer(state.currentPlayer)) return;

  cpuThinking = true;
  document.getElementById('cpu-thinking').style.display = 'block';

  // Fallback to main thread if Worker is unavailable
  if (workerFailed || !cpuWorker) {
    setTimeout(cpuMoveFallback, 100);
    return;
  }

  var ch = getCpuCharacter(state.currentPlayer);
  var params = getCpuParams(ch);

  // Send state snapshot to worker (separate thread)
  cpuWorker.postMessage({
    state: {
      BOARD_SIZE: state.BOARD_SIZE,
      board: state.board.map(function(row) { return row.slice(); }),
      playerPieces: state.playerPieces.map(function(pp) { return pp.map(function(p) { return { shape: p.shape.map(function(s) { return s.slice(); }), used: p.used }; }); }),
      passCount: state.passCount,
      gameOver: state.gameOver,
      playerPassed: state.playerPassed.slice(),
      lastPlacedCells: state.lastPlacedCells.map(function(a) { return a.slice(); }),
      humanPlayer: state.humanPlayer,
      gameMode: state.gameMode,
    },
    player: state.currentPlayer,
    params: params
  });
}

function isCpuPlayer(p) {
  return state.gameMode === 'cpu' && p !== state.humanPlayer;
}

function checkAllPassed() {
  return state.playerPassed.every(p => p);
}

// ===== Piece Selection UI =====
function updatePieceList() {
  const list = document.getElementById('piece-list');
  list.innerHTML = '';
  const pieces = state.playerPieces[state.currentPlayer];
  const sortedIndices = pieces.map((_, i) => i).sort((a, b) => pieces[b].shape.length - pieces[a].shape.length);
  sortedIndices.forEach((idx) => {
    const p = pieces[idx];
    const div = document.createElement('div');
    div.className = 'piece-item' + (idx === selectedPieceIdx ? ' selected' : '') + (p.used ? ' used' : '');

    const shape = idx === selectedPieceIdx && currentShape ? currentShape : p.shape;
    const maxR = Math.max(...shape.map(s => s[0])) + 1;
    const maxC = Math.max(...shape.map(s => s[1])) + 1;
    const cs = Math.min(20, Math.floor(60 / Math.max(maxR, maxC)));
    const cvs = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    const lw = maxC * cs + 2;
    const lh = maxR * cs + 2;
    cvs.width = lw * dpr;
    cvs.height = lh * dpr;
    cvs.style.width = lw + 'px';
    cvs.style.height = lh + 'px';
    const cx = cvs.getContext('2d');
    cx.scale(dpr, dpr);
    shape.forEach(([r, c]) => {
      cx.fillStyle = players[state.currentPlayer].color;
      cx.fillRect(c * cs + 1, r * cs + 1, cs - 1, cs - 1);
    });
    div.appendChild(cvs);

    if (!p.used) {
      div.onclick = () => selectPiece(idx);
    }
    list.appendChild(div);
  });
}

function deselectPiece() {
  selectedPieceIdx = null;
  currentShape = null;
  ghostPos = null;
  hoverPos = null;
  document.getElementById('deselect-btn').style.display = 'none';
  drawBoard();
  updatePieceList();
}

function selectPiece(idx) {
  if (cpuThinking) return;
  if (isCpuPlayer(state.currentPlayer)) return;
  if (selectedPieceIdx === idx) {
    selectedPieceIdx = null;
    currentShape = null;
  } else {
    selectedPieceIdx = idx;
    currentShape = [...state.playerPieces[state.currentPlayer][idx].shape.map(s => [...s])];
  }
  ghostPos = null;
  hoverPos = null;
  document.getElementById('deselect-btn').style.display = selectedPieceIdx !== null ? 'inline-block' : 'none';
  drawBoard();
  updatePieceList();
}

// ===== Touch / Click on Board =====
function getBoardCell(x, y) {
  const rect = canvas.getBoundingClientRect();
  const c = Math.floor((x - rect.left) / cellSize);
  const r = Math.floor((y - rect.top) / cellSize);
  return { r, c };
}

canvas.addEventListener('mousemove', (e) => {
  if (tetrominoMode) return;
  if (!currentShape || cpuThinking || state.gameOver) return;
  if (isCpuPlayer(state.currentPlayer)) return;
  const pos = getBoardCell(e.clientX, e.clientY);
  const midR = Math.round(currentShape.reduce((sum, s) => sum + s[0], 0) / currentShape.length);
  const midC = Math.round(currentShape.reduce((sum, s) => sum + s[1], 0) / currentShape.length);
  hoverPos = { r: pos.r - midR, c: pos.c - midC };
  drawBoard();
});

canvas.addEventListener('mouseleave', () => {
  if (tetrominoMode) return;
  if (hoverPos) {
    hoverPos = null;
    drawBoard();
  }
});

canvas.addEventListener('click', (e) => {
  if (tetrominoMode) return;
  if (state.gameOver || cpuThinking) return;
  if (isCpuPlayer(state.currentPlayer)) return;
  const pos = getBoardCell(e.clientX, e.clientY);
  handleBoardTap(pos);
});

canvas.addEventListener('touchstart', (e) => {
  if (tetrominoMode) return;
  e.preventDefault();
  if (state.gameOver || cpuThinking) return;
  if (isCpuPlayer(state.currentPlayer)) return;
  const touch = e.touches[0];
  const pos = getBoardCell(touch.clientX, touch.clientY);
  handleBoardTap(pos);
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  if (tetrominoMode) return;
  e.preventDefault();
  if (!currentShape || cpuThinking) return;
  if (isCpuPlayer(state.currentPlayer)) return;
  const touch = e.touches[0];
  const pos = getBoardCell(touch.clientX, touch.clientY);
  const midR = Math.round(currentShape.reduce((sum, s) => sum + s[0], 0) / currentShape.length);
  const midC = Math.round(currentShape.reduce((sum, s) => sum + s[1], 0) / currentShape.length);
  ghostPos = { r: pos.r - midR, c: pos.c - midC };
  drawBoard();
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
  if (tetrominoMode) return;
  e.preventDefault();
  if (ghostPos && currentShape && !cpuThinking && !isCpuPlayer(state.currentPlayer) && selectedPieceIdx !== null) {
    // ghostPos is already centered, so place directly without re-centering
    if (canPlace(state.currentPlayer, currentShape, ghostPos.r, ghostPos.c)) {
      // Save undo snapshot before placing
      saveUndoState(selectedPieceIdx);
      placePiece(state.currentPlayer, currentShape, ghostPos.r, ghostPos.c);
      state.playerPieces[state.currentPlayer][selectedPieceIdx].used = true;
      selectedPieceIdx = null;
      currentShape = null;
      ghostPos = null;
      state.passCount = 0;

      if (tutorialActive) {
        updateTurnIndicator();
        updatePieceList();
        drawBoard();
        onTutorialPiecePlaced();
        return;
      }

      saveGame();
      nextTurn();
    } else {
      if (tutorialActive) onTutorialPlacementFailed();
      ghostPos = null;
      drawBoard();
    }
  }
}, { passive: false });

function saveUndoState(pieceIdx) {
  undoState = {
    board: state.board.map(row => [...row]),
    currentPlayer: state.currentPlayer,
    pieceIdx: pieceIdx,
    pieceUsed: state.playerPieces.map(pp => pp.map(p => p.used)),
    passCount: state.passCount,
    playerPassed: [...state.playerPassed],
    lastPlacedCells: state.lastPlacedCells.map(a => [...a])
  };
  document.getElementById('undo-btn').disabled = false;
}

function undoMove() {
  if (!undoState || state.gameOver || cpuThinking) return;

  // Restore state
  state.board = undoState.board;
  state.currentPlayer = undoState.currentPlayer;
  state.passCount = undoState.passCount;
  state.playerPassed = undoState.playerPassed;
  state.lastPlacedCells = undoState.lastPlacedCells.map(a => [...a]);
  for (let p = 0; p < 4; p++) {
    for (let idx = 0; idx < state.playerPieces[p].length; idx++) {
      state.playerPieces[p][idx].used = undoState.pieceUsed[p][idx];
    }
  }

  selectedPieceIdx = null;
  currentShape = null;
  ghostPos = null;
  undoState = null;
  document.getElementById('undo-btn').disabled = true;


  updateTurnIndicator();
  updatePieceList();
  drawBoard();
  saveGame();
}

function handleBoardTap(pos) {
  if (!currentShape || selectedPieceIdx === null) {
    ghostPos = null;
    drawBoard();
    return;
  }

  const midR = Math.round(currentShape.reduce((sum, s) => sum + s[0], 0) / currentShape.length);
  const midC = Math.round(currentShape.reduce((sum, s) => sum + s[1], 0) / currentShape.length);
  const br = pos.r - midR;
  const bc = pos.c - midC;
  if (canPlace(state.currentPlayer, currentShape, br, bc)) {
    // Save undo snapshot before placing
    saveUndoState(selectedPieceIdx);
    placePiece(state.currentPlayer, currentShape, br, bc);
    state.playerPieces[state.currentPlayer][selectedPieceIdx].used = true;
    selectedPieceIdx = null;
    currentShape = null;
    ghostPos = null;
    state.passCount = 0;

    if (tutorialActive) {
      updateTurnIndicator();
      updatePieceList();
      drawBoard();
      onTutorialPiecePlaced();
      return;
    }

    saveGame();

    nextTurn();
  } else {
    // Placement failed
    if (tutorialActive) onTutorialPlacementFailed();
  }
  // Do NOT deselect on invalid placement - keep piece selected so user can try again
}

// ===== Save Error Toast =====
function showSaveErrorToast() {
  var toast = document.getElementById('save-error-toast');
  toast.style.display = 'block';
  toast.style.animation = 'none';
  toast.offsetHeight;
  toast.style.animation = 'fadeInOut 3s ease-in-out';
  setTimeout(function() { toast.style.display = 'none'; }, 3000);
}

// ===== Auto Pass =====
function showAutoPassToast(player, callback) {
  const toast = document.getElementById('auto-pass-toast');
  const nameSpan = toast.querySelector('.pass-name');
  nameSpan.textContent = players[player].name;
  nameSpan.style.color = players[player].color;
  toast.style.display = 'block';

  // Remove and re-add to restart animation
  toast.style.animation = 'none';
  toast.offsetHeight; // trigger reflow
  toast.style.animation = '';

  setTimeout(() => {
    toast.style.display = 'none';
    if (callback) callback();
  }, 1800);
}

// ===== Turn Management =====
function nextTurn() {
  state.currentPlayer = (state.currentPlayer + 1) % 4;

  let skipped = 0;
  while (state.playerPassed[state.currentPlayer] && skipped < 4) {
    state.currentPlayer = (state.currentPlayer + 1) % 4;
    skipped++;
  }

  if (skipped >= 4 || state.passCount >= 4) {
    endGame();
    return;
  }

  updateTurnIndicator();
  updatePieceList();
  drawBoard();

  // Check if current player has any valid moves
  if (!state.gameOver && !state.playerPassed[state.currentPlayer] && !hasValidMove(state.currentPlayer)) {
    // Auto-pass with notification
    showAutoPassToast(state.currentPlayer, () => {
      state.playerPassed[state.currentPlayer] = true;
      state.passCount++;
      saveGame();
      if (state.passCount >= 4 || checkAllPassed()) {
        endGame();
      } else {
        nextTurn();
      }
    });
    return;
  }

  // If CPU player's turn, auto-play
  if (isCpuPlayer(state.currentPlayer) && !state.gameOver) {
    setTimeout(executeCpuTurn, 500);
  }
}

function passTurn() {
  if (tutorialActive) return;
  if (state.gameOver || cpuThinking) return;
  if (isCpuPlayer(state.currentPlayer)) return;
  state.playerPassed[state.currentPlayer] = true;
  state.passCount++;
  selectedPieceIdx = null;
  currentShape = null;
  ghostPos = null;
  saveGame();
  if (state.passCount >= 4 || checkAllPassed()) {
    endGame();
  } else {
    nextTurn();
  }
}

function updatePlaceableCorners() {
  placeableCornersCache = [];
  if (state.gameOver || isCpuPlayer(state.currentPlayer)) return;
  const cp = getCornerPositions(state.currentPlayer);
  const pieces = state.playerPieces[state.currentPlayer];
  for (const [cr, cc] of cp) {
    let canUse = false;
    for (let idx = 0; idx < pieces.length && !canUse; idx++) {
      if (pieces[idx].used) continue;
      const orientations = getAllOrientations(pieces[idx].shape);
      for (const orient of orientations) {
        if (canUse) break;
        for (const [dr, dc] of orient) {
          if (canPlace(state.currentPlayer, orient, cr - dr, cc - dc)) {
            canUse = true;
            break;
          }
        }
      }
    }
    if (canUse) placeableCornersCache.push([cr, cc]);
  }
}

function updateTurnIndicator() {
  const el = document.getElementById('turn-indicator');
  const p = players[state.currentPlayer];
  el.textContent = '● ' + p.name;
  el.style.background = p.color;
  // Clear viewing mode on turn change
  viewingPlayer = null;
  document.getElementById('viewing-label').style.display = 'none';
  updatePlaceableCorners();
  updateStatsBar();
}

function updateStatsBar() {
  const bar = document.getElementById('stats-bar');
  bar.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const pieces = state.playerPieces[i];
    if (!pieces) continue;
    const remaining = pieces.filter(p => !p.used).length;
    const remainingSquares = pieces.filter(p => !p.used).reduce((sum, p) => sum + p.shape.length, 0);
    const div = document.createElement('div');
    div.className = 'stat-item' + (i === state.currentPlayer ? ' active' : '') + (viewingPlayer === i ? ' viewing' : '');
    const nameRow = document.createElement('div');
    nameRow.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:3px;';
    // Add pixel art for CPU characters
    const ch = (state.gameMode === 'cpu' && i !== state.humanPlayer) ? getCpuCharacter(i) : null;
    if (ch && CHAR_PIXELS[ch.id]) {
      const cvs = document.createElement('canvas');
      cvs.width = 16; cvs.height = 16;
      cvs.style.cssText = 'width:14px;height:14px;image-rendering:pixelated;';
      cvs.className = getCharBreatheClass(ch.id);
      drawCharPixelArt(cvs, ch.id);
      nameRow.appendChild(cvs);
    }
    const nameSpan = document.createElement('span');
    nameSpan.className = 'stat-name';
    nameSpan.style.color = players[i].color;
    nameSpan.textContent = players[i].name;
    nameRow.appendChild(nameSpan);
    const valueSpan = document.createElement('div');
    valueSpan.className = 'stat-value';
    valueSpan.textContent = String(remaining).padStart(2, '\u2007') + 'pcs / ' + String(remainingSquares).padStart(2, '\u2007') + 'sq';
    div.appendChild(nameRow);
    div.appendChild(valueSpan);
    div.onclick = () => toggleViewPlayer(i);
    bar.appendChild(div);
  }
}

function toggleViewPlayer(playerIdx) {
  if (viewingPlayer === playerIdx || playerIdx === state.currentPlayer) {
    // Tap again or tap current player = back to own pieces
    viewingPlayer = null;
    document.getElementById('viewing-label').style.display = 'none';
    updatePieceList();
  } else {
    viewingPlayer = playerIdx;
    const label = document.getElementById('viewing-label');
    label.querySelector('span').textContent = players[playerIdx].name;
    label.querySelector('span').style.color = players[playerIdx].color;
    label.style.display = 'block';
    showPlayerPieces(playerIdx);
  }
  updateStatsBar();
}

function showPlayerPieces(playerIdx) {
  const list = document.getElementById('piece-list');
  list.innerHTML = '';
  const pieces = state.playerPieces[playerIdx];
  const sortedIndices = pieces.map((_, i) => i).filter(i => !pieces[i].used).sort((a, b) => pieces[b].shape.length - pieces[a].shape.length);
  sortedIndices.forEach((idx) => {
    const p = pieces[idx];
    const div = document.createElement('div');
    div.className = 'piece-item';
    const shape = p.shape;
    const maxR = Math.max(...shape.map(s => s[0])) + 1;
    const maxC = Math.max(...shape.map(s => s[1])) + 1;
    const cs = Math.min(20, Math.floor(60 / Math.max(maxR, maxC)));
    const cvs = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    const lw = maxC * cs + 2;
    const lh = maxR * cs + 2;
    cvs.width = lw * dpr;
    cvs.height = lh * dpr;
    cvs.style.width = lw + 'px';
    cvs.style.height = lh + 'px';
    const cx = cvs.getContext('2d');
    cx.scale(dpr, dpr);
    shape.forEach(([r, c]) => {
      cx.fillStyle = players[playerIdx].color;
      cx.fillRect(c * cs + 1, r * cs + 1, cs - 1, cs - 1);
    });
    div.appendChild(cvs);
    list.appendChild(div);
  });
}

function showScores() {
  const body = document.getElementById('modal-body');
  body.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'scores';

  if (state.gameMode === 'puzzle') {
    // Puzzle mode: show remaining pieces per color
    players.forEach((p, i) => {
      const pieces = state.playerPieces[i];
      const remaining = pieces.filter(pc => !pc.used);
      const remainingCells = remaining.reduce((sum, pc) => sum + pc.shape.length, 0);
      const row = document.createElement('div');
      row.className = 'score-row';
      const nameHtml = `<span style="color:${p.color}">${p.name}</span>`;
      const statusHtml = remaining.length === 0
        ? '<span style="color:#00c896;">ALL PLACED</span>'
        : `<span>${remaining.length}pcs / ${remainingCells}sq left</span>`;
      row.innerHTML = nameHtml + statusHtml;
      div.appendChild(row);
    });
    body.appendChild(div);
    const totalPieces = state.playerPieces.reduce((sum, pp) => sum + pp.length, 0);
    const placedPieces = state.playerPieces.reduce((sum, pp) => sum + pp.filter(p => p.used).length, 0);
    const totalDiv = document.createElement('div');
    totalDiv.style.cssText = 'margin-top:12px;font-size:14px;color:#aaa;';
    totalDiv.textContent = placedPieces + ' / ' + totalPieces + ' pieces placed';
    body.appendChild(totalDiv);
  } else {
    // Sort players by score descending for ranking
    const ranked = players.map((p, i) => ({ player: p, idx: i, score: getScore(i) }));
    ranked.sort((a, b) => b.score - a.score);
    ranked.forEach((r, pos) => {
      const row = document.createElement('div');
      row.className = 'score-row';
      const isMe = (state.gameMode === 'cpu' && r.idx === state.humanPlayer);
      const rankLabel = '#' + (pos + 1);
      const nameHtml = `<span style="color:${r.player.color}">${rankLabel} ${r.player.name}</span>`;
      const scoreHtml = `<span>${r.score}pts</span>`;
      row.innerHTML = nameHtml + scoreHtml;
      if (isMe) row.style.cssText = 'font-size:17px;font-weight:bold;';
      div.appendChild(row);
    });
    body.appendChild(div);
  }

  document.getElementById('modal-title').textContent = state.gameMode === 'puzzle' ? 'PROGRESS' : 'SCORE';
  document.getElementById('modal-close-btn').style.display = state.gameOver ? 'none' : '';
  document.getElementById('restart-btn').style.display = state.gameOver ? 'inline-block' : 'none';
  document.getElementById('modal-overlay').classList.add('show');
}

function closeModal() {
  if (state.gameOver) return; // Game over: must use TITLE button
  document.getElementById('modal-overlay').classList.remove('show');
}

function endGame() {
  state.gameOver = true;

  // Puzzle mode result
  if (state.gameMode === 'puzzle') {
    // Puzzle mode: check if all pieces were placed
    const allPlaced = state.playerPieces.every(pp => pp.every(p => p.used));
    const title = allPlaced ? 'PUZZLE CLEAR!' : 'PUZZLE FAILED';

    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-close-btn').style.display = 'none';
    document.getElementById('restart-btn').style.display = 'inline-block';

    const body = document.getElementById('modal-body');
    body.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'scores';

    // Show each color's remaining pieces
    players.forEach((p, i) => {
      const remaining = state.playerPieces[i].filter(pc => !pc.used);
      const remainingCells = remaining.reduce((sum, pc) => sum + pc.shape.length, 0);
      const row = document.createElement('div');
      row.className = 'score-row';
      const nameHtml = `<span style="color:${p.color}">${p.name}</span>`;
      const statusHtml = remaining.length === 0
        ? '<span style="color:#00c896;">ALL PLACED</span>'
        : `<span>${remaining.length}pcs / ${remainingCells}sq left</span>`;
      row.innerHTML = nameHtml + statusHtml;
      div.appendChild(row);
    });
    body.appendChild(div);

    // Total placed stats
    const totalPieces = state.playerPieces.reduce((sum, pp) => sum + pp.length, 0);
    const placedPieces = state.playerPieces.reduce((sum, pp) => sum + pp.filter(p => p.used).length, 0);
    const totalDiv = document.createElement('div');
    totalDiv.style.cssText = 'margin-top:12px;font-size:14px;color:#aaa;';
    totalDiv.textContent = placedPieces + ' / ' + totalPieces + ' pieces placed';
    body.appendChild(totalDiv);

    if (allPlaced) {
      var nr = document.createElement('div');
      nr.className = 'new-record';
      nr.textContent = 'PERFECT';
      body.appendChild(nr);
    }

    document.getElementById('modal-overlay').classList.add('show');
    return;
  }

  // Accumulate scores for continuous mode
  if (continuousMode) {
    players.forEach((p, i) => {
      seriesScores[i] += getScore(i);
    });
  }

  // Check if this is a mid-series round
  if (continuousMode && currentRound < totalRounds) {
    showRoundResult();
    return;
  }

  // Final result (single game or last round of series)
  if (continuousMode) {
    showSeriesFinalResult();
    return;
  }

  // Standard single-game result
  showSingleGameResult();
}

function showSingleGameResult() {
  let best = -999, winner = 0;
  players.forEach((p, i) => {
    const s = getScore(i);
    if (s > best) { best = s; winner = i; }
  });

  let title;
  if (state.gameMode === 'cpu') {
    title = winner === state.humanPlayer ? 'YOU WIN!' : players[winner].name + ' WINS';
  } else {
    title = players[winner].name + ' WINS!';
  }
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-close-btn').style.display = 'none';
  document.getElementById('restart-btn').style.display = 'inline-block';

  const body = document.getElementById('modal-body');
  body.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'scores';
  const ranked = players.map((p, i) => ({ player: p, idx: i, score: getScore(i) }));
  ranked.sort((a, b) => b.score - a.score);
  ranked.forEach((r, pos) => {
    const row = document.createElement('div');
    row.className = 'score-row';
    row.style.alignItems = 'center';
    const isMe = (state.gameMode === 'cpu' && r.idx === state.humanPlayer);
    const rankLabel = '#' + (pos + 1);
    const nameSpanEl = document.createElement('span');
    nameSpanEl.style.cssText = 'display:flex;align-items:center;gap:4px;color:' + r.player.color;
    // Add character sprite for CPU players in results
    const rCh = (state.gameMode === 'cpu' && r.idx !== state.humanPlayer) ? getCpuCharacter(r.idx) : null;
    if (rCh && CHAR_PIXELS[rCh.id]) {
      const rCvs = document.createElement('canvas');
      rCvs.width = 16; rCvs.height = 16;
      rCvs.style.cssText = 'width:16px;height:16px;image-rendering:pixelated;';
      rCvs.className = getCharBreatheClass(rCh.id);
      drawCharPixelArt(rCvs, rCh.id);
      nameSpanEl.appendChild(rCvs);
    }
    nameSpanEl.appendChild(document.createTextNode(rankLabel + ' ' + r.player.name));
    const scoreSpanEl = document.createElement('span');
    scoreSpanEl.textContent = r.score + 'pts';
    row.appendChild(nameSpanEl);
    row.appendChild(scoreSpanEl);
    if (isMe) row.style.cssText = 'font-size:17px;font-weight:bold;';
    div.appendChild(row);
  });
  body.appendChild(div);

  var newRecord = recordGameResult();
  if (newRecord) {
    var nr = document.createElement('div');
    nr.className = 'new-record';
    nr.textContent = 'NEW RECORD';
    body.appendChild(nr);
  }

  document.getElementById('modal-overlay').classList.add('show');
}

function showRoundResult() {
  document.getElementById('modal-title').textContent = 'ROUND ' + currentRound + ' COMPLETE';
  document.getElementById('modal-close-btn').style.display = 'none';
  document.getElementById('restart-btn').style.display = 'none';

  const body = document.getElementById('modal-body');
  body.innerHTML = '';

  // This round's scores
  const div = document.createElement('div');
  div.className = 'scores';
  const ranked = players.map((p, i) => ({ player: p, idx: i, score: getScore(i) }));
  ranked.sort((a, b) => b.score - a.score);
  ranked.forEach((r, pos) => {
    const row = document.createElement('div');
    row.className = 'score-row';
    row.style.alignItems = 'center';
    const isMe = (r.idx === state.humanPlayer);
    const rankLabel = '#' + (pos + 1);
    const rnSpan = document.createElement('span');
    rnSpan.style.cssText = 'display:flex;align-items:center;gap:4px;color:' + r.player.color;
    const rnCh = (state.gameMode === 'cpu' && r.idx !== state.humanPlayer) ? getCpuCharacter(r.idx) : null;
    if (rnCh && CHAR_PIXELS[rnCh.id]) {
      const rnCvs = document.createElement('canvas');
      rnCvs.width = 16; rnCvs.height = 16;
      rnCvs.style.cssText = 'width:16px;height:16px;image-rendering:pixelated;';
      rnCvs.className = getCharBreatheClass(rnCh.id);
      drawCharPixelArt(rnCvs, rnCh.id);
      rnSpan.appendChild(rnCvs);
    }
    rnSpan.appendChild(document.createTextNode(rankLabel + ' ' + r.player.name));
    const rnScore = document.createElement('span');
    rnScore.textContent = r.score + 'pts';
    row.appendChild(rnSpan);
    row.appendChild(rnScore);
    if (isMe) row.style.cssText += 'font-size:17px;font-weight:bold;';
    div.appendChild(row);
  });
  body.appendChild(div);

  // Cumulative series scores
  const seriesDiv = document.createElement('div');
  seriesDiv.id = 'series-scores';
  seriesDiv.innerHTML = '<h3>TOTAL (' + currentRound + '/' + totalRounds + ')</h3>';
  const seriesRanked = players.map((p, i) => ({ player: p, idx: i, score: seriesScores[i] }));
  seriesRanked.sort((a, b) => b.score - a.score);
  seriesRanked.forEach(r => {
    const row = document.createElement('div');
    row.className = 'series-score-row';
    const isMe = (r.idx === state.humanPlayer);
    row.innerHTML = `<span style="color:${r.player.color}">${r.player.name}</span><span>${r.score}pts</span>`;
    if (isMe) row.style.fontWeight = 'bold';
    seriesDiv.appendChild(row);
  });
  body.appendChild(seriesDiv);

  // Next round button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'start-btn';
  nextBtn.style.cssText = 'margin-top:16px;width:100%;';
  nextBtn.textContent = 'NEXT ROUND';
  nextBtn.addEventListener('click', startNextRound);
  body.appendChild(nextBtn);

  document.getElementById('modal-overlay').classList.add('show');
}

function startNextRound() {
  document.getElementById('modal-overlay').classList.remove('show');
  currentRound++;
  updateRoundIndicator();
  initGame();
}

function showSeriesFinalResult() {
  let best = -999, winner = 0;
  seriesScores.forEach((s, i) => {
    if (s > best) { best = s; winner = i; }
  });

  const title = winner === state.humanPlayer ? 'YOU WIN THE SERIES!' : players[winner].name + ' WINS THE SERIES!';
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-close-btn').style.display = 'none';
  document.getElementById('restart-btn').style.display = 'inline-block';

  const body = document.getElementById('modal-body');
  body.innerHTML = '';

  // Final round scores
  const roundDiv = document.createElement('div');
  roundDiv.className = 'scores';
  const roundRanked = players.map((p, i) => ({ player: p, idx: i, score: getScore(i) }));
  roundRanked.sort((a, b) => b.score - a.score);
  roundRanked.forEach((r, pos) => {
    const row = document.createElement('div');
    row.className = 'score-row';
    const isMe = (r.idx === state.humanPlayer);
    const rankLabel = '#' + (pos + 1);
    row.innerHTML = `<span style="color:${r.player.color}">${rankLabel} ${r.player.name}</span><span>${r.score}pts</span>`;
    if (isMe) row.style.cssText = 'font-size:17px;font-weight:bold;';
    roundDiv.appendChild(row);
  });
  body.appendChild(roundDiv);

  // Final cumulative scores
  const seriesDiv = document.createElement('div');
  seriesDiv.id = 'series-scores';
  seriesDiv.innerHTML = '<h3>FINAL TOTAL</h3>';
  const seriesRanked = players.map((p, i) => ({ player: p, idx: i, score: seriesScores[i] }));
  seriesRanked.sort((a, b) => b.score - a.score);
  seriesRanked.forEach(r => {
    const row = document.createElement('div');
    row.className = 'series-score-row';
    const isMe = (r.idx === state.humanPlayer);
    row.innerHTML = `<span style="color:${r.player.color}">${r.player.name}</span><span>${r.score}pts</span>`;
    if (isMe) row.style.fontWeight = 'bold';
    seriesDiv.appendChild(row);
  });
  body.appendChild(seriesDiv);

  document.getElementById('modal-overlay').classList.add('show');
  resetContinuousState();
}

// ===== Save / Load =====
function saveGame() {
  try {
    const saveData = {
      board: state.board,
      currentPlayer: state.currentPlayer,
      passCount: state.passCount,
      gameOver: state.gameOver,
      playerPassed: state.playerPassed,
      gameMode: state.gameMode,
      humanPlayer: state.humanPlayer,
      pieceUsed: state.playerPieces.map(pp => pp.map(p => p.used)),
      cpuCharacterIds: cpuCharacters.map(c => c ? c.id : null),
      boardSize: state.BOARD_SIZE,
      timestamp: Date.now(),
      // Continuous battle state
      continuousMode: continuousMode,
      totalRounds: totalRounds,
      currentRound: currentRound,
      seriesScores: seriesScores
    };
    localStorage.setItem('kado_save', JSON.stringify(saveData));
  } catch(e) {
    console.warn('Save failed:', e);
    showSaveErrorToast();
  }
}

function loadGame() {
  try {
    const json = localStorage.getItem('kado_save');
    if (!json) return null;
    return JSON.parse(json);
  } catch(e) {
    return null;
  }
}

function deleteSave() {
  localStorage.removeItem('kado_save');
  updateContinueButton();
}

function resumeGame() {
  const save = loadGame();
  if (!save) return;

  // Restore game state via SSoT
  restoreState(save);

  // Restore CPU characters from save
  if (save.cpuCharacterIds) {
    cpuCharacters = save.cpuCharacterIds.map(id => CPU_CHARACTERS.find(c => c.id === id) || CPU_CHARACTERS[0]);
  } else {
    cpuCharacters = [CPU_CHARACTERS[3], CPU_CHARACTERS[4], CPU_CHARACTERS[5]];
  }
  // Rebuild players array
  if (state.gameMode === 'cpu') {
    const colors = [
      { color: '#0072B2', light: '#4da6d9' },
      { color: '#F0E442', light: '#f5ed7a' },
      { color: '#9467BD', light: '#b394d4' },
      { color: '#D55E00', light: '#e8885a' }
    ];
    let cpuIdx = 0;
    players = [];
    for (let i = 0; i < 4; i++) {
      if (i === state.humanPlayer) {
        players.push({ id: i, name: 'YOU', ...colors[i] });
      } else {
        const ch = cpuCharacters[cpuIdx];
        const cpuName = ch ? ch.name : 'CPU' + (cpuIdx + 1);
        players.push({ id: i, name: cpuName, ...colors[i] });
        cpuIdx++;
      }
    }
  } else if (state.gameMode === 'puzzle') {
    players = PLAYERS_PUZZLE;
  } else {
    players = PLAYERS_LOCAL;
  }

  // Restore continuous battle state
  if (save.continuousMode) {
    continuousMode = true;
    totalRounds = save.totalRounds;
    currentRound = save.currentRound;
    seriesScores = save.seriesScores;
  } else {
    resetContinuousState();
  }

  withViewTransition(() => {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';

    // Show board size label
    const sizeLabel = document.getElementById('board-size-label');
    sizeLabel.textContent = state.BOARD_SIZE + '×' + state.BOARD_SIZE;
    sizeLabel.style.display = '';

    selectedPieceIdx = null;
    currentShape = null;
    ghostPos = null;
    cpuThinking = false;
    updateRoundIndicator();
    updateTurnIndicator();
    resizeBoard();
    updatePieceList();

    // If it's CPU's turn, auto-play
    if (isCpuPlayer(state.currentPlayer) && !state.gameOver) {
      setTimeout(executeCpuTurn, 500);
    }
  });
}

function updateContinueButton() {
  const btn = document.getElementById('continue-btn');
  const save = loadGame();
  if (save && !save.gameOver) {
    const date = new Date(save.timestamp);
    const timeStr = date.toLocaleString('ja-JP', { month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' });
    const modeStr = save.gameMode === 'cpu' ? 'vs CPU' : save.gameMode === 'puzzle' ? 'Perfect Place' : 'Local 4P';
    btn.querySelector('.sub').textContent = modeStr + ' - ' + timeStr;
    btn.style.display = '';
  } else {
    btn.style.display = 'none';
  }
}

// Initialize event listeners and UI after DOM is ready
// (script loads before stats-overlay and rules-overlay elements)
document.addEventListener('DOMContentLoaded', function() {
  setupEventListeners();
  updateContinueButton();
});

// iOS Safari ピンチズーム防止（user-scalable=no が無視されるため）
document.addEventListener('touchmove', (e) => {
  if (e.touches.length >= 2) {
    e.preventDefault();
  }
}, { passive: false });

// ===== Start / Init =====
function showOrderSelect() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('order-select').style.display = 'flex';
}

function hideOrderSelect() {
  document.getElementById('order-select').style.display = 'none';
  document.getElementById('board-size-screen').style.display = 'flex';
}

function selectOrder(order) {
  state.humanPlayer = order;
  document.getElementById('order-select').style.display = 'none';
  if (pendingGameMode === 'continuous') {
    showRoundSelect();
  } else {
    showCharSelectScreen();
  }
}

function showCharSelectScreen() {
  document.getElementById('char-select').style.display = 'flex';
  // Hide title to save space on mobile
  document.querySelector('#start-screen > h1').style.display = 'none';
  document.querySelector('#start-screen > p').style.display = 'none';
  charSelectSlot = 0;
  cpuCharacters = [null, null, null];
  renderCharSelect();
}

function showRoundSelect() {
  document.getElementById('round-select').style.display = 'flex';
}

function hideRoundSelect() {
  document.getElementById('round-select').style.display = 'none';
  document.getElementById('order-select').style.display = 'flex';
}

function confirmRounds(rounds) {
  totalRounds = rounds;
  currentRound = 1;
  continuousMode = true;
  seriesScores = [0, 0, 0, 0];
  document.getElementById('round-select').style.display = 'none';
  showCharSelectScreen();
}

let charSelectSlot = 0;

function charSelectBack() {
  if (charSelectSlot > 0) {
    charSelectSlot--;
    cpuCharacters[charSelectSlot] = null;
    document.getElementById('char-start-btn').style.display = 'none';
    renderCharSelect();
  } else {
    document.getElementById('char-select').style.display = 'none';
    document.querySelector('#start-screen > h1').style.display = '';
    document.querySelector('#start-screen > p').style.display = '';
    if (pendingGameMode === 'continuous') {
      document.getElementById('round-select').style.display = 'flex';
    } else {
      document.getElementById('order-select').style.display = 'flex';
    }
  }
}

function buildStatBar(label, value) {
  var filled = '';
  var empty = '';
  for (var i = 0; i < 5; i++) {
    if (i < value) filled += '●';
    else empty += '○';
  }
  return '<div class="char-stat-row"><span class="char-stat-label">' + label + '</span><span class="char-stat-dots"><span class="char-stat-filled">' + filled + '</span><span class="char-stat-empty">' + empty + '</span></span></div>';
}

function renderCharSelect() {
  const label = document.getElementById('char-slot-label');
  const slotNum = charSelectSlot + 1;
  const colors = ['#f5ed7a', '#b394d4', '#e8885a'];
  // Adjust slot display based on human position
  let displayPositions = [];
  for (let i = 0; i < 4; i++) {
    if (i === state.humanPlayer) continue;
    displayPositions.push(i + 1);
  }
  const ordinal = displayPositions[charSelectSlot];
  label.textContent = 'Pick #' + slotNum + ' (' + ordinal + ')';
  label.style.color = colors[charSelectSlot];

  const grid = document.getElementById('char-grid');
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = 'auto repeat(3, 1fr)';
  // Column headers (empty corner + 3 playstyle labels)
  var corner = document.createElement('div');
  corner.className = 'char-grid-header';
  grid.appendChild(corner);
  var colHeaders = ['ATK', 'DEF', 'RANDOM'];
  colHeaders.forEach(function(h) {
    var hdr = document.createElement('div');
    hdr.className = 'char-grid-header';
    hdr.textContent = h;
    grid.appendChild(hdr);
  });
  // Grid layout: rows = Tier (strong→weak), cols = playstyle (ATK, DEF, RANDOM)
  var tiers = [
    { label: 'Tier1', chars: [0, 1, 2] },
    { label: 'Tier2', chars: [3, 4, 5] },
    { label: 'Tier3', chars: [6, 7, 8] }
  ];
  tiers.forEach(function(tier) {
    var rowLabel = document.createElement('div');
    rowLabel.className = 'char-grid-tier';
    rowLabel.textContent = tier.label;
    grid.appendChild(rowLabel);
    tier.chars.forEach(function(i) {
    var ch = CPU_CHARACTERS[i];
    const card = document.createElement('div');
    card.className = 'char-card';
    const cvs = document.createElement('canvas');
    cvs.width = 16; cvs.height = 16;
    cvs.style.cssText = 'image-rendering:pixelated;width:40px;height:40px;';
    cvs.className = getCharBreatheClass(ch.id);
    card.appendChild(cvs);
    const info = document.createElement('div');
    info.className = 'char-info';
    info.innerHTML = '<span class="char-name">' + ch.name + '</span>' +
      '<span class="char-caption">' + ch.caption + '</span>';
    card.appendChild(info);
    // Stat tooltip (shown on hover/tap)
    const tooltip = document.createElement('div');
    tooltip.className = 'char-tooltip';
    tooltip.innerHTML = '<div class="char-tooltip-name">' + ch.name + '</div>' +
      '<div class="char-tooltip-caption">"' + ch.caption + '"</div>' +
      buildStatBar('ATK', ch.atk) +
      buildStatBar('DEF', ch.def) +
      buildStatBar('RANDOM', ch.rng);
    card.appendChild(tooltip);
    drawCharPixelArt(cvs, ch.id);
    // Long-press shows tooltip on mobile, short tap selects
    var pressTimer = null;
    var longPressed = false;
    card.addEventListener('touchstart', function(e) {
      longPressed = false;
      pressTimer = setTimeout(function() {
        longPressed = true;
        tooltip.style.display = 'block';
      }, 400);
    }, { passive: true });
    card.addEventListener('touchend', function(e) {
      clearTimeout(pressTimer);
      if (longPressed) {
        tooltip.style.display = '';
        longPressed = false;
        e.preventDefault();
      }
    });
    card.addEventListener('touchmove', function() {
      clearTimeout(pressTimer);
      tooltip.style.display = '';
    }, { passive: true });
    card.onclick = function() { if (!longPressed) pickCharacter(i); };
    grid.appendChild(card);
    });
  });
}

function pickCharacter(charIdx) {
  cpuCharacters[charSelectSlot] = CPU_CHARACTERS[charIdx];
  charSelectSlot++;

  if (charSelectSlot >= 3) {
    document.getElementById('char-start-btn').style.display = '';
    document.getElementById('char-slot-label').textContent = 'ALL SET!';
    // Show selected summary
    const grid = document.getElementById('char-grid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
    cpuCharacters.forEach((ch, i) => {
      const card = document.createElement('div');
      card.className = 'char-card selected';
      let pos = 0, ci = 0;
      for (let p = 0; p < 4; p++) {
        if (p === state.humanPlayer) continue;
        if (ci === i) { pos = p + 1; break; }
        ci++;
      }
      const cvs = document.createElement('canvas');
      cvs.width = 16; cvs.height = 16;
      cvs.style.cssText = 'image-rendering:pixelated;width:40px;height:40px;';
      card.appendChild(cvs);
      const info = document.createElement('div');
      info.className = 'char-info';
      info.innerHTML = '<span class="char-name">#' + pos + ' ' + ch.name + '</span>' +
        '<span class="char-caption">' + ch.caption + '</span>' +
        buildStatBar('ATK', ch.atk) +
        buildStatBar('DEF', ch.def) +
        buildStatBar('RANDOM', ch.rng);
      card.appendChild(info);
      drawCharPixelArt(cvs, ch.id);
      grid.appendChild(card);
    });
  } else {
    renderCharSelect();
  }
}

function confirmCharSelect() {
  // Flash selected cards with white glow before starting
  var cards = document.querySelectorAll('#char-grid .char-card');
  cards.forEach(function(card) {
    card.style.borderColor = '#fff';
    card.style.boxShadow = '0 0 20px rgba(255,255,255,0.5)';
  });
  document.getElementById('char-start-btn').disabled = true;
  setTimeout(function() {
    document.getElementById('char-select').style.display = 'none';
    document.getElementById('char-start-btn').disabled = false;
    startGame(pendingGameMode === 'continuous' ? 'continuous' : 'cpu');
  }, 600);
}

let selectedBoardSize = 20;
let pendingGameMode = 'cpu';

// Continuous Battle state
let continuousMode = false;
let totalRounds = 0;
let currentRound = 0;
let seriesScores = [0, 0, 0, 0]; // cumulative scores per player

function resetContinuousState() {
  continuousMode = false;
  totalRounds = 0;
  currentRound = 0;
  seriesScores = [0, 0, 0, 0];
  document.getElementById('round-indicator').classList.remove('show');
}

function updateRoundIndicator() {
  var el = document.getElementById('round-indicator');
  if (continuousMode) {
    el.textContent = 'R' + currentRound + '/' + totalRounds;
    el.classList.add('show');
  } else {
    el.classList.remove('show');
  }
}

function showBattleMenu() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('battle-menu').style.display = 'flex';
}

function hideBattleMenu() {
  document.getElementById('battle-menu').style.display = 'none';
  document.getElementById('main-menu').style.display = 'flex';
}

function showPuzzleMenu() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('puzzle-menu').style.display = 'flex';
}

function hidePuzzleMenu() {
  document.getElementById('puzzle-menu').style.display = 'none';
  document.getElementById('main-menu').style.display = 'flex';
}

function showBoardSizeSelect(mode) {
  pendingGameMode = mode;
  // Hide whichever submenu is showing
  document.getElementById('battle-menu').style.display = 'none';
  document.getElementById('puzzle-menu').style.display = 'none';
  // Update subtitles for puzzle mode to show total pieces
  if (mode === 'puzzle') {
    document.querySelector('#btn-size-14 .sub').textContent = '48 pieces (12 × 4 colors)';
    document.querySelector('#btn-size-20 .sub').textContent = '84 pieces (21 × 4 colors)';
    document.querySelector('#btn-size-24 .sub').textContent = '112 pieces (28 × 4 colors)';
  } else {
    document.querySelector('#btn-size-14 .sub').textContent = 'Quick Game · 12 pieces';
    document.querySelector('#btn-size-20 .sub').textContent = 'Standard · 21 pieces';
    document.querySelector('#btn-size-24 .sub').textContent = 'Deep Strategy · 28 pieces';
  }
  document.getElementById('board-size-screen').style.display = 'flex';
}

function hideBoardSizeSelect() {
  document.getElementById('board-size-screen').style.display = 'none';
  if (pendingGameMode === 'puzzle') {
    document.getElementById('puzzle-menu').style.display = 'flex';
  } else {
    document.getElementById('battle-menu').style.display = 'flex';
  }
}

function confirmBoardSize(size) {
  selectedBoardSize = size;
  document.getElementById('board-size-screen').style.display = 'none';
  if (pendingGameMode === 'cpu' || pendingGameMode === 'continuous') {
    showOrderSelect();
  } else if (pendingGameMode === 'puzzle') {
    startGame('puzzle');
  } else {
    startGame('local');
  }
}

function startGame(mode) {
  initWorker();
  state.BOARD_SIZE = selectedBoardSize;
  deleteSave(); // Clear old save when starting new game
  // For continuous mode, use 'cpu' internally for game logic
  state.gameMode = (mode === 'continuous') ? 'cpu' : mode;
  if (mode === 'local' || mode === 'puzzle') state.humanPlayer = -1; // No CPU

  // Build players array with human name at correct position
  if (mode === 'cpu' || mode === 'continuous') {
    const colors = [
      { color: '#0072B2', light: '#4da6d9' },
      { color: '#F0E442', light: '#f5ed7a' },
      { color: '#9467BD', light: '#b394d4' },
      { color: '#D55E00', light: '#e8885a' }
    ];
    let cpuIdx = 0;
    players = [];
    for (let i = 0; i < 4; i++) {
      if (i === state.humanPlayer) {
        players.push({ id: i, name: 'YOU', ...colors[i] });
      } else {
        const ch = cpuCharacters[cpuIdx];
        const cpuName = ch ? ch.name : 'CPU' + (cpuIdx + 1);
        players.push({ id: i, name: cpuName, ...colors[i] });
        cpuIdx++;
      }
    }
  } else if (mode === 'puzzle') {
    players = PLAYERS_PUZZLE;
  } else {
    players = PLAYERS_LOCAL;
  }

  withViewTransition(() => {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';

    if (continuousMode) {
      updateRoundIndicator();
    }

    // Show board size label
    const sizeLabel = document.getElementById('board-size-label');
    sizeLabel.textContent = selectedBoardSize + '×' + selectedBoardSize;
    sizeLabel.style.display = '';

    initGame();
  });
}

function initGame() {
  initState(selectedBoardSize, state.gameMode, state.humanPlayer);
  selectedPieceIdx = null;
  currentShape = null;
  ghostPos = null;
  cpuThinking = false;
  updateTurnIndicator();
  resizeBoard();
  updatePieceList();

  // Show puzzle intro overlay
  if (state.gameMode === 'puzzle') {
    const piecesPerPlayer = state.playerPieces[0].length;
    const totalPieces = piecesPerPlayer * 4;
    document.getElementById('puzzle-intro-size').textContent =
      state.BOARD_SIZE + '×' + state.BOARD_SIZE + ' board — ' + totalPieces + ' pieces (' + piecesPerPlayer + ' × 4 colors)';
    document.getElementById('puzzle-intro-overlay').classList.add('show');
    return;
  }

  // If first player is CPU, start their turn
  if (isCpuPlayer(state.currentPlayer) && !state.gameOver) {
    setTimeout(executeCpuTurn, 500);
  }
}

function loadStats() {
  try {
    const json = localStorage.getItem('kado_stats');
    if (!json) return { games: 0, wins: 0, ranks: [0,0,0,0], bestScore: null, totalScore: 0, history: [], charStats: {} };
    const stats = JSON.parse(json);
    if (!stats.history) stats.history = [];
    if (!stats.charStats) stats.charStats = {};
    return stats;
  } catch(e) {
    return { games: 0, wins: 0, ranks: [0,0,0,0], bestScore: null, totalScore: 0, history: [], charStats: {} };
  }
}

function saveStats(stats) {
  try {
    localStorage.setItem('kado_stats', JSON.stringify(stats));
  } catch(e) {
    console.warn('Stats save failed:', e);
    showSaveErrorToast();
  }
}

function recordGameResult() {
  if (state.gameMode !== 'cpu') return;
  const stats = loadStats();
  stats.games++;
  const scores = players.map((_, i) => getScore(i));
  const myScore = scores[state.humanPlayer];
  const sorted = [...scores].sort((a, b) => b - a);
  const rank = sorted.indexOf(myScore);
  if (rank >= 0 && rank < 4) stats.ranks[rank]++;
  if (rank === 0) stats.wins++;
  var isNewRecord = (stats.bestScore === null || myScore > stats.bestScore);
  if (isNewRecord) stats.bestScore = myScore;
  stats.totalScore += myScore;
  stats.history.push({ score: myScore, rank: rank + 1 });
  if (stats.history.length > 10) stats.history = stats.history.slice(-10);
  // Record per-character stats
  var won = (rank === 0);
  for (var ci = 0; ci < cpuCharacters.length; ci++) {
    var ch = cpuCharacters[ci];
    if (!ch) continue;
    if (!stats.charStats[ch.id]) stats.charStats[ch.id] = { games: 0, wins: 0, totalScore: 0 };
    stats.charStats[ch.id].games++;
    if (won) stats.charStats[ch.id].wins++;
    stats.charStats[ch.id].totalScore += myScore;
  }
  saveStats(stats);
  return isNewRecord;
}

function buildCharGrid(stats) {
  var grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:6px;';
  CPU_CHARACTERS.forEach(function(ch) {
    var cs = stats.charStats[ch.id];
    var hasData = cs && cs.games > 0;
    var cell = document.createElement('div');
    cell.style.cssText = 'text-align:center;padding:6px 2px;border:1px solid rgba(233,69,96,0.2);border-radius:4px;' + (hasData ? '' : 'opacity:0.3;');
    var cvs = document.createElement('canvas');
    cvs.width = 16; cvs.height = 16;
    cvs.style.cssText = 'width:20px;height:20px;image-rendering:pixelated;display:block;margin:0 auto 2px;';
    cvs.className = getCharBreatheClass(ch.id);
    drawCharPixelArt(cvs, ch.id);
    cell.appendChild(cvs);
    var nameEl = document.createElement('div');
    nameEl.style.cssText = 'font-size:10px;font-weight:bold;color:#eee;';
    nameEl.textContent = ch.name;
    cell.appendChild(nameEl);
    if (hasData) {
      var winRate = Math.round(cs.wins / cs.games * 100);
      var wl = document.createElement('div');
      wl.style.cssText = 'font-size:9px;color:#aaa;margin-top:2px;';
      wl.textContent = cs.wins + 'W ' + (cs.games - cs.wins) + 'L';
      cell.appendChild(wl);
      var pct = document.createElement('div');
      pct.style.cssText = 'font-size:11px;font-weight:bold;margin-top:1px;color:' + (winRate >= 50 ? '#4da6d9' : '#e94560') + ';';
      pct.textContent = winRate + '%';
      cell.appendChild(pct);
    } else {
      var noData = document.createElement('div');
      noData.style.cssText = 'font-size:9px;color:#555;margin-top:2px;';
      noData.textContent = '---';
      cell.appendChild(noData);
    }
    grid.appendChild(cell);
  });
  return grid;
}

function showStats() {
  const stats = loadStats();
  const body = document.getElementById('stats-body');
  body.innerHTML = '';

  // Create 2-column layout
  var columns = document.createElement('div');
  columns.id = 'stats-columns';
  var leftCol = document.createElement('div');
  leftCol.id = 'stats-left';
  var rightCol = document.createElement('div');
  rightCol.id = 'stats-right';

  // LEFT: general stats
  const rows = [
    ['Games', stats.games],
    ['Wins', stats.wins],
    ['Win Rate', stats.games > 0 ? Math.round(stats.wins / stats.games * 100) + '%' : '-'],
    ['1st Place', stats.ranks[0]],
    ['2nd Place', stats.ranks[1]],
    ['3rd Place', stats.ranks[2]],
    ['4th Place', stats.ranks[3]],
    ['Best Score', stats.bestScore !== null ? stats.bestScore + 'pts' : '-'],
    ['Avg Score', stats.games > 0 ? Math.round(stats.totalScore / stats.games) + 'pts' : '-'],
  ];
  rows.forEach(function(r) {
    var row = document.createElement('div');
    row.className = 'stat-row';
    row.innerHTML = '<span class="label">' + r[0] + '</span><span class="value">' + r[1] + '</span>';
    leftCol.appendChild(row);
  });
  // Graph
  if (stats.history.length > 0) {
    var title = document.createElement('div');
    title.style.cssText = 'margin-top:12px;font-size:12px;color:#aaa;text-align:center;';
    title.textContent = 'Last 10 Games';
    leftCol.appendChild(title);
    var cvs = document.createElement('canvas');
    var w = 300, h = 120;
    var dpr = window.devicePixelRatio || 1;
    cvs.width = w * dpr; cvs.height = h * dpr;
    cvs.style.cssText = 'width:100%;max-width:300px;margin:4px auto;display:block;';
    leftCol.appendChild(cvs);
    var gctx = cvs.getContext('2d');
    gctx.scale(dpr, dpr);
    var hist = stats.history;
    var padL = 30, padR = 15, padT = 15, padB = 25;
    var chartW = w - padL - padR, chartH = h - padT - padB;
    gctx.strokeStyle = '#333'; gctx.lineWidth = 1;
    for (var r = 1; r <= 4; r++) {
      var y = padT + (r - 1) / 3 * chartH;
      gctx.beginPath(); gctx.moveTo(padL, y); gctx.lineTo(w - padR, y); gctx.stroke();
      gctx.fillStyle = '#666'; gctx.font = '11px sans-serif'; gctx.textAlign = 'right';
      gctx.fillText('#' + r, padL - 4, y + 4);
    }
    var points = hist.map(function(entry, i) {
      var x = hist.length === 1 ? padL + chartW / 2 : padL + (i / (hist.length - 1)) * chartW;
      var y = padT + (entry.rank - 1) / 3 * chartH;
      return { x: x, y: y, rank: entry.rank, score: entry.score };
    });
    gctx.strokeStyle = '#4da6d9'; gctx.lineWidth = 2;
    gctx.beginPath();
    points.forEach(function(p, i) { if (i === 0) gctx.moveTo(p.x, p.y); else gctx.lineTo(p.x, p.y); });
    gctx.stroke();
    points.forEach(function(p) {
      gctx.fillStyle = p.rank === 1 ? '#F0E442' : p.rank === 2 ? '#4da6d9' : p.rank === 3 ? '#b394d4' : '#D55E00';
      gctx.beginPath(); gctx.arc(p.x, p.y, 5, 0, Math.PI * 2); gctx.fill();
      gctx.fillStyle = '#fff'; gctx.font = '9px sans-serif'; gctx.textAlign = 'center';
      gctx.fillText(p.score + 'pt', p.x, p.y - 9);
    });
    gctx.fillStyle = '#555'; gctx.font = '9px sans-serif'; gctx.textAlign = 'center';
    points.forEach(function(p, i) { gctx.fillText(i + 1, p.x, h - padB + 14); });
  }

  // RIGHT: VS Character Records
  var charTitle = document.createElement('div');
  charTitle.style.cssText = 'font-size:14px;color:#aaa;text-align:center;margin-bottom:8px;';
  charTitle.textContent = 'VS Records';
  rightCol.appendChild(charTitle);
  rightCol.appendChild(buildCharGrid(stats));

  columns.appendChild(leftCol);
  columns.appendChild(rightCol);
  body.appendChild(columns);

  // Mobile: VS RECORDS toggle button
  var toggleBtn = document.createElement('button');
  toggleBtn.id = 'vs-toggle-btn';
  toggleBtn.textContent = 'VS RECORDS';
  toggleBtn.onclick = function() {
    var rc = document.getElementById('stats-right');
    rc.classList.toggle('show');
    toggleBtn.textContent = rc.classList.contains('show') ? 'HIDE VS RECORDS' : 'VS RECORDS';
  };
  body.appendChild(toggleBtn);

  document.getElementById('stats-overlay').classList.add('show');
}

function hideStats() {
  document.getElementById('stats-overlay').classList.remove('show');
}

function resetStats() {
  if (confirm('Reset all records?')) {
    localStorage.removeItem('kado_stats');
    showStats();
  }
}


function quitToTitle() {
  if (tutorialActive) {
    endTutorial();
    return;
  }
  if (tetrominoMode) {
    exitTetrominoMode();
  } else {
    cleanupWorker();
    if (!state.gameOver) {
      saveGame();
    }
  }
  withViewTransition(() => {
    document.getElementById('app').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
    document.querySelector('#start-screen > h1').style.display = '';
    document.querySelector('#start-screen > p').style.display = '';
    document.getElementById('main-menu').style.display = 'flex';
    document.getElementById('battle-menu').style.display = 'none';
    document.getElementById('puzzle-menu').style.display = 'none';
    document.getElementById('board-size-screen').style.display = 'none';
    document.getElementById('order-select').style.display = 'none';
    document.getElementById('char-select').style.display = 'none';
    document.getElementById('round-select').style.display = 'none';
    const save = loadGame();
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) continueBtn.style.display = save ? 'inline-block' : 'none';
  });
}

function backToTitle() {
  // Force close modal (bypass gameOver check)
  document.getElementById('modal-overlay').classList.remove('show');
  document.getElementById('modal-close-btn').style.display = '';
  deleteSave();
  resetContinuousState();
  withViewTransition(() => {
    document.getElementById('app').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
    document.querySelector('#start-screen > h1').style.display = '';
    document.querySelector('#start-screen > p').style.display = '';
    document.getElementById('main-menu').style.display = 'flex';
    document.getElementById('battle-menu').style.display = 'none';
    document.getElementById('puzzle-menu').style.display = 'none';
    document.getElementById('board-size-screen').style.display = 'none';
    document.getElementById('order-select').style.display = 'none';
    document.getElementById('char-select').style.display = 'none';
    document.getElementById('round-select').style.display = 'none';
  });
}

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (document.getElementById('app').style.display !== 'none' && !tetrominoMode) resizeBoard();
  }, 100);
});
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    if (document.getElementById('app').style.display !== 'none' && !tetrominoMode) resizeBoard();
  }, 100);
});

// ===== Tutorial System =====
let tutorialActive = false;
let tutorialStep = 0;
let tutorialEdgeNgCount = 0; // Track failed edge attempts

const TUTORIAL_STEPS = [
  // Step 0: Welcome + game objective (①)
  {
    type: 'overlay',
    title: 'WELCOME TO KADO',
    content: `
      <h3>OBJECTIVE</h3>
      <p>Place as many of your pieces on the board as possible.</p>
      <p class="ja">できるだけ多く、自分のピースを盤面に配置しましょう。</p>
      <p>The player with the <b>fewest remaining squares</b> wins.</p>
      <p class="ja">最後に残ったピースの合計数が<b>少ない人</b>が勝利となります。</p>
    `
  },
  // Step 1: Basic rules - corner start (②)
  {
    type: 'overlay',
    title: 'PLACEMENT RULES',
    content: `
      <h3>Start from a Corner</h3>
      <p>Place your first piece on the corner of the board (★ mark).</p>
      <p class="ja">最初は盤面の隅（★マーク）を埋めるようにピースを1つ置いてゲームを始めます。</p>
      <h3>Connect Corner-to-Corner</h3>
      <p>From the 2nd piece onward, place so your pieces touch <b>corner-to-corner</b>.</p>
      <p class="ja">2つめ以降は、自分のピースの<b>角と角がつながる</b>ように置きます。</p>
      <div class="tutorial-diagram">
        <span class="ok-label">OK: Corner connection</span><br>
        ■ □<br>
        □ ■
      </div>
      <h3>No Edge Contact</h3>
      <p>Your pieces must <b>never share an edge</b>.</p>
      <p class="ja">同じ色のピースは<b>辺をくっつけて置くことはできません</b>。</p>
      <div class="tutorial-diagram">
        <span class="ng-label">NG: Edge contact</span><br>
        ■<br>
        ■
      </div>
    `
  },
  // Step 2: Opponent pieces (③)
  {
    type: 'overlay',
    title: 'OPPONENT PIECES',
    content: `
      <p>Touching other players' edges is <b>OK</b>.</p>
      <p class="ja">色の違うピースは、他の色のピースの<b>辺に接してもかまいません</b>。</p>
      <p>The restriction only applies to <b>your own pieces</b>.</p>
      <p class="ja">制限があるのは<b>自分のピースだけ</b>です。</p>
    `
  },
  // Step 3: Controls explanation
  {
    type: 'overlay',
    title: 'CONTROLS',
    content: `
      <ul>
        <li>Select a piece from the <b>panel below</b></li>
        <li><b>↻</b> Rotate / <b>↔</b> Flip to change orientation</li>
        <li>Tap the board to place</li>
        <li><b>● Dots</b> show valid positions</li>
      </ul>
      <p class="ja">パネルからピースを選択 → ↻回転 / ↔反転 → ボードをタップして配置。●ドットが置ける場所です。</p>
    `
  },
  // Step 4: Place first piece on star (④-a)
  {
    type: 'action',
    hint: 'Place a piece on the ★ mark!<br>Select a piece from the panel and tap the board.<div class="hint-ja">★マークにピースを置いてみましょう！<br>下のパネルからピースを選んでタップ</div>'
  },
  // Step 5: First piece placed! Now explain next placement
  {
    type: 'overlay',
    title: 'PIECE PLACED!',
    content: `
      <p>Now let's try <b>connecting corner-to-corner</b>.</p>
      <p class="ja">次は<b>角と角をつなげていく</b>体験をしましょう。</p>
      <p>The <b>● dots</b> on the board show valid positions.</p>
      <p>Try placing on an edge first — you'll see it won't work!</p>
      <p class="ja">まずは辺に接する位置に置いてみてください（置けないことを確認できます）。</p>
    `
  },
  // Step 6: Try edge NG and then place corner OK (④-b, ④-c)
  {
    type: 'action',
    hint: 'Select a piece and try placing it.<br>Edge = blocked / Corner = OK!<div class="hint-ja">ピースを選んで置いてみましょう。<br>辺に接する位置→置けない / 角に接する位置→置ける</div>'
  },
  // Step 7: Scoring
  {
    type: 'overlay',
    title: 'SCORING',
    content: `
      <p><b>Win condition</b>: The player with the fewest remaining squares wins.</p>
      <p class="ja"><b>勝利条件</b>：残ったピースのマス目が一番少ない人が、ゲームの勝者です。</p>
      <ul>
        <li>Remaining squares × <b>-1 point</b></li>
        <li>All pieces placed = <b>+15 bonus!</b></li>
      </ul>
    `
  },
  // Step 8: Strategy hints (⑤)
  {
    type: 'overlay',
    title: 'STRATEGY TIPS',
    content: `
      <ul>
        <li><b>Expand toward the center</b> early. Getting stuck on the edge limits your options.</li>
        <li><b>Use large pieces first</b>. Only small pieces will fit in the late game.</li>
      </ul>
      <p class="ja">盤面の中央へ早めに進出し、大きいピースは早めに使いましょう。</p>
    `
  },
  // Step 9: Tutorial complete
  {
    type: 'overlay',
    title: 'TUTORIAL COMPLETE!',
    content: `
      <p>You're ready to play KADO!</p>
      <p class="ja">これでKADOの基本はバッチリです。実戦で腕を磨きましょう！</p>
    `,
    buttonText: 'BACK TO TITLE'
  }
];

function startTutorial() {
  tutorialActive = true;
  tutorialStep = 0;
  tutorialEdgeNgCount = 0;

  // Set up a tutorial game: 7x7 board, player 0, only 3 small pieces
  state.BOARD_SIZE = 7;
  state.gameMode = 'cpu';
  state.humanPlayer = 0;
  selectedBoardSize = 7;

  state.board = Array.from({ length: 7 }, () => Array(7).fill(-1));
  state.currentPlayer = 0;
  state.passCount = 0;
  state.gameOver = false;
  state.playerPassed = [false, true, true, true]; // CPUs all passed (inactive)
  state.lastPlacedCells = [[], [], [], []];

  // Give player just 3 simple pieces for the tutorial
  const tutorialPieces = [
    { shape: [[0,0],[1,0],[0,1]], used: false },         // L-shape (3 cells)
    { shape: [[0,0],[1,0],[2,0]], used: false },          // Straight (3 cells)
    { shape: [[0,0],[0,1],[1,0],[1,1]], used: false }     // Square (4 cells)
  ];
  state.playerPieces = [
    tutorialPieces,
    [], [], [] // CPUs have no pieces
  ];

  players = [
    { id: 0, name: 'YOU', color: '#0072B2', light: '#4da6d9' },
    { id: 1, name: '-', color: '#F0E442', light: '#f5ed7a' },
    { id: 2, name: '-', color: '#9467BD', light: '#b394d4' },
    { id: 3, name: '-', color: '#D55E00', light: '#e8885a' }
  ];

  // Show game screen
  withViewTransition(() => {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';

    // Initialize UI
    selectedPieceIdx = null;
    currentShape = null;
    ghostPos = null;
    cpuThinking = false;
    undoState = null;
    document.getElementById('undo-btn').disabled = true;

    updateTurnIndicator();
    resizeBoard();
    updatePieceList();

    // Show first tutorial step
    showTutorialStep();
  });
}

function showTutorialStep() {
  const step = TUTORIAL_STEPS[tutorialStep];
  if (!step) return;

  const overlay = document.getElementById('tutorial-overlay');
  const hint = document.getElementById('tutorial-hint');

  if (step.type === 'overlay') {
    // Show overlay with explanation
    hint.classList.remove('show');
    document.getElementById('tutorial-title').textContent = step.title;
    document.getElementById('tutorial-content').innerHTML = step.content;
    const btn = document.getElementById('tutorial-next-btn');
    btn.textContent = step.buttonText || 'NEXT';
    overlay.classList.add('show');
  } else if (step.type === 'action') {
    // Hide overlay, show hint
    overlay.classList.remove('show');
    hint.innerHTML = step.hint;
    hint.className = 'show';
  }
}

function advanceTutorial() {
  tutorialStep++;
  if (tutorialStep >= TUTORIAL_STEPS.length) {
    endTutorial();
    return;
  }
  showTutorialStep();
}

function endTutorial() {
  tutorialActive = false;
  tutorialStep = 0;
  document.getElementById('tutorial-overlay').classList.remove('show');
  document.getElementById('tutorial-hint').classList.remove('show');
  document.getElementById('tutorial-hint').className = '';

  // Return to title
  withViewTransition(() => {
    document.getElementById('app').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
    document.querySelector('#start-screen > h1').style.display = '';
    document.querySelector('#start-screen > p').style.display = '';
    document.getElementById('main-menu').style.display = 'flex';
    document.getElementById('battle-menu').style.display = 'none';
  });
}

// Called when placement fails during tutorial - show edge NG feedback
function onTutorialPlacementFailed() {
  if (!tutorialActive) return;
  const step = TUTORIAL_STEPS[tutorialStep];
  if (step && step.type === 'action' && tutorialStep === 6) {
    tutorialEdgeNgCount++;
    const hint = document.getElementById('tutorial-hint');
    hint.innerHTML = 'Edge contact is not allowed!<div class="hint-ja">辺で接する位置には置けません！角で接する位置に置きましょう</div>';
    hint.className = 'show error';
    setTimeout(() => {
      if (tutorialActive && tutorialStep === 6) {
        hint.className = 'show';
        hint.innerHTML = 'Place on a ● dot — connect corner-to-corner.<div class="hint-ja">●ドットの位置に、角で接するように置きましょう</div>';
      }
    }, 2500);
  }
}

// Called after successful piece placement during tutorial
function onTutorialPiecePlaced() {
  if (!tutorialActive) return;

  const step = TUTORIAL_STEPS[tutorialStep];
  if (step && step.type === 'action') {
    // After placement, advance to next step
    document.getElementById('tutorial-hint').classList.remove('show');
    document.getElementById('tutorial-hint').className = '';
    setTimeout(advanceTutorial, 600);
  }
}

// ===== Event Listeners =====
function setupEventListeners() {
  // Start screen
  document.getElementById('continue-btn').addEventListener('click', resumeGame);
  document.getElementById('btn-battle').addEventListener('click', showBattleMenu);
  document.getElementById('btn-battle-back').addEventListener('click', hideBattleMenu);
  document.getElementById('btn-vs-cpu').addEventListener('click', function() { showBoardSizeSelect('cpu'); });
  document.getElementById('btn-local-4p').addEventListener('click', function() { showBoardSizeSelect('local'); });
  document.getElementById('btn-continuous').addEventListener('click', function() { showBoardSizeSelect('continuous'); });
  document.getElementById('btn-puzzle-menu').addEventListener('click', showPuzzleMenu);
  document.getElementById('btn-puzzle-back').addEventListener('click', hidePuzzleMenu);
  document.getElementById('btn-puzzle').addEventListener('click', function() { showBoardSizeSelect('puzzle'); });
  document.getElementById('btn-tutorial').addEventListener('click', startTutorial);
  document.getElementById('btn-stats').addEventListener('click', showStats);

  // Board size select
  document.getElementById('btn-size-14').addEventListener('click', function() { confirmBoardSize(14); });
  document.getElementById('btn-size-20').addEventListener('click', function() { confirmBoardSize(20); });
  document.getElementById('btn-size-24').addEventListener('click', function() { confirmBoardSize(24); });
  document.getElementById('btn-size-back').addEventListener('click', hideBoardSizeSelect);

  // Round select
  document.getElementById('btn-round-3').addEventListener('click', function() { confirmRounds(3); });
  document.getElementById('btn-round-5').addEventListener('click', function() { confirmRounds(5); });
  document.getElementById('btn-round-10').addEventListener('click', function() { confirmRounds(10); });
  document.getElementById('btn-round-back').addEventListener('click', hideRoundSelect);

  // Order select
  document.getElementById('btn-order-0').addEventListener('click', function() { selectOrder(0); });
  document.getElementById('btn-order-1').addEventListener('click', function() { selectOrder(1); });
  document.getElementById('btn-order-2').addEventListener('click', function() { selectOrder(2); });
  document.getElementById('btn-order-3').addEventListener('click', function() { selectOrder(3); });
  document.getElementById('btn-order-back').addEventListener('click', hideOrderSelect);

  // Char select
  document.getElementById('btn-char-back').addEventListener('click', charSelectBack);
  document.getElementById('char-start-btn').addEventListener('click', confirmCharSelect);

  // Game controls
  document.getElementById('rotate-btn').addEventListener('click', rotatePiece);
  document.getElementById('flip-btn').addEventListener('click', flipPiece);
  document.getElementById('deselect-btn').addEventListener('click', deselectPiece);
  document.getElementById('undo-btn').addEventListener('click', undoMove);
  document.getElementById('pass-btn').addEventListener('click', passTurn);
  document.getElementById('quit-btn').addEventListener('click', quitToTitle);
  document.getElementById('score-btn').addEventListener('click', showScores);

  // Modal
  document.getElementById('modal-overlay').addEventListener('click', closeModal);
  document.getElementById('modal').addEventListener('click', function(e) { e.stopPropagation(); });
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('restart-btn').addEventListener('click', backToTitle);

  // Stats overlay
  document.getElementById('stats-overlay').addEventListener('click', hideStats);
  document.getElementById('stats-modal').addEventListener('click', function(e) { e.stopPropagation(); });
  document.getElementById('stats-close-btn').addEventListener('click', hideStats);
  document.getElementById('stats-reset-btn').addEventListener('click', resetStats);

  // Tutorial overlay
  document.getElementById('tutorial-next-btn').addEventListener('click', function() {
    if (tutorialActive && TUTORIAL_STEPS[tutorialStep] && TUTORIAL_STEPS[tutorialStep].buttonText === 'BACK TO TITLE') {
      endTutorial();
    } else {
      advanceTutorial();
    }
  });
  document.getElementById('tutorial-overlay').addEventListener('click', function() {}); // prevent click-through
  document.getElementById('tutorial-box').addEventListener('click', function(e) { e.stopPropagation(); });

  // Puzzle intro overlay
  document.getElementById('puzzle-intro-start-btn').addEventListener('click', function() {
    document.getElementById('puzzle-intro-overlay').classList.remove('show');
    resizeBoard();
    drawBoard();
  });
  document.getElementById('puzzle-intro-overlay').addEventListener('click', function() {}); // prevent click-through
  document.getElementById('puzzle-intro-box').addEventListener('click', function(e) { e.stopPropagation(); });
}
