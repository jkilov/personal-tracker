import { Navigate } from "react-router";

import Dashboard from "../pages/Dashboard";

interface Props {
  isAuthenticated: boolean;
}

const ProtectedRoutes = ({ isAuthenticated }: Props) => {
  if (isAuthenticated) {
    return <Dashboard />;
  } else {
    return <Navigate to="/sign-in" replace />;
  }
};

export default ProtectedRoutes;
