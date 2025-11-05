import React, { useState } from "react";

export default function ContractEvaluator() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please paste some contract text.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/contracts/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const textBody = await res.text();
        throw new Error(`Server returned ${res.status}: ${textBody}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your contract text here..."
          className="w-full h-56 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Evaluating..." : "Evaluate Contract"}
          </button>
          <button
            type="button"
            onClick={() => { setText(""); setResult(null); setError(null); }}
            className="px-3 py-2 border rounded"
          >
            Clear
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 text-red-600 font-medium">{error}</div>
      )}

      {result && (
        <div className="mt-6">
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-lg font-semibold">Average Risk Score: {result.average_risk_score}</div>
            <div className="mt-3 space-y-3">
              {result.details && result.details.length ? result.details.map((d, i) => (
                <div key={i} className="border p-3 rounded bg-white">
                  <div><strong>Sentence:</strong> {d.sentence}</div>
                  <div><strong>Category:</strong> {d.matched_category}</div>
                  <div><strong>Risk Level:</strong> {d.risk_level}</div>
                  <div><strong>Similarity:</strong> {d.similarity_score}</div>
                </div>
              )) : <div>No details returned.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
