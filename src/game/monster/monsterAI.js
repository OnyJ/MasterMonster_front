// Logique de déplacement et d'IA des monstres
import { isInRange, moveEntityTowards } from '../core/movement';

export function updateMonster(monster, player, canvas) {
  if (!monster.isAlive) return;
  if (isInRange(monster, player)) {
    moveEntityTowards(monster, player.x, player.y, canvas);
  } else {
    if (monster.idleTimer <= 0) {
      monster.targetX = monster.originalX + (Math.random() - 0.5) * 100;
      monster.targetY = monster.originalY + (Math.random() - 0.5) * 100;
      monster.idleTimer = 100;
    } else {
      moveEntityTowards(monster, monster.targetX, monster.targetY, canvas);
      monster.idleTimer--;
    }
  }
}
