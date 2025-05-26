// Fonctions utilitaires mathématiques et de collision
export function clampToCanvas(entity, canvas) {
  const radius = 10;
  entity.x = Math.max(radius, Math.min(canvas.width - radius, entity.x));
  entity.y = Math.max(radius, Math.min(canvas.height - radius, entity.y));
}

export function getDistance(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function isInRange(source, target, range = 100) {
  return getDistance(source, target) < range;
}

export function moveEntityTowards(entity, targetX, targetY, canvas) {
  const angle = Math.atan2(targetY - entity.y, targetX - entity.x);
  entity.x += Math.cos(angle) * entity.speed;
  entity.y += Math.sin(angle) * entity.speed;
  clampToCanvas(entity, canvas);
}
