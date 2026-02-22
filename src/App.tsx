import { useEffect, useState } from "react";
import "./App.css";
import SignIn from "./pages/SignIn";
import { Route, Routes } from "react-router";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { authenticationCheck } from "./utils/supabase-auth";
import SignUp from "./pages/SignUp";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const subscription = authenticationCheck((session) =>
      setIsAuthenticated(!!session)
    );

    console.log("auth: ", isAuthenticated);
    //why is this showing false but my login logic is working fine - eg when user logged in they sees  dashboard, when they are not they are shown sign in

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<ProtectedRoutes isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/sign-in"
          element={<SignIn isAuthenticated={isAuthenticated} />}
        />
        <Route path="/sign-up" element={<SignUp />} />
      </Routes>
    </>
  );
}

export default App;
