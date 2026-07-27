import Auth from "../components/Auth";
import { signUpUser } from "../utils/supabase/auth-supabase";
import { createUserData } from "../utils/supabase/user.ts";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useNavigate } from "react-router";

import "../App.css";

interface Props {
  isAuthenticated: boolean;
}

export type AuthValues = {
  fName?: string;
  lName?: string;
  email: string;
  password: string;
};

const SignUp = ({ isAuthenticated }: Props) => {
  const navigate = useNavigate();

  const [values, setValues] = useState<AuthValues>({
    fName: "",
    lName: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (inputKey: string, value: string) => {
    setValues((prev) => ({ ...prev, [inputKey]: value }));
  };

  const handleAuthSignUp = async () => {
    const { data, error } = await signUpUser(values.email, values.password);
    if (error) {
      toast.error(error.message, {
        style: {
          background: "var(--error)",
        },
      });
      return;
    }
    const userId = data.user?.id;
    const { error: userError } = await createUserData(
      userId!,
      values.fName!,
      values.lName!,
      values.email
    );
    if (userError) {
      toast.error("Failed to create user profile");
      return;
    }

    toast.success("Successfully created account", {
      style: { background: "var(--success)" },
    });
    setValues({ fName: "", lName: "", email: "", password: "" });
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    handleAuthSignUp();
  };

  const handleSignInAccount = () => {
    navigate("/");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h3>Create an account</h3>
        <Auth
          onChange={handleChange}
          values={values}
          handleSubmit={handleSubmit}
          formKey="signUp"
          buttonCTA="Create Account"
        />
        <button className="auth-secondary-btn" onClick={handleSignInAccount}>
          Sign in
        </button>
      </div>
    </div>
  );
};

export default SignUp;
