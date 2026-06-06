"use client";

import * as React from "react";
import * as THREE from "three";

import { cn } from "@/lib/utils";

/**
 * ShaderBackground — WebGL fragment shader rendered to a full-bleed canvas.
 *
 * Adapted from the asset provided in `Requirments/Assets/Shader_Animation.txt`:
 * three concentric ripples colored by time, useful as a low-key animated
 * backdrop for the hero band. Auto-resizes on viewport change.
 *
 * Performance:
 *   - Runs only when the user has not opted into reduced motion.
 *   - Pauses when the tab is hidden (visibilitychange).
 *   - Throttles to the device's pixel ratio (no super-sampling).
 *
 * Color tweaks happen in the fragment shader's color array — currently a
 * dark indigo/gold blend that pairs with the brand. Edit if a brighter
 * scene is needed.
 */
export interface ShaderBackgroundProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Animation speed multiplier (1 = default from the source asset). */
  speed?: number;
}

export function ShaderBackground({
  speed = 1,
  className,
  ...props
}: ShaderBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    // Color-tinted to the WR Doors palette (gold + warm navy)
    const fragmentShader = `
      #define TWO_PI 6.2831853072
      #define PI 3.14159265359

      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        float t = time * 0.05;
        float lineWidth = 0.0018;

        // Gold-leaning palette: r channel boosted, b channel muted
        vec3 color = vec3(0.0);
        for (int j = 0; j < 3; j++) {
          for (int i = 0; i < 5; i++) {
            color[j] += lineWidth * float(i * i) /
              abs(fract(t - 0.01 * float(j) + float(i) * 0.01) * 5.0 - length(uv) + mod(uv.x + uv.y, 0.2));
          }
        }

        // Bias toward gold/navy: scale R higher, attenuate B
        vec3 tinted = vec3(color.r * 1.15, color.g * 0.85, color.b * 0.55);
        gl_FragColor = vec4(tinted, 1.0);
      }
    `;

    const camera = new THREE.Camera();
    camera.position.z = 1;

    const scene = new THREE.Scene();
    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      time: { value: 1.0 },
      resolution: { value: new THREE.Vector2() },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const onResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      uniforms.resolution.value.set(
        renderer.domElement.width,
        renderer.domElement.height,
      );
    };
    onResize();
    window.addEventListener("resize", onResize, false);

    let frameId = 0;
    let running = !prefersReducedMotion;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      uniforms.time.value += 0.05 * speed;
      renderer.render(scene, camera);
    };

    if (running) animate();

    // Pause when tab hidden — saves battery
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frameId);
        running = false;
      } else if (!prefersReducedMotion && !running) {
        running = true;
        animate();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [speed]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={cn(
        "absolute inset-0 overflow-hidden bg-[var(--color-brand-navy-dark)]",
        className,
      )}
      {...props}
    />
  );
}
