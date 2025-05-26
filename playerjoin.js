function handlePlayerJoin(player) {
  if (gameState === GameState.WAITING || (gameState === GameState.IN_PROGRESS && wave === 1)) {
    player.isSpectator = false;
    player.isAlive = true;
    spawnPlayerOnMap(player);
  } else {
    player.isSpectator = true;
  }
}

function handlePlayerDeath(player) {
  player.isAlive = false;
  player.xp = 0;

  // Vérifier si tous les joueurs sont morts
  if (allPlayersDead()) {
    gameState = GameState.FINISHED;
    showReplayButtonToAll();
  }
}
