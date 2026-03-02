import { useEffect, useState } from "react";
import Auth from "../components/Auth";
import { signInUser } from "../utils/supabase/auth-supabase";
import { useNavigate } from "react-router";
import type { AuthValues } from "./SignUp";
import { Spinner } from "react-bootstrap";
import { Toaster, toast } from "sonner";
import "../App.css";

interface Props {
  isAuthenticated: boolean;
}

export type SignInConfigType = {
  key: string;
  type: string;
};

const SignIn = ({ isAuthenticated }: Props) => {
  let navigate = useNavigate();

  const [signUpMessage, setSignUpMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [values, setValues] = useState<AuthValues>({
    email: "",
    password: "",
  });

  const handleChange = (inputKey: string, value: string) => {
    setValues((prev) => ({ ...prev, [inputKey]: value }));
  };

  const handleSignIn = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await signInUser(values.email, values.password);

    if (error) {
      toast.error(
        <div className="toast">
          <span>
            <strong>There was an error</strong>.
          </span>
          <span>{error.message}</span>
        </div>,
        { style: { background: "var(--toast-error)" } }
      );
      setIsLoading(false);
    } else {
      // handleUserAuth(data);
      setSignUpMessage("success");
      setValues({ email: "", password: "" });
      setIsLoading(false);
      navigate("/dashboard");
    }
  };

  const handleCreateAccount = () => {
    navigate("/sign-up");
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div>
      <h3>Sign In</h3>
      <Auth
        onChange={handleChange}
        values={values}
        handleSubmit={handleSignIn}
        signUpMessage={signUpMessage}
        formKey="signIn"
        buttonCTA={"Sign In"}
      />
      <Toaster />
      <button onClick={handleCreateAccount}>Create Account</button>
    </div>
  );
};

export default SignIn;
