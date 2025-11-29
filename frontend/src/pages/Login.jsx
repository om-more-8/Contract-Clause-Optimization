import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Github, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleEmailLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      navigate("/");
    }
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4">

      {/* Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md rounded-2xl p-8 backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(0,255,255,0.2)]"
      >
        {/* Neon glowing border ring */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/40 via-purple-500/40 to-fuchsia-500/40 blur-xl -z-10"></div>

        <h2 className="text-3xl font-bold text-center mb-6">
          Welcome Back ✨
        </h2>

        {error && (
          <p className="text-red-400 text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-300 w-5 h-5" />
            <input
              type="email"
              required
              className="w-full bg-white/10 p-3 pl-10 rounded-xl outline-none border border-white/20 text-white placeholder-gray-300 focus:border-cyan-400 transition"
              placeholder="Email address"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-300 w-5 h-5" />
            <input
              type={showPass ? "text" : "password"}
              required
              className="w-full bg-white/10 p-3 pl-10 rounded-xl outline-none border border-white/20 text-white placeholder-gray-300 focus:border-cyan-400 transition"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-3 text-gray-300 cursor-pointer"
            >
              {showPass ? <EyeOff /> : <Eye />}
            </span>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white py-3 mt-2 rounded-xl font-semibold shadow-lg hover:opacity-90 transition flex justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Log In"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 text-center text-gray-300">— or —</div>

        {/* Google Auth */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-lg py-3 rounded-xl transition"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" />
          <span>Continue with Google</span>
        </button>

        {/* Footer */}
        <p className="mt-6 text-center text-gray-300">
          Don’t have an account?{" "}
          <Link to="/register" className="text-cyan-400 hover:underline">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
