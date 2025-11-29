import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import ContractEvaluator from "./components/ContractEvaluator";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";

export default function App() {
  return (
    <div className="min-h-screen text-gray-900 relative">

      {/* HOLOGRAPHIC BACKGROUND */}
      <div className="absolute inset-0 holo-bg bg-gradient-to-br from-blue-50 via-indigo-100 to-blue-200 -z-10" />

      {/* NAVBAR */}
      <Navbar />

      {/* PAGE CONTENT */}
      <div className="pt-28 px-4 pb-10">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/evaluate"
            element={
              <ProtectedRoute>
                <ContractEvaluator />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </div>
  );
}
