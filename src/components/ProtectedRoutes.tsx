import { Navigate, Outlet } from "react-router";

interface Props {
  isAuthenticated: boolean;
}

const ProtectedRoutes = ({ isAuthenticated }: Props) => {
  if (isAuthenticated) {
    return <Outlet />;
  } else {
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoutes;
