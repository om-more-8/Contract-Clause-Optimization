import React, { useState } from "react";
import { motion } from "framer-motion";

export default function ContractEvaluator() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle text-based evaluation
  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please paste some contract text.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const getRiskLevel = (score) => {
    if (score < 1.5) return { label: "Low", color: "bg-green-200 text-green-800" };
    if (score < 2.5) return { label: "Medium", color: "bg-yellow-200 text-yellow-800" };
    return { label: "High", color: "bg-red-200 text-red-800" };
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/contracts/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch results. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  // Handle PDF upload
  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://127.0.0.1:8000/contracts/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      const data = await res.json();
      setResult(data.analysis || data);
    } catch (err) {
      console.error(err);
      setError("PDF upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  


  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-3xl">
      <h2 className="text-2xl font-semibold mb-4 text-blue-700">Contract Risk Evaluator</h2>

      {/* ---------- Text Evaluation Section ---------- */}
      <form onSubmit={handleTextSubmit} className="flex flex-col gap-4 mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your contract text here..."
          className="w-full h-48 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Evaluating..." : "Evaluate Text"}
          </button>
          <button
            type="button"
            onClick={() => {
              setText("");
              setResult(null);
              setError(null);
              setFile(null);
            }}
            className="px-3 py-2 border rounded"
          >
            Clear
          </button>
        </div>
      </form>

      {/* ---------- OR Divider ---------- */}
      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-3 text-gray-500 text-sm">OR</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      {/* ---------- PDF Upload Section ---------- */}
      <form onSubmit={handleFileSubmit} className="flex flex-col gap-4 mb-6">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files[0])}
          className="block w-full border rounded p-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? "Analyzing..." : "Upload PDF & Evaluate"}
        </button>
      </form>

      {/* ---------- Error ---------- */}
      {error && <div className="text-red-500 mt-4 font-medium">{error}</div>}

      {/* ---------- Results ---------- */}
      {result && (
        <div className="mt-6">
          <div className="bg-gray-50 p-6 rounded-xl shadow-md border">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6"
            >
              {/* Risk Summary */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold">
                  Average Risk Score:{" "}
                  <span className="font-bold">{result.average_risk_score}</span>
                </div>

                {/* Dynamic Risk Badge */}
                {(() => {
                  let riskLabel = "Medium";
                  let colorClass = "bg-yellow-500";

                  if (result.average_risk_score < 1.5) {
                    riskLabel = "Low";
                    colorClass = "bg-green-500";
                  } else if (result.average_risk_score >= 2.5) {
                    riskLabel = "High";
                    colorClass = "bg-red-500";
                  }

                  return (
                    <div
                      className={`px-4 py-2 rounded-full text-white font-semibold ${colorClass}`}
                    >
                      {riskLabel} Risk
                    </div>
                  );
                })()}
              </div>
            </motion.div>

            {/* Detailed Breakdown */}
            <div className="mt-3 space-y-3">
              {result.details && result.details.length ? (
                result.details.map((d, i) => (
                  <div key={i} className="border p-3 rounded bg-white hover:shadow">
                    <div>
                      <strong>Sentence:</strong> {d.sentence}
                    </div>
                    <div>
                      <strong>Category:</strong> {d.matched_category}
                    </div>
                    <div>
                      <strong>Risk Level:</strong>{" "}
                      <span
                        className={`font-semibold ${
                          d.risk_level === "Low"
                            ? "text-green-600"
                            : d.risk_level === "Medium"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {d.risk_level}
                      </span>
                    </div>
                    <div>
                      <strong>Similarity:</strong> {d.similarity_score}
                    </div>
                  </div>
                ))
              ) : (
                <div>No details returned.</div>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
