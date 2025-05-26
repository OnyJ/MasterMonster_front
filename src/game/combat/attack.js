// Logique d'attaque et de combat
import { getDistance } from '../core/movement';

export function tryAttack(monster, player, onGameOver) {
  if (!monster.isAlive || !player.isAlive) return;
  if (getDistance(monster, player) < 20) {
    if (monster.attackCooldown <= 0) {
      player.hp -= monster.damage;
      monster.attackCooldown = 60;
      if (player.hp <= 0) {
        player.isAlive = false;
        player.hp = 0;
        if (onGameOver) onGameOver();
      }
    } else {
      monster.attackCooldown--;
    }
  }
}

export function performCircularAttack(player, monsters) {
  if (!player.isAlive) return;
  if (player.attackTimer === undefined) {
    player.attackTimer = setInterval(() => {
      if (!player.isAlive) return;
      monsters.forEach(monster => {
        if (!monster.isAlive) return;
        const flameX = player.x + Math.cos(player.attackAngle) * player.attackRadius;
        const flameY = player.y + Math.sin(player.attackAngle) * player.attackRadius;
        const flameHit = getDistance({ x: flameX, y: flameY }, monster) < 60;
        const bodyHit = getDistance(player, monster) < 15;
        if (flameHit || bodyHit) {
          monster.hp -= player.damage;
          if (monster.hp <= 0) {
            monster.hp = 0;
            monster.isAlive = false;
          }
        }
      });
    }, 300);
  }
}
