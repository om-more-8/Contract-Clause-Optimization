// src/components/BackgroundLayer.jsx
import ParticleBackground from "./ParticleBackground";

export default function BackgroundLayer() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -10,
        pointerEvents: "none",
        background: "linear-gradient(135deg,#dbeafe,#93c5fd)",
      }}
    >
      <ParticleBackground />
    </div>
  );
}
