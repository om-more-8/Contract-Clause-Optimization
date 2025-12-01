import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import ContractEvaluator from "./components/ContractEvaluator";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import ParticleBackground from "./components/ParticleBackground";

import useSupabaseSession from "./hooks/useSupabaseSession";  // ✅ NEW

export default function App() {
  const session = useSupabaseSession();
  const user = session?.user ?? null;

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background:
          "linear-gradient(135deg, #f0f7ff 0%, #dfefff 20%, #c5e3ff 40%, #9ac9ff 60%, #6aa8ff 80%, #387fff 100%)",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
      }}
    >
      <ParticleBackground
        colorPrimary="60,120,255"
        colorAccent="100,200,255"
        density={0.0006}
      />

      <Navbar user={user} />  {/* pass user */}

      <div className="pt-24 px-4 md:px-10 max-w-7xl mx-auto">
        <Routes>
          {/* Redirect logged-in user */}
          <Route
        path="/"
        element={user ? <Navigate to="/evaluate" /> : <Home />}
      />

          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Evaluation */}
          <Route path="/evaluate" element={<ContractEvaluator />} />

          {/* Auth-required routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute user={user}>
                <History />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
