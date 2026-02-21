import { useState } from "react";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import type { AuthResponse, User } from "@supabase/supabase-js";
import { Route, Routes } from "react-router";
import ProtectedRoutes from "./components/ProtectedRoutes";

function App() {
  const [userAuthDetails, setUserAuthDetails] = useState<any>();

  const handleUserAuth = (data: AuthResponse["data"]) => {
    setUserAuthDetails(data);
  };

  console.log("app: ", userAuthDetails);

  return (
    <>
      <Routes>
        <Route
          element={<ProtectedRoutes userAuthDetails={userAuthDetails} />}
        />
        <Route path="/" element={<SignIn handleUserAuth={handleUserAuth} />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}

export default App;
