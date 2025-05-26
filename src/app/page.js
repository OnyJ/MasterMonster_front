"use client";
import Image from "next/image";
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
    const gameOverScreen = gameOverScreenRef.current;

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

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (playerRef.current.isAlive)
        drawEntity(ctx, playerRef.current, "blue");
      drawRotatingFlame(ctx, playerRef.current);
      monstersRef.current.forEach((monster) =>
        drawEntity(ctx, monster, "green")
      );
    }

    function gameLoop() {
      update();
      draw();
      if (playerRef.current.isAlive) requestAnimationFrame(gameLoop);
    }

    function spawnMonster() {
      const padding = 20;
      const x =
        Math.random() * (canvas.width - 2 * padding) + padding;
      const y =
        Math.random() * (canvas.height - 2 * padding) + padding;
      monstersRef.current.push(createMonster(x, y, 30, 5, 1));
    }

    function gameOver() {
      gameOverScreen.style.display = "flex";
      clearInterval(gameIntervalRef.current);
      if (playerRef.current.attackTimer)
        clearInterval(playerRef.current.attackTimer);
    }

    function restartGame() {
      gameOverScreen.style.display = "none";
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
        id="gameCanvas"
        ref={canvasRef}
        width={600}
        height={400}
        style={{
          border: "1px solid #333",
          background: "#222",
          display: "block",
          margin: "0 auto",
          zIndex: 1,
        }}
      ></canvas>
    </div>
  );
}
