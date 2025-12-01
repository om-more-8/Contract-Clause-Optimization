// src/components/GlassCard.jsx
import React from "react";

export default function GlassCard({ children, className = "" }) {
  return (
    <div
      className={
        "glass-card relative rounded-2xl p-6 backdrop-blur-xl " +
        "bg-white/10 border border-white/20 shadow-xl " +
        "transition-all duration-300 hover:bg-white/20 " +
        className
      }
    >
      {children}
    </div>
  );
}
