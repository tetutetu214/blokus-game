// ===== TETROMINO RECT — SPA Integration =====
// Self-contained tetromino puzzle mode running inside the main SPA.
// Uses the same canvas (#board), piece panel, and overlays as main.js.

var tetrominoMode = false;

(function() {
  'use strict';

  // ===== Constants =====
  var ROWS = 8;
  var COLS = 10;
  var TOTAL_CELLS = 80;

  var COLORS = [
    { id: 0, name: 'BLUE',   color: '#0072B2', light: '#4da6d9' },
    { id: 1, name: 'YELLOW', color: '#F0E442', light: '#f5ed7a' },
    { id: 2, name: 'PURPLE', color: '#9467BD', light: '#b394d4' },
    { id: 3, name: 'ORANGE', color: '#D55E00', light: '#e8885a' }
  ];

  // 5 free tetrominoes
  var TETROMINO_SHAPES = [
    [[0,0],[1,0],[2,0],[3,0]],       // I
    [[0,0],[1,0],[2,0],[2,1]],       // L
    [[0,0],[1,0],[2,0],[1,1]],       // T
    [[0,0],[1,0],[0,1],[1,1]],       // O
    [[0,0],[1,0],[1,1],[2,1]]        // S
  ];

  // ===== Piece Manipulation =====
  function rotateCW(shape) {
    return shape.map(function(s) { return [s[1], -s[0]]; });
  }

  function flipH(shape) {
    return shape.map(function(s) { return [s[0], -s[1]]; });
  }

  function normalize(shape) {
    var minR = Math.min.apply(null, shape.map(function(s) { return s[0]; }));
    var minC = Math.min.apply(null, shape.map(function(s) { return s[1]; }));
    return shape.map(function(s) { return [s[0] - minR, s[1] - minC]; })
      .sort(function(a, b) { return a[0] - b[0] || a[1] - b[1]; });
  }

  function getAllOrientations(shape) {
    var orientations = [];
    var seen = {};
    var s = shape.map(function(c) { return [c[0], c[1]]; });
    for (var flip = 0; flip < 2; flip++) {
      for (var rot = 0; rot < 4; rot++) {
        var norm = normalize(s);
        var key = JSON.stringify(norm);
        if (!seen[key]) {
          seen[key] = true;
          orientations.push(norm);
        }
        s = rotateCW(s);
      }
      s = flipH(shape.map(function(c) { return [c[0], c[1]]; }));
    }
    return orientations;
  }

  // ===== Game State =====
  var board = [];
  var pieces = []; // pieces[colorIdx][pieceIdx] = { shape, used }
  var activeColor = 0;
  var tSelectedPieceIdx = null;
  var tCurrentShape = null;
  var tHoverPos = null;
  var tGhostPos = null;
  var undoStack = [];
  var startTime = null;
  var placedCount = 0;
  var tCellSize = 0;

  // ===== Init =====
  function initTetromino() {
    board = [];
    for (var r = 0; r < ROWS; r++) {
      board.push([]);
      for (var c = 0; c < COLS; c++) {
        board[r].push(-1);
      }
    }

    pieces = [];
    for (var p = 0; p < 4; p++) {
      pieces.push(TETROMINO_SHAPES.map(function(shape) {
        return { shape: shape.map(function(s) { return [s[0], s[1]]; }), used: false };
      }));
    }

    activeColor = 0;
    tSelectedPieceIdx = null;
    tCurrentShape = null;
    tHoverPos = null;
    tGhostPos = null;
    undoStack = [];
    placedCount = 0;
    startTime = Date.now();

    document.getElementById('undo-btn').disabled = true;
    document.getElementById('deselect-btn').style.display = 'none';

    updateProgress();
    buildColorSelector();
    updateTetrominoPieceList();
    resizeTetrominoBoard();
  }

  // ===== Board Validation =====
  function isFirstPiece(colorIdx) {
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        if (board[r][c] === colorIdx) return false;
      }
    }
    return true;
  }

  function canPlaceTetromino(colorIdx, shape, br, bc) {
    var cells = shape.map(function(s) { return [br + s[0], bc + s[1]]; });

    for (var i = 0; i < cells.length; i++) {
      var r = cells[i][0], c = cells[i][1];
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
      if (board[r][c] >= 0) return false;
    }

    for (var i = 0; i < cells.length; i++) {
      var r = cells[i][0], c = cells[i][1];
      var adj = [[r-1,c],[r+1,c],[r,c-1],[r,c+1]];
      for (var j = 0; j < adj.length; j++) {
        var ar = adj[j][0], ac = adj[j][1];
        if (ar >= 0 && ar < ROWS && ac >= 0 && ac < COLS) {
          if (board[ar][ac] === colorIdx) return false;
        }
      }
    }

    if (isFirstPiece(colorIdx)) return true;

    for (var i = 0; i < cells.length; i++) {
      var r = cells[i][0], c = cells[i][1];
      var diag = [[r-1,c-1],[r-1,c+1],[r+1,c-1],[r+1,c+1]];
      for (var j = 0; j < diag.length; j++) {
        var dr = diag[j][0], dc = diag[j][1];
        if (dr >= 0 && dr < ROWS && dc >= 0 && dc < COLS) {
          if (board[dr][dc] === colorIdx) return true;
        }
      }
    }
    return false;
  }

  function placePieceTetromino(colorIdx, shape, br, bc) {
    shape.forEach(function(s) {
      board[br + s[0]][bc + s[1]] = colorIdx;
    });
    placedCount += shape.length;
  }

  function getCornerPositions(colorIdx) {
    var corners = [];
    var seen = {};
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        if (board[r][c] !== colorIdx) continue;
        var diag = [[r-1,c-1],[r-1,c+1],[r+1,c-1],[r+1,c+1]];
        for (var d = 0; d < diag.length; d++) {
          var dr = diag[d][0], dc = diag[d][1];
          if (dr < 0 || dr >= ROWS || dc < 0 || dc >= COLS) continue;
          if (board[dr][dc] >= 0) continue;
          var key = dr + ',' + dc;
          if (seen[key]) continue;
          var adj = [[dr-1,dc],[dr+1,dc],[dr,dc-1],[dr,dc+1]];
          var blocked = false;
          for (var a = 0; a < adj.length; a++) {
            var ar = adj[a][0], ac = adj[a][1];
            if (ar >= 0 && ar < ROWS && ac >= 0 && ac < COLS && board[ar][ac] === colorIdx) {
              blocked = true; break;
            }
          }
          if (!blocked) { seen[key] = true; corners.push([dr, dc]); }
        }
      }
    }
    return corners;
  }

  // ===== Canvas =====
  function resizeTetrominoBoard() {
    var cvs = document.getElementById('board');
    var ctx = cvs.getContext('2d');
    var container = document.getElementById('board-container');
    var availW = container.clientWidth - 16;
    var availH = container.clientHeight - 16;
    var csW = Math.floor(availW / COLS);
    var csH = Math.floor(availH / ROWS);
    tCellSize = Math.min(csW, csH);
    var logicalW = tCellSize * COLS;
    var logicalH = tCellSize * ROWS;
    var dpr = window.devicePixelRatio || 1;
    cvs.width = logicalW * dpr;
    cvs.height = logicalH * dpr;
    cvs.style.width = logicalW + 'px';
    cvs.style.height = logicalH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawTetrominoBoard();
  }

  function drawTetrominoBoard() {
    var cvs = document.getElementById('board');
    var ctx = cvs.getContext('2d');
    var logicalW = tCellSize * COLS;
    var logicalH = tCellSize * ROWS;
    ctx.clearRect(0, 0, logicalW, logicalH);

    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var x = c * tCellSize;
        var y = r * tCellSize;
        if (board[r][c] >= 0) {
          var col = COLORS[board[r][c]];
          ctx.fillStyle = col.color;
          ctx.fillRect(x, y, tCellSize, tCellSize);
          ctx.strokeStyle = col.light;
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 1, y + 1, tCellSize - 2, tCellSize - 2);
        } else {
          ctx.fillStyle = (r + c) % 2 === 0 ? '#2a2a4a' : '#252545';
          ctx.fillRect(x, y, tCellSize, tCellSize);
        }
      }
    }

    // Grid lines
    ctx.strokeStyle = '#333355';
    ctx.lineWidth = 0.5;
    for (var i = 0; i <= COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * tCellSize, 0);
      ctx.lineTo(i * tCellSize, ROWS * tCellSize);
      ctx.stroke();
    }
    for (var i = 0; i <= ROWS; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * tCellSize);
      ctx.lineTo(COLS * tCellSize, i * tCellSize);
      ctx.stroke();
    }

    // Highlight placeable corners for active color
    if (!isFirstPiece(activeColor)) {
      var corners = getCornerPositions(activeColor);
      for (var i = 0; i < corners.length; i++) {
        var cr = corners[i][0], cc = corners[i][1];
        var dotX = cc * tCellSize + tCellSize / 2;
        var dotY = cr * tCellSize + tCellSize / 2;
        ctx.fillStyle = COLORS[activeColor].light;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(dotX, dotY, tCellSize * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Ghost preview
    var previewPos = tGhostPos || tHoverPos;
    if (previewPos && tCurrentShape) {
      var valid = canPlaceTetromino(activeColor, tCurrentShape, previewPos.r, previewPos.c);
      tCurrentShape.forEach(function(s) {
        var rr = previewPos.r + s[0];
        var cc = previewPos.c + s[1];
        if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) {
          ctx.fillStyle = valid ? COLORS[activeColor].light : '#ff0000';
          ctx.globalAlpha = 0.4;
          ctx.fillRect(cc * tCellSize, rr * tCellSize, tCellSize, tCellSize);
          ctx.globalAlpha = 1;
        }
      });
    }
  }

  // ===== UI =====
  function updateProgress() {
    document.getElementById('tetromino-progress').textContent = placedCount + ' / ' + TOTAL_CELLS;
  }

  function buildColorSelector() {
    var sel = document.getElementById('color-selector');
    sel.innerHTML = '';
    for (var i = 0; i < 4; i++) {
      var btn = document.createElement('button');
      btn.className = 'color-btn' + (i === activeColor ? ' active' : '');
      btn.style.background = COLORS[i].color;
      var remaining = pieces[i].filter(function(p) { return !p.used; }).length;
      if (remaining === 0) btn.className += ' done';
      btn.innerHTML = COLORS[i].name.charAt(0) + '<span class="remaining">' + remaining + '</span>';
      btn.setAttribute('data-color', i);
      btn.addEventListener('click', function() {
        var c = parseInt(this.getAttribute('data-color'));
        switchColor(c);
      });
      sel.appendChild(btn);
    }
  }

  function switchColor(colorIdx) {
    activeColor = colorIdx;
    tSelectedPieceIdx = null;
    tCurrentShape = null;
    tGhostPos = null;
    tHoverPos = null;
    document.getElementById('deselect-btn').style.display = 'none';
    buildColorSelector();
    updateTetrominoPieceList();
    drawTetrominoBoard();
  }

  function updateTetrominoPieceList() {
    var list = document.getElementById('piece-list');
    list.innerHTML = '';
    var colorPieces = pieces[activeColor];
    for (var idx = 0; idx < colorPieces.length; idx++) {
      (function(idx) {
        var p = colorPieces[idx];
        var div = document.createElement('div');
        div.className = 'piece-item' + (idx === tSelectedPieceIdx ? ' selected' : '') + (p.used ? ' used' : '');

        var shape = (idx === tSelectedPieceIdx && tCurrentShape) ? tCurrentShape : p.shape;
        var maxR = Math.max.apply(null, shape.map(function(s) { return s[0]; })) + 1;
        var maxC = Math.max.apply(null, shape.map(function(s) { return s[1]; })) + 1;
        var cs = Math.min(20, Math.floor(60 / Math.max(maxR, maxC)));
        var cvs = document.createElement('canvas');
        var dpr = window.devicePixelRatio || 1;
        var lw = maxC * cs + 2;
        var lh = maxR * cs + 2;
        cvs.width = lw * dpr;
        cvs.height = lh * dpr;
        cvs.style.width = lw + 'px';
        cvs.style.height = lh + 'px';
        var cx = cvs.getContext('2d');
        cx.scale(dpr, dpr);
        shape.forEach(function(s) {
          cx.fillStyle = COLORS[activeColor].color;
          cx.fillRect(s[1] * cs + 1, s[0] * cs + 1, cs - 1, cs - 1);
        });
        div.appendChild(cvs);

        if (!p.used) {
          div.addEventListener('click', function() { selectTetrominoPiece(idx); });
        }
        list.appendChild(div);
      })(idx);
    }
  }

  function selectTetrominoPiece(idx) {
    if (tSelectedPieceIdx === idx) {
      tSelectedPieceIdx = null;
      tCurrentShape = null;
    } else {
      tSelectedPieceIdx = idx;
      tCurrentShape = pieces[activeColor][idx].shape.map(function(s) { return [s[0], s[1]]; });
    }
    tGhostPos = null;
    tHoverPos = null;
    document.getElementById('deselect-btn').style.display = tSelectedPieceIdx !== null ? 'inline-block' : 'none';
    drawTetrominoBoard();
    updateTetrominoPieceList();
  }

  // ===== Undo =====
  function pushUndo(colorIdx, pieceIdx, shape, br, bc) {
    undoStack.push({
      colorIdx: colorIdx,
      pieceIdx: pieceIdx,
      shape: shape.map(function(s) { return [s[0], s[1]]; }),
      br: br,
      bc: bc
    });
    document.getElementById('undo-btn').disabled = false;
  }

  function tetrominoUndoMove() {
    if (undoStack.length === 0) return;
    var move = undoStack.pop();

    move.shape.forEach(function(s) {
      board[move.br + s[0]][move.bc + s[1]] = -1;
    });
    pieces[move.colorIdx][move.pieceIdx].used = false;
    placedCount -= move.shape.length;

    if (undoStack.length === 0) {
      document.getElementById('undo-btn').disabled = true;
    }

    activeColor = move.colorIdx;
    tSelectedPieceIdx = null;
    tCurrentShape = null;
    tGhostPos = null;
    tHoverPos = null;
    document.getElementById('deselect-btn').style.display = 'none';

    updateProgress();
    buildColorSelector();
    updateTetrominoPieceList();
    drawTetrominoBoard();
  }

  // ===== Board Interaction =====
  function getTetrominoBoardCell(x, y) {
    var rect = document.getElementById('board').getBoundingClientRect();
    var c = Math.floor((x - rect.left) / tCellSize);
    var r = Math.floor((y - rect.top) / tCellSize);
    return { r: r, c: c };
  }

  function handleTetrominoTap(pos) {
    if (!tCurrentShape || tSelectedPieceIdx === null) return;

    var midR = Math.floor(Math.max.apply(null, tCurrentShape.map(function(s) { return s[0]; })) / 2);
    var midC = Math.floor(Math.max.apply(null, tCurrentShape.map(function(s) { return s[1]; })) / 2);
    var br = pos.r - midR;
    var bc = pos.c - midC;

    if (canPlaceTetromino(activeColor, tCurrentShape, br, bc)) {
      pushUndo(activeColor, tSelectedPieceIdx, tCurrentShape, br, bc);
      placePieceTetromino(activeColor, tCurrentShape, br, bc);
      pieces[activeColor][tSelectedPieceIdx].used = true;

      var placedColor = activeColor;
      tSelectedPieceIdx = null;
      tCurrentShape = null;
      tGhostPos = null;
      tHoverPos = null;
      document.getElementById('deselect-btn').style.display = 'none';

      updateProgress();
      buildColorSelector();
      updateTetrominoPieceList();
      drawTetrominoBoard();

      if (placedCount >= TOTAL_CELLS) {
        showClear();
        return;
      }

      var remaining = pieces[placedColor].filter(function(p) { return !p.used; }).length;
      if (remaining === 0) {
        autoSwitchColor(placedColor);
      }
    }
  }

  function autoSwitchColor(fromColor) {
    for (var i = 1; i <= 4; i++) {
      var next = (fromColor + i) % 4;
      var rem = pieces[next].filter(function(p) { return !p.used; }).length;
      if (rem > 0) {
        switchColor(next);
        return;
      }
    }
  }

  // ===== Clear =====
  function showClear() {
    var elapsed = Math.floor((Date.now() - startTime) / 1000);
    var min = Math.floor(elapsed / 60);
    var sec = elapsed % 60;
    var timeStr = min + ':' + (sec < 10 ? '0' : '') + sec;
    document.getElementById('clear-time').textContent = 'TIME: ' + timeStr;

    try {
      var best = localStorage.getItem('kado_puzzle_best');
      if (!best || elapsed < parseInt(best)) {
        localStorage.setItem('kado_puzzle_best', elapsed);
        document.getElementById('clear-time').textContent += ' (NEW BEST!)';
      } else {
        var bMin = Math.floor(parseInt(best) / 60);
        var bSec = parseInt(best) % 60;
        document.getElementById('clear-time').textContent += ' (BEST: ' + bMin + ':' + (bSec < 10 ? '0' : '') + bSec + ')';
      }
    } catch(e) {
      console.warn('Best time save failed:', e);
    }

    document.getElementById('clear-overlay').classList.add('show');
  }

  // ===== Canvas Event Handlers =====
  // These handlers check tetrominoMode and delegate to tetromino-specific logic.
  var cvs = document.getElementById('board');

  cvs.addEventListener('mousemove', function(e) {
    if (!tetrominoMode || !tCurrentShape) return;
    var pos = getTetrominoBoardCell(e.clientX, e.clientY);
    var midR = Math.floor(Math.max.apply(null, tCurrentShape.map(function(s) { return s[0]; })) / 2);
    var midC = Math.floor(Math.max.apply(null, tCurrentShape.map(function(s) { return s[1]; })) / 2);
    tHoverPos = { r: pos.r - midR, c: pos.c - midC };
    drawTetrominoBoard();
  });

  cvs.addEventListener('mouseleave', function() {
    if (!tetrominoMode) return;
    if (tHoverPos) { tHoverPos = null; drawTetrominoBoard(); }
  });

  cvs.addEventListener('click', function(e) {
    if (!tetrominoMode) return;
    var pos = getTetrominoBoardCell(e.clientX, e.clientY);
    handleTetrominoTap(pos);
  });

  cvs.addEventListener('touchstart', function(e) {
    if (!tetrominoMode) return;
    e.preventDefault();
    var touch = e.touches[0];
    var pos = getTetrominoBoardCell(touch.clientX, touch.clientY);
    handleTetrominoTap(pos);
  }, { passive: false });

  cvs.addEventListener('touchmove', function(e) {
    if (!tetrominoMode) return;
    e.preventDefault();
    if (!tCurrentShape) return;
    var touch = e.touches[0];
    var pos = getTetrominoBoardCell(touch.clientX, touch.clientY);
    var midR = Math.floor(Math.max.apply(null, tCurrentShape.map(function(s) { return s[0]; })) / 2);
    var midC = Math.floor(Math.max.apply(null, tCurrentShape.map(function(s) { return s[1]; })) / 2);
    tGhostPos = { r: pos.r - midR, c: pos.c - midC };
    drawTetrominoBoard();
  }, { passive: false });

  cvs.addEventListener('touchend', function(e) {
    if (!tetrominoMode) return;
    e.preventDefault();
    if (tGhostPos && tCurrentShape && tSelectedPieceIdx !== null) {
      if (canPlaceTetromino(activeColor, tCurrentShape, tGhostPos.r, tGhostPos.c)) {
        pushUndo(activeColor, tSelectedPieceIdx, tCurrentShape, tGhostPos.r, tGhostPos.c);
        placePieceTetromino(activeColor, tCurrentShape, tGhostPos.r, tGhostPos.c);
        pieces[activeColor][tSelectedPieceIdx].used = true;

        var placedColor = activeColor;
        tSelectedPieceIdx = null;
        tCurrentShape = null;
        tGhostPos = null;
        document.getElementById('deselect-btn').style.display = 'none';

        updateProgress();
        buildColorSelector();
        updateTetrominoPieceList();
        drawTetrominoBoard();

        if (placedCount >= TOTAL_CELLS) {
          showClear();
          return;
        }

        var remaining = pieces[placedColor].filter(function(p) { return !p.used; }).length;
        if (remaining === 0) {
          autoSwitchColor(placedColor);
        }
      } else {
        tGhostPos = null;
        drawTetrominoBoard();
      }
    }
  }, { passive: false });

  // ===== Resize =====
  var resizeTimeout;
  window.addEventListener('resize', function() {
    if (!tetrominoMode) return;
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeTetrominoBoard, 100);
  });
  window.addEventListener('orientationchange', function() {
    if (!tetrominoMode) return;
    setTimeout(resizeTetrominoBoard, 100);
  });

  // ===== Public API =====
  // Start tetromino mode from the menu
  window.startTetrominoMode = function() {
    tetrominoMode = true;

    withViewTransition(function() {
      // Hide start screen, show app
      document.getElementById('start-screen').style.display = 'none';
      document.getElementById('app').style.display = 'flex';

      // Show tetromino-specific UI
      document.getElementById('color-selector').classList.add('show');
      document.getElementById('tetromino-progress').style.display = '';

      // Hide non-tetromino UI
      document.getElementById('turn-indicator').style.display = 'none';
      document.getElementById('score-btn').style.display = 'none';
      document.getElementById('stats-bar').style.display = 'none';
      document.getElementById('pass-btn').style.display = 'none';
      document.getElementById('viewing-label').style.display = 'none';
      document.getElementById('round-indicator').style.display = 'none';
      var sizeLabel = document.getElementById('board-size-label');
      sizeLabel.textContent = '8×10';
      sizeLabel.style.display = '';

      // Show tetromino intro overlay
      document.getElementById('tetromino-intro-overlay').style.display = 'flex';
    });
  };

  // Exit tetromino mode (called from quitToTitle)
  window.exitTetrominoMode = function() {
    tetrominoMode = false;

    // Hide tetromino-specific UI
    document.getElementById('color-selector').classList.remove('show');
    document.getElementById('tetromino-progress').style.display = 'none';
    document.getElementById('clear-overlay').classList.remove('show');
    document.getElementById('tetromino-intro-overlay').style.display = 'none';

    // Restore main UI
    document.getElementById('turn-indicator').style.display = '';
    document.getElementById('score-btn').style.display = '';
    document.getElementById('stats-bar').style.display = '';
    document.getElementById('pass-btn').style.display = '';
  };

  // Override piece controls when in tetromino mode
  var origRotate = window.rotatePiece;
  window.rotatePiece = function() {
    if (tetrominoMode) {
      if (tCurrentShape) {
        tCurrentShape = normalize(rotateCW(tCurrentShape));
        drawTetrominoBoard();
        updateTetrominoPieceList();
      }
    } else {
      origRotate();
    }
  };

  var origFlip = window.flipPiece;
  window.flipPiece = function() {
    if (tetrominoMode) {
      if (tCurrentShape) {
        tCurrentShape = normalize(flipH(tCurrentShape));
        drawTetrominoBoard();
        updateTetrominoPieceList();
      }
    } else {
      origFlip();
    }
  };

  var origDeselect = window.deselectPiece;
  window.deselectPiece = function() {
    if (tetrominoMode) {
      tSelectedPieceIdx = null;
      tCurrentShape = null;
      tGhostPos = null;
      tHoverPos = null;
      document.getElementById('deselect-btn').style.display = 'none';
      drawTetrominoBoard();
      updateTetrominoPieceList();
    } else {
      origDeselect();
    }
  };

  var origUndo = window.undoMove;
  window.undoMove = function() {
    if (tetrominoMode) {
      tetrominoUndoMove();
    } else {
      origUndo();
    }
  };

  // ===== Event Listeners =====
  document.getElementById('tetromino-intro-start-btn').addEventListener('click', function() {
    document.getElementById('tetromino-intro-overlay').style.display = 'none';
    initTetromino();
  });
  document.getElementById('tetromino-intro-overlay').addEventListener('click', function() {}); // prevent click-through

  document.getElementById('clear-title-btn').addEventListener('click', function() {
    document.getElementById('clear-overlay').classList.remove('show');
    quitToTitle();
  });

  // Menu button: start tetromino mode
  document.getElementById('btn-tetromino').addEventListener('click', function() {
    document.getElementById('puzzle-menu').style.display = 'none';
    window.startTetrominoMode();
  });

})();
