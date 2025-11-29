// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session ?? null);
      setIsLoading(false);
    }

    load();

    // Listen for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  // 🔥 If no session → redirect to /login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // If logged in → allow access
  return children;
}
