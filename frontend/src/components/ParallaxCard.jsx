import React, { useRef, useEffect } from "react";

export default function ParallaxCard({
  children,
  className = "",
  depth = 15,
}) {
  const cardRef = useRef(null);
  const lastPos = useRef({ x: 0, y: 0, t: 0 });

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMove = (e) => {
      const rect = card.getBoundingClientRect();

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      // tilt
      const tiltX = dy * -10;
      const tiltY = dx * 10;

      card.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;

      // glow tracking
      const now = performance.now();
      const dt = Math.max(16, now - lastPos.current.t);

      const vx = (e.clientX - lastPos.current.x) / dt;
      const vy = (e.clientY - lastPos.current.y) / dt;
      const speed = Math.min(1.2, Math.sqrt(vx * vx + vy * vy) * 12);

      // CSS variables
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
      card.style.setProperty("--glow", 0.15 + speed * 0.6);

      lastPos.current = { x: e.clientX, y: e.clientY, t: now };
    };

    const handleLeave = () => {
      card.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)`;
      card.style.setProperty("--glow", 0);
      card.style.setProperty("--mx", `-9999px`);
      card.style.setProperty("--my", `-9999px`);
    };

    card.addEventListener("mousemove", handleMove, { passive: true });
    card.addEventListener("mouseleave", handleLeave);

    return () => {
      card.removeEventListener("mousemove", handleMove);
      card.removeEventListener("mouseleave", handleLeave);
    };
  }, [depth]);

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-2xl parallax-surface ${className}`}
      style={{
        "--mx": "-9999px",
        "--my": "-9999px",
        "--glow": 0,
      }}
    >
      {/* neon glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(
              circle at var(--mx) var(--my),
              rgba(120,150,255,var(--glow)),
              transparent 60%
            )`,
          filter: "blur(40px)",
        }}
      ></div>

      {/* soft glass */}
      <div className="relative z-10 backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl shadow-xl">
        {children}
      </div>
    </div>
  );
}
