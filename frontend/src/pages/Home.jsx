// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="min-h-[80vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start mt-8">
        {/* Left: Hero / Description */}
        <section className="space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text 
                         bg-gradient-to-r from-blue-600 to-indigo-600">
            CogniClause — Contract Risk Analyzer
          </h1>

          <p className="text-lg text-slate-700/90 max-w-2xl">
            Analyze contracts in seconds. Identify risky clauses, classify their type,
            and get an interpretable risk score. Use text or upload a PDF/DOCX — built for
            legal teams and product owners.
          </p>

          <div className="flex gap-3 items-center">
            <button
              onClick={() => navigate("/evaluate")}
              className="inline-flex items-center gap-3 px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg transition"
            >
              Evaluate a contract
            </button>

            <button
              onClick={() => navigate("/register")}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-white/10 text-indigo-700 bg-white/10 hover:bg-white/12 transition"
            >
              Create an account
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <GlassCard className="p-4">
              <h3 className="font-semibold">Fast</h3>
              <p className="text-sm text-slate-600/90">Clause-level scoring in seconds.</p>
            </GlassCard>
            <GlassCard className="p-4">
              <h3 className="font-semibold">Explainable</h3>
              <p className="text-sm text-slate-600/90">See which clause triggered the risk.</p>
            </GlassCard>
          </div>
        </section>

        {/* Right: Login card (compact) */}
        <aside className="self-start">
          <GlassCard className="group max-w-md">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
              <p className="text-sm text-slate-600">Log in to view history & evaluations</p>

              <div className="space-y-3">
                <input
                  readOnly
                  placeholder="Email (demo)"
                  className="w-full rounded-lg p-3 bg-white/10 border border-white/8 placeholder:text-slate-400"
                />
                <input
                  readOnly
                  placeholder="Password (demo)"
                  className="w-full rounded-lg p-3 bg-white/10 border border-white/8 placeholder:text-slate-400"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/login")}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                  Sign in
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-4 py-2 border rounded-lg"
                >
                  Register
                </button>
              </div>

              <div className="pt-2 text-sm text-slate-500">Or try social sign in</div>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => navigate("/login")}
                  className="flex-1 py-2 rounded-lg border border-white/10 bg-white/5"
                >
                  Google
                </button>
                <button className="flex-1 py-2 rounded-lg border border-white/10 bg-white/5">
                  GitHub
                </button>
              </div>
            </div>
          </GlassCard>
        </aside>
      </div>

      {/* small footer panel */}
      <div className="mt-12">
        <GlassCard className="p-4">
          <div className="text-sm text-slate-600">
            Tip: paste a contract or upload a PDF to the Evaluate screen. We support
            clause-level breakdowns.
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
