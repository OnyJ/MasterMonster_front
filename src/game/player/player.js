// Fonctions liées à la création et gestion du joueur
export function createPlayer(x, y, hp, damage, speed) {
  return {
    x,
    y,
    hp,
    maxHp: hp,
    damage,
    speed,
    isAlive: true,
    attackAngle: 0,
    attackRadius: 30,
    idleTimer: 0,
    originalX: x,
    originalY: y,
    targetX: x,
    targetY: y,
    attackCooldown: 0
  };
}

// Ajoute ici d'autres fonctions spécifiques au joueur si besoin
