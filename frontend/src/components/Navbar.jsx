// Navbar.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";
import { LogOut, User, FileText, Clock, Home } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="backdrop-blur-lg bg-white/40 shadow-md fixed top-0 left-0 w-full z-50"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          CogniClause
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-6">

          {/* Links */}
          <Link to="/" className="flex items-center gap-1 hover:text-blue-600 transition">
            <Home size={18} /> Home
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-1 hover:text-blue-600 transition"
          >
            <FileText size={18} /> Dashboard
          </Link>

          <Link
            to="/history"
            className="flex items-center gap-1 hover:text-blue-600 transition"
          >
            <Clock size={18} /> History
          </Link>

          {/* User Avatar + Logout */}
          {user ? (
            <div className="flex items-center gap-3">
              <img
                src={user.user_metadata?.avatar_url || "https://via.placeholder.com/40"}
                className="w-9 h-9 rounded-full border"
              />
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
