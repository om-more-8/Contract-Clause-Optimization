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
    <div className="pt-24 px-6 min-h-screen"
  >

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

              {/* Records Section */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="h-20 bg-white/40 backdrop-blur-md animate-pulse rounded-xl border border-white/30 shadow"
              />
            ))}
          </div>
        ) : (
          paginated.map((row) => (
            <motion.div
              key={row.idx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl mb-4 shadow-md border border-white/30 
                        bg-white/20 backdrop-blur-xl hover:bg-white/30 transition-all"
            >
              <div className="font-semibold text-lg text-gray-900 drop-shadow">
                {row.name || "Untitled Contract"}
              </div>

              <div className="text-sm mt-1">
                Risk Level:{" "}
                <span
                  className={`font-bold ${
                    row.level === "Low"
                      ? "text-green-600"
                      : row.level === "Medium"
                      ? "text-yellow-500"
                      : "text-red-600"
                  }`}
                >
                  {row.level}
                </span>
              </div>

              <div className="text-xs text-gray-700 mt-1">
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
            className="px-4 py-2 rounded-xl bg-white/30 backdrop-blur-md border border-white/20
                      hover:bg-white/40 disabled:opacity-40"
          >
            Prev
          </button>

          <button
            disabled={page * PAGE_SIZE >= filtered.length}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl bg-white/30 backdrop-blur-md border border-white/20
                      hover:bg-white/40 disabled:opacity-40"
          >
            Next
          </button>
        </div>


      
      </div>
   
  );
}
