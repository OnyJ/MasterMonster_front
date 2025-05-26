"use client";

import { useRef, useEffect } from "react";

// Tutorial here : https://dev.to/martyhimmel/animating-sprite-sheets-with-javascript-ag3

export default function PlayerTest() {
  const canvasRef = useRef(null);
  const imgRef = useRef(new Image());

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const scale = 2;
    const width = 16;
    const height = 18;
    const scaledWidth = scale * width;
    const scaledHeight = scale * height;

    function drawFrame(frameX, frameY, canvasX, canvasY) {
      ctx.drawImage(
        imgRef.current,
        frameX * width,
        frameY * height,
        width,
        height,
        canvasX,
        canvasY,
        scaledWidth,
        scaledHeight
      );
    }

    imgRef.current.src =
      "https://opengameart.org/sites/default/files/Green-Cap-Character-16x18.png";
    imgRef.current.onload = function () {
      drawFrame(0, 0, 0, 0);
      drawFrame(1, 0, scaledWidth, 0);
      drawFrame(0, 0, scaledWidth * 2, 0);
      drawFrame(2, 0, scaledWidth * 3, 0);
    };

    const cycleLoop = [0, 1, 0, 2];
    let currentLoopIndex = 0;
    let frameCount = 0;
    let currentDirection = 0;

    function step() {
      frameCount++;
      if (frameCount < 15) {
        requestAnimationFrame(step);
        return;
      }
      frameCount = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawFrame(cycleLoop[currentLoopIndex], currentDirection, 0, 0);
      currentLoopIndex++;
      if (currentLoopIndex >= cycleLoop.length) {
        currentLoopIndex = 0;
        currentDirection++;
      }

      if (currentDirection >= 4) {
        currentDirection = 0;
      }
      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width="300"
        height="200"
        style={{
          border: "1px solid blue",
        }}
      />
    </div>
  );
}
