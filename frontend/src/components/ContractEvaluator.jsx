// src/components/ContractEvaluator.jsx
import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
// import your supabase client (adjust path if your client lives in src/lib or src)
import { supabase } from "../lib/supabaseClient";
import GlassCard from "./GlassCard";

/**
 * ContractEvaluator.jsx (fixed)
 * - Avoids useSupabaseClient / useUser imports (prevents bundler errors if package versions mismatch)
 * - Uses supabase.auth.getSession() to try to attach user_id to requests
 * - Keeps drag/drop + file upload + text evaluate flows
 */

const RISK_COLORS = {
  Low: "bg-green-500 text-white",
  Medium: "bg-yellow-500 text-black",
  High: "bg-red-500 text-white",
  Unknown: "bg-gray-400 text-white",
};

function RiskBadge({ level = "Unknown" }) {
  const cls = RISK_COLORS[level] || RISK_COLORS.Unknown;
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className={`px-4 py-2 rounded-full font-semibold ${cls}`}
    >
      {level} Risk
    </motion.div>
  );
}

function LoadingBar({ active }) {
  if (!active) return null;
  return (
    <div className="mt-3">
      <div className="h-2 w-full bg-slate-100 rounded overflow-hidden border">
        <motion.div
          className="h-full bg-indigo-400"
          initial={{ width: "0%" }}
          animate={{ width: ["0%", "65%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
}

export default function ContractEvaluator() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);
  const dropRef = useRef();

  const avgToLabel = (avg) => {
    if (typeof avg !== "number") return "Unknown";
    if (avg <= 1.5) return "Low";
    if (avg <= 2.3) return "Medium";
    return "High";
  };

  const getCurrentUserId = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (session?.user?.id) return session.user.id;
    } catch (e) {
      console.warn("Could not read session:", e);
    }
    return null;
  };

  const handleTextEvaluate = async (e) => {
    e?.preventDefault();
    setError(null);
    if (!text || !text.trim()) {
      setError("Please paste some contract text or upload a PDF.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const user_id = await getCurrentUserId();
      const res = await fetch("http://127.0.0.1:8000/contracts/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, user_id, name: "manual evaluation" }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server ${res.status}: ${errText}`);
      }

      const data = await res.json();
      if (data && data.average_risk_score !== undefined && !data.risk_level) {
        data.risk_level = avgToLabel(data.average_risk_score);
      }
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // drag & drop handlers
  const onDrop = useCallback(async (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const files = ev.dataTransfer?.files || ev.target?.files;
    if (!files || files.length === 0) return;
    await uploadFile(files[0]);
  }, []);

  const onDragOver = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (dropRef.current) dropRef.current.classList.add("ring-4", "ring-indigo-200");
  };
  const onDragLeave = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (dropRef.current) dropRef.current.classList.remove("ring-4", "ring-indigo-200");
  };

  const uploadFile = async (file) => {
    setError(null);
    setFileLoading(true);
    setFileName(file.name);
    setResult(null);
    try {
      const user_id = await getCurrentUserId();
      const form = new FormData();
      form.append("file", file);
      if (user_id) form.append("user_id", user_id);
      form.append("name", file.name || "uploaded");

      const res = await fetch("http://127.0.0.1:8000/contracts/upload", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Upload failed ${res.status}: ${txt}`);
      }

      const data = await res.json();
      if (data.analysis && !data.average_risk_score) {
        const drafted = {
          average_risk_score: data.analysis.average_risk_score || null,
          risk_level: data.analysis.risk_level || avgToLabel(data.analysis.average_risk_score || 0),
          details: data.analysis.details || [],
        };
        setResult(drafted);
      } else {
        if (data && data.average_risk_score !== undefined && !data.risk_level) {
          data.risk_level = avgToLabel(data.average_risk_score);
        }
        setResult(data);
      }
    } catch (err) {
      console.error(err);
      setError(String(err.message || err));
    } finally {
      setFileLoading(false);
      if (dropRef.current) dropRef.current.classList.remove("ring-4", "ring-indigo-200");
    }
  };

  const handleFileInput = (ev) => {
    const f = ev.target.files?.[0];
    if (f) uploadFile(f);
  };

  const SummaryBlock = ({ data }) => {
    if (!data) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="p-6 rounded-xl bg-white/80 shadow-lg border">
          <div className="text-sm text-gray-500">No results yet — evaluate a contract to see a summary here.</div>
        </motion.div>
      );
    }
    const avg = data.average_risk_score ?? null;
    const level = data.risk_level ?? avgToLabel(avg);
    const counts = { Low: 0, Medium: 0, High: 0 };
    (data.details || []).forEach((d) => {
      const rl = d.risk_level || avgToLabel(d.similarity_score);
      counts[rl] = (counts[rl] || 0) + 1;
    });

    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="p-6 rounded-xl bg-white/90 shadow-lg border">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Summary</div>
            <div className="text-2xl font-bold">{level} overall</div>
            <div className="text-sm text-gray-600 mt-1">Average risk score: <span className="font-semibold">{avg ?? "-"}</span></div>
          </div>
          <div className="text-right space-y-1">
            <div className="text-xs text-gray-500">High</div>
            <div className="text-xl font-bold text-red-500">{counts.High}</div>
            <div className="text-xs text-gray-500 mt-2">Medium</div>
            <div className="text-xl font-bold text-yellow-500">{counts.Medium}</div>
            <div className="text-xs text-gray-500 mt-2">Low</div>
            <div className="text-xl font-bold text-green-500">{counts.Low}</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm text-gray-600">Short advice</div>
          <div className="mt-2 text-sm">
            {level === "High" && <span className="text-red-600">Multiple high-risk clauses found. Recommend legal review and negotiation of terms.</span>}
            {level === "Medium" && <span className="text-yellow-600">Some clauses need attention. Consider modifying specific sections.</span>}
            {level === "Low" && <span className="text-green-600">Contract appears low-risk on key categories, but review as needed.</span>}
          </div>
        </div>
      </motion.div>
    );
  };

  const ClauseCard = ({ d, i }) => (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border rounded p-3 bg-white hover:shadow-sm">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <div className="text-sm text-gray-600 mb-2"><strong>Sentence:</strong> {d.sentence}</div>
          <div className="flex gap-3 flex-wrap">
            <div className="text-xs px-2 py-1 border rounded">{d.matched_category}</div>
            <div className={`text-xs px-2 py-1 rounded font-semibold ${
              d.risk_level === "Low" ? "text-green-700 bg-green-50" :
              d.risk_level === "Medium" ? "text-yellow-700 bg-yellow-50" :
              "text-red-700 bg-red-50"
            }`}>
              {d.risk_level}
            </div>
            <div className="text-xs px-2 py-1 border rounded">sim: {d.similarity_score}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  let lastMoveTime = 0;

const handleGlowMove = (e) => {
  const now = performance.now();
  const delta = now - lastMoveTime;
  lastMoveTime = now;

  const speed = Math.min(1, 50 / delta); // fast movement = brighter glow

  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  e.currentTarget.style.setProperty("--x", `${x}px`);
  e.currentTarget.style.setProperty("--y", `${y}px`);
  e.currentTarget.style.setProperty("--glow-strength", 0.15 + speed * 0.6);
};



  return (
    <div className="max-w-5xl mx-auto p-6">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-extrabold from-indigo-500 to-pink-500 bg-clip-text text-transparent bg-gradient-to-r">
        🚀 Contract Risk Analyzer
      </motion.h2>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
  className="glass-card glow-border cursor-glow floating p-6 w-full "
  onMouseMove={handleGlowMove}
>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Paste contract text</div>
              <div className="text-xs text-gray-400">You can also upload a PDF in the right panel.</div>
            </div>
            <div className="text-sm text-gray-500">Text mode</div>
          </div>

          <form onSubmit={handleTextEvaluate} className="mt-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste contract text here... (or drag & drop a PDF to the right)"
              className="w-full h-56 p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white/90 resize-none"
            />
            <div className="flex items-center gap-3 mt-4">
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className={`inline-flex items-center gap-2 px-4 py-2 rounded shadow text-white ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                {loading ? 'Evaluating...' : 'Evaluate Contract'}
              </motion.button>
              <motion.button type="button" onClick={() => { setText(""); setResult(null); setError(null); }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-3 py-2 border rounded">
                Clear
              </motion.button>

              <div className="ml-auto flex items-center gap-3">
                <div className="text-sm text-gray-600">Result:</div>
                <RiskBadge level={result?.risk_level ?? "Unknown"} />
              </div>
            </div>

            <LoadingBar active={loading} />
          </form>

          {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
        </div>

        <div   className="glass-card glow-border cursor-glow floating p-6 w-full "
  onMouseMove={handleGlowMove}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Upload PDF (drag & drop)</div>
              <div className="text-xs text-gray-400">Drop a PDF file here or click to choose.</div>
            </div>
            <div className="text-sm text-gray-500">File mode</div>
          </div>

          <motion.div ref={dropRef} onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} onClick={() => document.getElementById("fileinput")?.click()} whileHover={{ scale: 1.01 }} className="mt-4 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-3 cursor-pointer">
            <svg className="w-12 h-12 text-indigo-400" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 7l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 21H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

            <div className="text-sm text-gray-700">Drop PDF here</div>
            <div className="text-xs text-gray-400">or click to browse</div>

            <input id="fileinput" type="file" accept=".pdf,.doc,.docx" onChange={handleFileInput} className="hidden" />
            <div className="text-xs text-gray-500">Supported: PDF, DOCX (extracted)</div>
          </motion.div>

          <div className="mt-4">
            <div className="flex items-center gap-3">
              <motion.button onClick={() => { if (result && result.average_risk_score !== undefined) { setError(null); } else { setError("Upload a file to evaluate."); } }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className={`px-3 py-2 rounded text-white ${fileLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                {fileLoading ? 'Uploading...' : 'Upload & Evaluate'}
              </motion.button>

              <div className="text-sm text-gray-500 ml-auto">{fileName ?? "No file selected"}</div>
            </div>

            <LoadingBar active={fileLoading} />
          </div>
        </div>
        
        <div className="md:col-span-2">
          
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard>
            <div className="lg:col-span-1">
              <SummaryBlock data={result} />
            </div>
            </GlassCard>

            <GlassCard>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="p-6 rounded-xl bg-white/90 shadow-lg border">
              
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-500">Overall Risk</div>
                  <div className="mt-2"><RiskBadge level={result?.risk_level ?? "Unknown"} /></div>
                </div>

                <div className="flex-1">
                  <div className="text-sm text-gray-500">Quick actions</div>
                  <div className="mt-3 flex gap-2">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="px-3 py-2 border rounded">Export</motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="px-3 py-2 border rounded">Share</motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="px-3 py-2 border rounded">Request Review</motion.button>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">Note: export/share are placeholders — wire them to your backend/actions.</div>
              
            </motion.div>
            </GlassCard>
          </div>
          

          <div className="mt-4 space-y-3">
            {result && result.details && result.details.length ? (
              result.details.map((d, i) => <ClauseCard key={i} d={d} i={i} />)
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-500">No clause-level details returned yet.</motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
