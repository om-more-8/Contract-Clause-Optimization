import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function History() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      const { data: session } = await supabase.auth.getUser();
      const user = session?.user;

      if (!user) return;

      const { data } = await supabase
        .from("contracts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setRecords(data || []);
    };

    loadHistory();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-6"
      >
        Evaluation History
      </motion.h1>

      <div className="space-y-4">
        {records.length === 0 ? (
          <p className="text-gray-600">No evaluations yet.</p>
        ) : (
          records.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              className="p-5 bg-white shadow rounded-xl border flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <FileText className="text-blue-600" size={20} />
                  {item.name || "Contract"}
                </h3>
                <p className="text-gray-500 text-sm">
                  Evaluated on: {new Date(item.created_at).toLocaleString()}
                </p>
              </div>

              <div
                className={`px-4 py-2 rounded-full text-white font-semibold ${
                  item.risk_score < 1.5
                    ? "bg-green-500"
                    : item.risk_score < 2.3
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              >
                Risk: {item.risk_score}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
