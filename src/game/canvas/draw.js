// Fonctions de dessin génériques pour le canvas
export function drawEntity(ctx, entity, color) {
  ctx.fillStyle = entity.isAlive ? color : 'gray';
  ctx.beginPath();
  ctx.arc(entity.x, entity.y, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'red';
  ctx.fillRect(entity.x - 15, entity.y - 20, 30, 5);
  ctx.fillStyle = 'lime';
  const hpRatio = entity.hp / entity.maxHp;
  ctx.fillRect(entity.x - 15, entity.y - 20, 30 * hpRatio, 5);
}

export function drawRotatingFlame(ctx, player) {
  const flameX = player.x + Math.cos(player.attackAngle) * player.attackRadius;
  const flameY = player.y + Math.sin(player.attackAngle) * player.attackRadius;
  ctx.fillStyle = 'orange';
  ctx.beginPath();
  ctx.arc(flameX, flameY, 3, 0, Math.PI * 2);
  ctx.fill();
}
