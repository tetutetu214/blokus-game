// worker.js - CPU AI Web Worker
// Runs cpuMove in a separate thread to avoid blocking the UI

importScripts('./game-logic.js');

self.onmessage = function(e) {
  // Receive current game state and parameters from main thread
  setGameState(e.data.state);

  // Run the heavy AI calculation
  var move = cpuMove(e.data.player, e.data.params);

  // Return result to main thread
  self.postMessage(move);
};
