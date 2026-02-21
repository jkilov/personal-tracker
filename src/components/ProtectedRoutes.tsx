import type { User } from "@supabase/supabase-js";
import { Navigate } from "react-router";
import { Outlet } from "react-router";

interface Props {
  userAuthDetails: User;
}

const ProtectedRoutes = ({ userAuthDetails }: Props) => {
  const isAuthenticated =
    userAuthDetails.role === "authenticated" ? true : false;
  return userAuthDetails && isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
};

export default ProtectedRoutes;
