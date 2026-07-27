import { useEffect, useState } from "react";
import "./App.css";
import SignIn from "./pages/SignIn";
import { Navigate, Route, Routes } from "react-router";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { authenticationCheck } from "./utils/supabase/auth-supabase";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard/Dashboard";
import type { Session } from "@supabase/supabase-js";
import CurrentSession from "./pages/CurrentSession/CurrentSession";
import { AuthContext } from "./auth-context";
import ErrorBoundary from "./components/Error/ErrorBoundary";
import { Toaster } from "sonner";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionDetails, setSessionDetails] = useState<Session>();

  useEffect(() => {
    const subscription = authenticationCheck((session) => {
      setIsAuthenticated(!!session);
      setSessionDetails(session ?? undefined);

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={sessionDetails ?? null}>
        <Toaster richColors />
        <Routes>
          <Route
            element={<ProtectedRoutes isAuthenticated={isAuthenticated} />}
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/session/:sessionId" element={<CurrentSession />} />
          </Route>
          <Route
            path="/"
            element={<SignIn isAuthenticated={isAuthenticated} />}
          />
          <Route
            path="/sign-up"
            element={<SignUp isAuthenticated={isAuthenticated} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}

export default App;
