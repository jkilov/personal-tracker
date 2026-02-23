import { useEffect, useState } from "react";
import Auth from "../components/Auth";
import { signInUser } from "../utils/supabase/auth-supabase";
import { useNavigate } from "react-router";
import type { AuthValues } from "./SignUp";

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

  const [values, setValues] = useState<AuthValues>({
    email: "",
    password: "",
  });

  const handleChange = (inputKey: string, value: string) => {
    setValues((prev) => ({ ...prev, [inputKey]: value }));
  };

  const handleSignIn = async (e: React.SubmitEvent) => {
    e.preventDefault();

    const { data, error } = await signInUser(values.email, values.password);

    if (error) {
      setSignUpMessage("failure");
    } else {
      // handleUserAuth(data);
      setSignUpMessage("success");
      setValues({ email: "", password: "" });
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
        buttonCTA="Sign In"
      />
      <button onClick={handleCreateAccount}>Create Account</button>
    </div>
  );
};

export default SignIn;
