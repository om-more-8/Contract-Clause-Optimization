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
    <div
      className="min-h-screen w-full"
      style={{
        background: "linear-gradient(135deg, #f0f7ff 0%, #dfefff 20%, #c5e3ff 40%, #9ac9ff 60%, #6aa8ff 80%, #387fff 100%)",
        backgroundAttachment: "fixed",   // ⭐ Prevents scroll white gaps
        backgroundSize: "cover",
      }}
    >
      <Navbar />

      <div className="pt-24 px-4 md:px-10 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/evaluate" element={<ContractEvaluator />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
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
        </Routes>
      </div>
    </div>
  );
}
