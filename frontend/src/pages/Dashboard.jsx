import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#22c55e", "#eab308", "#ef4444"]; // green, yellow, red

  async function loadStats() {
    setLoading(true);

    const { data, error } = await supabase
      .from("contracts")
      .select("level");

    if (!data) return;

    const counts = { Low: 0, Medium: 0, High: 0 };
    data.forEach((row) => {
      if (row.level) counts[row.level] += 1;
    });

    const chartData = [
      { name: "Low Risk", value: counts.Low },
      { name: "Medium Risk", value: counts.Medium },
      { name: "High Risk", value: counts.High },
    ];

    setStats(chartData);
    setLoading(false);
  }

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="pt-24 px-6 min-h-screen">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-6"
      >
        Dashboard
      </motion.h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin w-12 h-12 text-blue-500" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white p-6 rounded-xl shadow border"
          style={{
    background: "linear-gradient(135deg, #f0f7ff 0%, #dfefff 20%, #c5e3ff 40%, #9ac9ff 60%, #6aa8ff 80%, #387fff 100%)"
  }}
        >
          <h2 className="text-xl font-semibold mb-4">
            Risk Category Distribution
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats}
                cx="50%"
                cy="50%"
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {stats.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
