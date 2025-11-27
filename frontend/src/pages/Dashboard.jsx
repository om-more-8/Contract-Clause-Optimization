import { motion } from "framer-motion";
import { FileText, Clock, TrendingUp } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [summary, setSummary] = useState({ total: 0, avgRisk: 0 });

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: session } = await supabase.auth.getUser();
      const user = session?.user;
      if (!user) return;

      const { data } = await supabase
        .from("contracts")
        .select("risk_score")
        .eq("user_id", user.id);

      if (data?.length) {
        const total = data.length;
        const avgRisk =
          data.reduce((a, b) => a + (b.risk_score || 0), 0) / total;

        setSummary({ total, avgRisk: avgRisk.toFixed(2) });
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-6"
      >
        Dashboard
      </motion.h1>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Stat Card */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="p-6 bg-white shadow-lg rounded-xl border"
        >
          <FileText size={32} className="text-blue-600" />
          <h2 className="text-xl font-bold mt-2">Total Evaluations</h2>
          <p className="text-gray-600 text-2xl mt-1">{summary.total}</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="p-6 bg-white shadow-lg rounded-xl border"
        >
          <TrendingUp size={32} className="text-green-600" />
          <h2 className="text-xl font-bold mt-2">Average Risk Score</h2>
          <p className="text-gray-600 text-2xl mt-1">{summary.avgRisk}</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="p-6 bg-white shadow-lg rounded-xl border"
        >
          <Clock size={32} className="text-purple-600" />
          <h2 className="text-xl font-bold mt-2">Last Updated</h2>
          <p className="text-gray-600 mt-1">{new Date().toLocaleDateString()}</p>
        </motion.div>
      </div>
    </div>
  );
}
