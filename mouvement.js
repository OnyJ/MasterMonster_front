/**
 * Déplace une entité (player ou monstre) vers une position cible.
 * Respecte la vitesse de déplacement donnée.
 *
 * @param {Object} entity - L'entité à déplacer (doit avoir x, y et speed)
 * @param {Object} target - Les coordonnées cibles { x, y }
 * @returns {void} Met à jour entity.x et entity.y
 */
function moveEntityToward(entity, target) {
  // Calculer la distance sur chaque axe
  const dx = target.x - entity.x;
  const dy = target.y - entity.y;

  // Calculer la distance totale
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Si déjà arrivé ou très proche, on ne fait rien
  if (distance < 1) return;

  // Calcul de l'angle de déplacement
  const angle = Math.atan2(dy, dx);

  // Déplacement selon la vitesse de l'entité
  entity.x += Math.cos(angle) * entity.speed;
  entity.y += Math.sin(angle) * entity.speed;
}

// Exemple d'utilisation :

const player = {
  x: 100,
  y: 100,
  speed: 2
};

const destination = { x: 200, y: 150 };

moveEntityToward(player, destination);
