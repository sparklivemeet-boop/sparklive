"use client";

import { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; alpha: number; pulse: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient orbs
      const time = Date.now() * 0.0003;

      // Orb 1 - Pink
      const orb1X = canvas.width * 0.3 + Math.sin(time * 0.7) * canvas.width * 0.15;
      const orb1Y = canvas.height * 0.4 + Math.cos(time * 0.5) * canvas.height * 0.1;
      const gradient1 = ctx.createRadialGradient(orb1X, orb1Y, 0, orb1X, orb1Y, 400);
      gradient1.addColorStop(0, "rgba(255, 0, 127, 0.05)");
      gradient1.addColorStop(0.5, "rgba(124, 58, 237, 0.03)");
      gradient1.addColorStop(1, "transparent");
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Orb 2 - Purple
      const orb2X = canvas.width * 0.7 + Math.sin(time * 0.5 + 1) * canvas.width * 0.12;
      const orb2Y = canvas.height * 0.6 + Math.cos(time * 0.7 + 1) * canvas.height * 0.12;
      const gradient2 = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, 350);
      gradient2.addColorStop(0, "rgba(124, 58, 237, 0.06)");
      gradient2.addColorStop(0.5, "rgba(6, 247, 255, 0.02)");
      gradient2.addColorStop(1, "transparent");
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Orb 3 - Cyan
      const orb3X = canvas.width * 0.5 + Math.sin(time * 0.9 + 2) * canvas.width * 0.2;
      const orb3Y = canvas.height * 0.3 + Math.cos(time * 0.6 + 2) * canvas.height * 0.15;
      const gradient3 = ctx.createRadialGradient(orb3X, orb3Y, 0, orb3X, orb3Y, 300);
      gradient3.addColorStop(0, "rgba(6, 247, 255, 0.04)");
      gradient3.addColorStop(1, "transparent");
      ctx.fillStyle = gradient3;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Particles
      particles.forEach((p) => {
        p.pulse += 0.02;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const alpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      });

      // Particle connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 * (1 - dist / 120)})`;
            ctx.stroke();
          }
        }
      }

      // Neon rings
      for (let i = 0; i < 3; i++) {
        const ringX = canvas.width * (0.25 + i * 0.25) + Math.sin(time + i * 2) * 50;
        const ringY = canvas.height * (0.3 + i * 0.2) + Math.cos(time * 0.7 + i * 2) * 40;
        ctx.beginPath();
        ctx.arc(ringX, ringY, 80 + i * 30, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 0, 127, ${0.03 + i * 0.01})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ringX, ringY, 80 + i * 30 + 40, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(124, 58, 237, ${0.02 + i * 0.01})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      {/* Aurora gradient overlay */}
      <div className="fixed inset-0 bg-aurora opacity-40 pointer-events-none" />
      {/* Canvas particles */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.6 }}
      />
      {/* Grid overlay */}
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none z-[1]" />
    </>
  );
}