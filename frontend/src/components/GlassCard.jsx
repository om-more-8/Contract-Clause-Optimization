export default function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`backdrop-blur-xl bg-white/20 border border-white/40 
                  shadow-[0_8px_32px_rgba(31,38,135,0.15)]
                  rounded-2xl p-6 transition-all duration-300 
                  hover:bg-white/30 hover:border-white/60
                  hover:shadow-[0_12px_40px_rgba(31,38,135,0.25)]
                  ${className}`}
    >
      {children}
    </div>
  );
}
