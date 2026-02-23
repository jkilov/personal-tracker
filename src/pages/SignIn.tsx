import Auth from "../components/Auth";
import { signInUser } from "../utils/supabase-auth";
import { type Dispatch, useState, type SetStateAction, useEffect } from "react";
import { useNavigate } from "react-router";

interface Props {
  isAuthenticated: boolean;
}

export type SignInConfigType = {
  key: string;
  type: string;
};

const SignIn = ({ isAuthenticated }: Props) => {
  let navigate = useNavigate();

  const [emailVal, setEmailVal] = useState<string>("");
  const [passwordVal, setPasswordVal] = useState<string>("");
  const [signUpMessage, setSignUpMessage] = useState("");

  const setterConfig: Record<string, Dispatch<SetStateAction<string>>> = {
    email: setEmailVal,
    password: setPasswordVal,
  };

  const handleChange = (inputKey: string, value: string) => {
    setterConfig[inputKey](value);
  };

  const handleSignIn = async (e: React.SubmitEvent) => {
    e.preventDefault();

    const { data, error } = await signInUser(emailVal, passwordVal);

    if (error) {
      setSignUpMessage("failure");
    } else {
      // handleUserAuth(data);
      setSignUpMessage("success");
      setEmailVal("");
      setPasswordVal("");
      navigate("/");
    }
  };

  const handleCreateAccount = () => {
    navigate("/sign-up");
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div>
      <h3>Sign In</h3>
      <Auth
        onChange={handleChange}
        emailVal={emailVal}
        passwordVal={passwordVal}
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
