"use client";

import styles from "./page.module.css";
import { useRef, useEffect } from "react";
import { createPlayer } from "@/game/player/player";
import { createMonster } from "@/game/monster/monster";
import { moveEntityTowards } from "@/game/core/movement";
import { updateMonster } from "@/game/monster/monsterAI";
import {
  tryAttack,
  performCircularAttack,
} from "@/game/combat/attack";
import { drawEntity, drawRotatingFlame } from "@/game/canvas/draw";

export default function Home() {
  const canvasRef = useRef(null);
  const gameOverScreenRef = useRef(null);
  const playerRef = useRef();
  const monstersRef = useRef([]);
  const gameIntervalRef = useRef();
  const mouseRef = useRef({ x: 300, y: 200 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Fonction pour dessiner la carte style Donjon avec obstacles
    function drawMap() {
      // Dessiner le fond (sol de la carte)
      ctx.fillStyle = "#2f2f2f"; // Sol sombre pour le donjon
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dessiner les murs du donjon
      ctx.fillStyle = "#696969"; // Gris foncé pour les murs
      ctx.fillRect(50, 50, 500, 20); // Mur supérieur
      ctx.fillRect(50, 50, 20, 300); // Mur gauche
      ctx.fillRect(530, 50, 20, 300); // Mur droit
      ctx.fillRect(50, 330, 500, 20); // Mur inférieur

      // Quelques pièces à l'intérieur du donjon
      ctx.fillRect(150, 150, 100, 100); // Une pièce
      ctx.fillRect(300, 150, 100, 100); // Une autre pièce
      ctx.fillRect(150, 300, 100, 30);  // Petite pièce

      // Passage entre les pièces
      ctx.clearRect(250, 150, 50, 100); // Passage central entre deux pièces
      ctx.clearRect(150, 250, 100, 50); // Passage entre la petite pièce et la grande

      // Dessiner les portes
      ctx.fillStyle = "#d2691e"; // Porte en bois
      ctx.fillRect(250, 250, 20, 30); // Porte entre deux pièces
      ctx.fillRect(400, 150, 20, 30); // Porte entre les pièces

      // Ajouter des pièges (zones dangereuses)
      ctx.fillStyle = "#ff6347"; // Rouge pour les pièges
      ctx.fillRect(380, 250, 20, 20); // Piège dans un coin
      ctx.fillRect(280, 300, 20, 20); // Piège près d'une porte

      // Ajouter des trésors (zones de récompenses)
      ctx.fillStyle = "#ffd700"; // Or pour les trésors
      ctx.fillRect(180, 120, 20, 20); // Trésor dans la pièce
      ctx.fillRect(320, 120, 20, 20); // Trésor dans l'autre pièce

      // Dessiner les obstacles
      ctx.fillStyle = "#8B0000"; // Rouge sombre pour les obstacles
      ctx.fillRect(250, 250, 40, 40); // Premier obstacle (bloque le passage)
      ctx.fillRect(300, 250, 40, 40); // Deuxième obstacle (bloque le passage)
      ctx.fillRect(100, 200, 40, 40); // Troisième obstacle (bloque l'accès à une pièce)
      ctx.fillRect(400, 300, 40, 40); // Quatrième obstacle (bloque un passage)
    }

    // Fonction de mise à jour du jeu
    function update() {
      if (!playerRef.current.isAlive) return;
      moveEntityTowards(
        playerRef.current,
        mouseRef.current.x,
        mouseRef.current.y,
        canvas
      );
      monstersRef.current.forEach((monster) => {
        updateMonster(monster, playerRef.current, canvas);
        tryAttack(monster, playerRef.current, gameOver);
      });
      performCircularAttack(playerRef.current, monstersRef.current);
      playerRef.current.attackAngle += 0.1;
    }

    // Fonction de dessin
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Effacer le canvas à chaque frame
      drawMap(); // Dessiner la carte style donjon avec obstacles
      // Dessiner le joueur et les monstres comme d'habitude
      if (playerRef.current.isAlive)
        drawEntity(ctx, playerRef.current, "blue");
      drawRotatingFlame(ctx, playerRef.current);
      monstersRef.current.forEach((monster) =>
        drawEntity(ctx, monster, "green")
      );
    }

    // Boucle de jeu
    function gameLoop() {
      update();
      draw();
      if (playerRef.current.isAlive) requestAnimationFrame(gameLoop);
    }

    // Fonction pour générer des monstres
    function spawnMonster() {
      const padding = 20;
      const x =
        Math.random() * (canvas.width - 2 * padding) + padding;
      const y =
        Math.random() * (canvas.height - 2 * padding) + padding;
      monstersRef.current.push(createMonster(x, y, 30, 5, 1));
    }

    // Fonction de fin de jeu
    function gameOver() {
      gameOverScreenRef.current.style.display = "flex";
      clearInterval(gameIntervalRef.current);
      if (playerRef.current.attackTimer)
        clearInterval(playerRef.current.attackTimer);
    }

    // Fonction pour redémarrer le jeu
    function restartGame() {
      gameOverScreenRef.current.style.display = "none";
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

    // Événement de déplacement de la souris
    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    });
    restartGame();

    return () => {
      clearInterval(gameIntervalRef.current);
      if (playerRef.current && playerRef.current.attackTimer)
        clearInterval(playerRef.current.attackTimer);
    };
  }, []);

  // Fonction pour gérer le redémarrage
  function handleRestart() {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }

  return (
    <div className={styles.page}>
      <div
        id="gameOverScreen"
        ref={gameOverScreenRef}
        style={{
          display: "none",
          position: "absolute",
          top: 0,
          left: 0,
          width: 600,
          height: 400,
          background: "rgba(0,0,0,0.7)",
          color: "white",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          zIndex: 2,
        }}
      >
        <div>Game Over</div>
        <button onClick={handleRestart}>Rejouer</button>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        style={{
          border: "1px solid #333",
          background: "#222",
          display: "block",
          margin: "0 auto",
        }}
      ></canvas>
    </div>
  );
}
