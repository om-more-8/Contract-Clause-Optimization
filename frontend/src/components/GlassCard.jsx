// src/components/GlassCard.jsx
import React from "react";

/**
 * Reusable glassmorphism container.
 * className is appended for size/layout tweaks.
 */
export default function GlassCard({ children, className = "" }) {
  return (
    <div
      className={
        "relative rounded-2xl bg-white/6 border border-white/10 backdrop-blur-md " +
        "shadow-[0_8px_30px_rgba(2,6,23,0.35)] transition-all duration-300 " +
        "hover:scale-[1.01] hover:bg-white/10 hover:border-white/20 " +
        className
      }
    >
      {/* subtle neon rim */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="p-6">{children}</div>
    </div>
  );
}
