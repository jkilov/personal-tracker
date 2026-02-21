import { useState } from "react";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import type { AuthResponse } from "@supabase/supabase-js";

function App() {
  const [user, setUser] = useState({});

  const handleUserAuth = (data: AuthResponse["data"]) => {
    setUser(data);
  };

  console.log("app: ", user);

  return (
    <>
      {/* <SignUp /> */}
      <SignIn handleUserAuth={handleUserAuth} />
      <Dashboard />
    </>
  );
}

export default App;
