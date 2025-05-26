"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useRef, useEffect } from "react";
import { createPlayer } from '@/game/player/player';
import { createMonster } from '@/game/monster/monster';
import { clampToCanvas, getDistance, isInRange, moveEntityTowards } from '@/game/core/movement';
import { updateMonster } from '@/game/monster/monsterAI';
import { tryAttack, performCircularAttack } from '@/game/combat/attack';
import { drawEntity, drawRotatingFlame } from '@/game/canvas/draw';

export default function Home() {
  const canvasRef = useRef(null);
  const gameOverScreenRef = useRef(null);
  const playerRef = useRef();
  const monstersRef = useRef([]);
  const gameIntervalRef = useRef();
  const mouseRef = useRef({ x: 300, y: 200 });

  // --- Fonctions utilitaires pures ---
  // (Gardées à l'extérieur du useEffect)
  // Les fonctions sont maintenant importées, donc on retire les anciennes définitions locales :
  // - createEntity
  // - clampToCanvas
  // - getDistance
  // - isInRange
  // - moveEntityTowards

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const gameOverScreen = gameOverScreenRef.current;

    // --- Fonctions de logique de jeu ---
    function updateMonster(monster, player) {
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
    function tryAttack(monster, player) {
      if (!monster.isAlive || !player.isAlive) return;
      if (isInRange(monster, player, 20)) {
        if (monster.attackCooldown <= 0) {
          player.hp -= monster.damage;
          monster.attackCooldown = 60;
          if (player.hp <= 0) {
            player.isAlive = false;
            player.hp = 0;
            gameOver();
          }
        } else {
          monster.attackCooldown--;
        }
      }
    }
    function performCircularAttack(player, monsters) {
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
    function update() {
      if (!playerRef.current.isAlive) return;
      moveEntityTowards(playerRef.current, mouseRef.current.x, mouseRef.current.y, canvas);
      monstersRef.current.forEach(monster => {
        updateMonster(monster, playerRef.current, canvas);
        tryAttack(monster, playerRef.current, gameOver);
      });
      performCircularAttack(playerRef.current, monstersRef.current);
      playerRef.current.attackAngle += 0.1;
    }
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (playerRef.current.isAlive) drawEntity(ctx, playerRef.current, 'blue');
      drawRotatingFlame(ctx, playerRef.current);
      monstersRef.current.forEach(monster => drawEntity(ctx, monster, 'green'));
    }
    function gameLoop() {
      update();
      draw();
      if (playerRef.current.isAlive) requestAnimationFrame(gameLoop);
    }
    function spawnMonster() {
      const padding = 20;
      const x = Math.random() * (canvas.width - 2 * padding) + padding;
      const y = Math.random() * (canvas.height - 2 * padding) + padding;
      monstersRef.current.push(createMonster(x, y, 30, 5, 1));
    }
    function gameOver() {
      gameOverScreen.style.display = 'flex';
      clearInterval(gameIntervalRef.current);
      if (playerRef.current.attackTimer) clearInterval(playerRef.current.attackTimer);
    }
    function restartGame() {
      gameOverScreen.style.display = 'none';
      playerRef.current = createPlayer(300, 200, 100, 10, 4);
      monstersRef.current = [];
      spawnMonster();
      spawnMonster();
      mouseRef.current.x = playerRef.current.x;
      mouseRef.current.y = playerRef.current.y;
      playerRef.current.attackTimer = undefined;
      gameIntervalRef.current = setInterval(spawnMonster, 3000);
      requestAnimationFrame(gameLoop);
    }

    // Mouse move
    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    });
    // Démarrage initial
    restartGame();
    // Nettoyage
    return () => {
      clearInterval(gameIntervalRef.current);
      if (playerRef.current && playerRef.current.attackTimer) clearInterval(playerRef.current.attackTimer);
    };
  }, []);

  // Handler pour le bouton "Rejouer"
  function handleRestart() {
    if (typeof window !== 'undefined') {
      // On relance tout via useEffect, donc on reload la page pour reset proprement
      window.location.reload();
    }
  }

  return (
    <div className={styles.page}>
      <div
        id="gameOverScreen"
        ref={gameOverScreenRef}
        style={{ display: 'none', position: 'absolute', top: 0, left: 0, width: 600, height: 400, background: 'rgba(0,0,0,0.7)', color: 'white', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', zIndex: 2 }}
      >
        <div>Game Over</div>
        <button onClick={handleRestart}>Rejouer</button>
      </div>
      <canvas
        id="gameCanvas"
        ref={canvasRef}
        width={600}
        height={400}
        style={{ border: '1px solid #333', background: '#222', display: 'block', margin: '0 auto', zIndex: 1 }}
      ></canvas>
    </div>
  );
}
