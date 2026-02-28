import { useEffect, useState } from "react";
import "./App.css";
import SignIn from "./pages/SignIn";
import { Route, Routes } from "react-router";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { authenticationCheck } from "./utils/supabase/auth-supabase";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import SessionModal from "./components/SessionModal";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const subscription = authenticationCheck((session) => {
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    console.log("auth: ", isAuthenticated);

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Routes>
        <Route element={<ProtectedRoutes isAuthenticated={isAuthenticated} />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route
          path="/"
          element={<SignIn isAuthenticated={isAuthenticated} />}
        />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/modal/:sessionId" element={<SessionModal />} />
      </Routes>
    </>
  );
}

export default App;
