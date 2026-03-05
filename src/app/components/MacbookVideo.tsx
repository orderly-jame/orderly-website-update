"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
ScrollTrigger.normalizeScroll(false);

const DESKTOP_FRAMES = 122;
const FRAME_W = 1400;
const FRAME_H = 843;

// Mobile sprite sheet: 31 frames, 375×226 each, stacked vertically
const MOBILE_SPRITE_FRAMES = 31;
const MOBILE_SPRITE_FRAME_W = 375;
const MOBILE_SPRITE_FRAME_H = 226;
const MOBILE_SPRITE_SRC = "/images/macbook-sprite-mobile.webp";

function getDesktopFrameSrc(index: number): string {
  return `/images/macbook-frames/${String(index + 1).padStart(4, "0")}.webp`;
}

interface MacbookVideoProps {
  className?: string;
  canvasWidth?: number;
  canvasHeight?: number;
}

export default function MacbookVideo({
  className,
  canvasWidth = 1125,
  canvasHeight = 838,
}: MacbookVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  const isMobile = canvasWidth < 500;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let targetFrame = 0;
    let lastDrawn = -1;
    let rafId = 0;
    let cancelled = false;

    if (isMobile) {
      // === MOBILE: Single sprite sheet — 1 HTTP request, ~256KB ===
      const totalFrames = MOBILE_SPRITE_FRAMES;

      // Precompute cover-crop from sprite frame to canvas
      const scale = Math.max(canvasWidth / MOBILE_SPRITE_FRAME_W, canvasHeight / MOBILE_SPRITE_FRAME_H);
      const scaledW = MOBILE_SPRITE_FRAME_W * scale;
      const scaledH = MOBILE_SPRITE_FRAME_H * scale;
      const cropX = ((scaledW - canvasWidth) / 2) / scale;
      const cropW = canvasWidth / scale;
      const cropH = canvasHeight / scale;

      const sprite = new Image();
      let spriteReady = false;

      const drawFrame = (index: number) => {
        if (!spriteReady || index === lastDrawn) return;
        lastDrawn = index;
        const cropY = index * MOBILE_SPRITE_FRAME_H + ((scaledH - canvasHeight) / 2) / scale;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(sprite, cropX, cropY, cropW, cropH, 0, 0, canvasWidth, canvasHeight);
      };

      const scheduleDrawFrame = () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => drawFrame(targetFrame));
      };

      sprite.onload = () => {
        if (cancelled) return;
        spriteReady = true;
        drawFrame(0);
        setCanvasReady(true);
      };
      sprite.src = MOBILE_SPRITE_SRC;

      const obj = { frame: 0 };
      const tween = gsap.to(obj, {
        frame: totalFrames - 1,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top bottom",
          end: "center center",
          scrub: 0.3,
          preventOverlaps: true,
          fastScrollEnd: true,
        },
        onUpdate: () => {
          const frameIndex = Math.round(obj.frame);
          if (frameIndex !== targetFrame) {
            targetFrame = frameIndex;
            scheduleDrawFrame();
          }
        },
      });

      return () => {
        cancelled = true;
        cancelAnimationFrame(rafId);
        tween.kill();
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === container) st.kill();
        });
      };
    } else {
      // === DESKTOP: Individual frames (122 × ~68KB) ===
      const totalFrames = DESKTOP_FRAMES;
      const scale = Math.max(canvasWidth / FRAME_W, canvasHeight / FRAME_H);
      const scaledW = FRAME_W * scale;
      const scaledH = FRAME_H * scale;
      const sx = ((scaledW - canvasWidth) / 2) / scale;
      const sy = ((scaledH - canvasHeight) / 2) / scale;
      const sw = canvasWidth / scale;
      const sh = canvasHeight / scale;

      const images: HTMLImageElement[] = new Array(totalFrames);
      const loaded = new Set<number>();

      const drawFrame = (index: number) => {
        let actual = -1;
        if (loaded.has(index)) {
          actual = index;
        } else {
          for (let d = 1; d < totalFrames; d++) {
            const before = index - d;
            if (before >= 0 && loaded.has(before)) { actual = before; break; }
            const after = index + d;
            if (after < totalFrames && loaded.has(after)) { actual = after; break; }
          }
        }
        if (actual < 0 || actual === lastDrawn) return;
        lastDrawn = actual;
        const img = images[actual];
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvasWidth, canvasHeight);
      };

      const scheduleDrawFrame = () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => drawFrame(targetFrame));
      };

      for (let i = 0; i < totalFrames; i++) {
        const img = new Image();
        img.src = getDesktopFrameSrc(i);
        img.onload = () => {
          if (cancelled) return;
          images[i] = img;
          loaded.add(i);
          if (i === 0) {
            drawFrame(0);
            setCanvasReady(true);
          }
        };
        img.onerror = () => {};
      }

      const obj = { frame: 0 };
      const tween = gsap.to(obj, {
        frame: totalFrames - 1,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top bottom",
          end: "center center",
          scrub: 0.3,
          preventOverlaps: true,
          fastScrollEnd: true,
        },
        onUpdate: () => {
          const frameIndex = Math.round(obj.frame);
          if (frameIndex !== targetFrame) {
            targetFrame = frameIndex;
            scheduleDrawFrame();
          }
        },
      });

      return () => {
        cancelled = true;
        cancelAnimationFrame(rafId);
        tween.kill();
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === container) st.kill();
        });
      };
    }
  }, [canvasWidth, canvasHeight, isMobile]);

  return (
    <div ref={containerRef} className={className}>
      {!canvasReady && (
        <img
          src={isMobile ? MOBILE_SPRITE_SRC : "/images/macbook-frames/0001.webp"}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
          }}
        />
      )}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
