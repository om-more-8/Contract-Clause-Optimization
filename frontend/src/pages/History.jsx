import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Loader2, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function History() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  async function loadHistory() {
    setLoading(true);

    const { data, error } = await supabase
      .from("contracts")
      .select()
      .order("created_at", { ascending: false });

    setRecords(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadHistory();
  }, []);

  // ------ Filtering ------
  const filtered = records.filter((rec) => {
    const matchesSearch =
      rec.name?.toLowerCase().includes(search.toLowerCase()) ||
      rec.text?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ? true : rec.level === filter;

    return matchesSearch && matchesFilter;
  });

  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">History</h1>

      {/* Search + Filter */}
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" />
          <input
            className="w-full pl-10 p-2 border rounded-lg"
            placeholder="Search contracts..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option>All</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>

      {/* Records */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="h-20 bg-gray-200 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : (
        paginated.map((row) => (
          <motion.div
            key={row.idx}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="border p-4 rounded-lg bg-white shadow mb-3"
          >
            <div className="font-semibold text-lg">{row.name}</div>
            <div className="text-sm text-gray-500">
              Risk Level:{" "}
              <span
                className={`font-bold ${
                  row.level === "Low"
                    ? "text-green-600"
                    : row.level === "Medium"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {row.level}
              </span>
            </div>
            <div className="text-gray-400 text-xs">
              {new Date(row.created_at).toLocaleString()}
            </div>
          </motion.div>
        ))
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-3">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 border rounded disabled:opacity-40"
        >
          Prev
        </button>
        <button
          disabled={page * PAGE_SIZE >= filtered.length}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 border rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
