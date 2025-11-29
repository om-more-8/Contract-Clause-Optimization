import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const signInEmail = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      navigate("/");  
    }
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "http://localhost:5173/" }
    });

    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6"
      style={{
        background:
          "linear-gradient(135deg, #e8f1ff 0%, #d5e8ff 20%, #c0dcff 40%, #8cc3ff 60%, #5495ff 80%, #1e73ff 100%)",
      }}
    >
      {/* --- login card --- */}
      <div
        className="w-full max-w-xl p-10 rounded-3xl"
        style={{
          background: "rgba(255, 255, 255, 0.22)",
          border: "2px solid rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(18px)",
          boxShadow: "0 8px 35px rgba(0,0,0,0.15)",
        }}
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-900 tracking-wide">
          Welcome Back
        </h2>

        {/* Email */}
        <input
          type="email"
          placeholder="Email address"
          className="w-full px-4 py-3 rounded-lg bg-white/60 border border-white/40 text-gray-800 focus:ring-2 focus:ring-blue-400 outline-none mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <div className="relative mb-6">
          <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg bg-white/60 border border-white/40 text-gray-800 focus:ring-2 focus:ring-blue-400 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="absolute right-4 top-3 cursor-pointer select-none text-blue-700"
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? "Hide" : "Show"}
          </span>
        </div>

        {/* Login button */}
        <button
          onClick={signInEmail}
          className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all duration-200"
        >
          Login
        </button>

        <div className="text-center text-gray-700 my-5">or</div>

        {/* Google OAuth */}
        <button
          onClick={signInWithGoogle}
          className="w-full py-3 rounded-lg border border-blue-300 bg-white/40 text-blue-700 font-semibold hover:bg-blue-100/50 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="text-center mt-6 text-gray-800">
          Don't have an account?
          <Link to="/register" className="ml-2 text-blue-700 font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
