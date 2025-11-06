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
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="text-gray-700 font-semibold text-lg">
          Paste Contract Text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your contract text here..."
          className="w-full h-64 p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 resize-none"
        />
        <div className="flex justify-between items-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 active:scale-95 transition disabled:bg-gray-400"
          >
            {loading ? "Evaluating..." : "Evaluate Contract"}
          </button>
          <button
            type="button"
            onClick={() => {
              setText("");
              setResult(null);
              setError(null);
            }}
            className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Clear
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-200">
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div className="mt-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">
            🧾 Evaluation Result
          </h2>
          <p className="text-gray-700 mb-4">
            <strong>Average Risk Score:</strong>{" "}
            <span
              className={`font-bold ${
                result.average_risk_score > 2
                  ? "text-red-600"
                  : result.average_risk_score > 1
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}
            >
              {result.average_risk_score}
            </span>
          </p>

          <div className="space-y-3">
            {result.details && result.details.length ? (
              result.details.map((d, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-white border hover:shadow transition"
                >
                  <p>
                    <strong>Clause:</strong>{" "}
                    <span className="text-gray-700">{d.sentence}</span>
                  </p>
                  <p>
                    <strong>Category:</strong>{" "}
                    <span className="text-blue-600">{d.matched_category}</span>
                  </p>
                  <p>
                    <strong>Risk Level:</strong>{" "}
                    <span
                      className={`font-semibold ${
                        d.risk_level === "High"
                          ? "text-red-600"
                          : d.risk_level === "Medium"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {d.risk_level}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Similarity: {d.similarity_score}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No clause matches found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
