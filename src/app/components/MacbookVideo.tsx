"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
ScrollTrigger.normalizeScroll(false);

const DESKTOP_FRAMES = 122;
const MOBILE_FRAMES = 61;
// Native resolution of extracted frames
const FRAME_W = 1400;
const FRAME_H = 843;

function getFrameSrc(index: number, mobile: boolean): string {
  const dir = mobile ? "macbook-frames-mobile" : "macbook-frames";
  return `/images/${dir}/${String(index).padStart(4, "0")}.webp`;
}

interface MacbookVideoProps {
  className?: string;
  /** Canvas resolution width (matches container design width) */
  canvasWidth?: number;
  /** Canvas resolution height (matches container design height) */
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

    const totalFrames = isMobile ? MOBILE_FRAMES : DESKTOP_FRAMES;
    const frameW = isMobile ? 375 : FRAME_W;
    const frameH = isMobile ? Math.round(375 * (FRAME_H / FRAME_W)) : FRAME_H;

    // Precompute "object-fit: cover" crop parameters
    const scale = Math.max(canvasWidth / frameW, canvasHeight / frameH);
    const scaledW = frameW * scale;
    const scaledH = frameH * scale;
    const sx = ((scaledW - canvasWidth) / 2) / scale;
    const sy = ((scaledH - canvasHeight) / 2) / scale;
    const sw = canvasWidth / scale;
    const sh = canvasHeight / scale;

    const images: HTMLImageElement[] = new Array(totalFrames);
    const loaded = new Set<number>();
    let targetFrame = 0;
    let lastDrawn = -1;
    let rafId = 0;
    let cancelled = false;

    const drawFrame = (index: number) => {
      // Find exact or nearest loaded frame
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

    // Decouple drawing from scroll — use rAF so scroll is never blocked
    const scheduleDrawFrame = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => drawFrame(targetFrame));
    };

    // Load all frames in parallel — browser handles connection queuing (6 per domain)
    const loadFrame = (frameIndex: number) => {
      const img = new Image();
      img.src = getFrameSrc(frameIndex + 1, isMobile);
      img.onload = () => {
        if (cancelled) return;
        images[frameIndex] = img;
        loaded.add(frameIndex);
        // First frame ready — show canvas
        if (frameIndex === 0) {
          drawFrame(0);
          setCanvasReady(true);
        }
      };
      img.onerror = () => {}; // skip failed frames
    };

    // Fire frame 0 first, then the rest
    loadFrame(0);
    for (let i = 1; i < totalFrames; i++) {
      loadFrame(i);
    }

    // GSAP ScrollTrigger to map scroll → frame index
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
  }, [canvasWidth, canvasHeight, isMobile]);

  const firstFrameSrc = getFrameSrc(1, isMobile);

  return (
    <div ref={containerRef} className={className}>
      {/* Static fallback image — visible instantly before canvas is ready */}
      {!canvasReady && (
        <img
          src={firstFrameSrc}
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
