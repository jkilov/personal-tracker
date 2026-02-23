import Auth from "../components/Auth";
import { signUpUser } from "../utils/supabase/auth-supabase";
import { useState } from "react";

import { useNavigate } from "react-router";

export type AuthValues = {
  fName?: string;
  lName?: string;
  email: string;
  password: string;
};

const SignUp = () => {
  const navigate = useNavigate();
  const [signUpMessage, setSignUpMessage] = useState("");

  const [values, setValues] = useState<AuthValues>({
    fName: "",
    lName: "",
    email: "",
    password: "",
  });

  const handleChange = (inputKey: string, value: string) => {
    setValues((prev) => ({ ...prev, [inputKey]: value }));
    console.log("type: ", inputKey, value);
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const { data, error } = await signUpUser(values.email, values.password);

    if (error) {
      setSignUpMessage("failure");
    } else {
      setSignUpMessage("success");
      setValues({ fName: "", lName: "", email: "", password: "" });
    }
  };

  const handleSignInAccount = () => {
    navigate("/");
  };

  return (
    <div>
      <h3>Create an account.</h3>
      <Auth
        onChange={handleChange}
        values={values}
        handleSubmit={handleSubmit}
        signUpMessage={signUpMessage}
        formKey="signUp"
        buttonCTA="Create Account"
      />
      <button onClick={handleSignInAccount}>Sign in</button>
    </div>
  );
};

export default SignUp;
