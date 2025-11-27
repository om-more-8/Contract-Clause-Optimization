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

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  // BLOCK access if user is not logged in
  console.log("Session = ", session);
  return children;


  return children;
}
