import Auth from "../components/Auth";
import { signUpUser } from "../utils/supabase/auth-supabase";
import { createUserData } from "../utils/supabase/user.ts";
import { useState } from "react";
import { Toaster, toast } from "sonner";

import { useNavigate } from "react-router";

import "../App.css";

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

  const handleAuthSignUp = async () => {
    const { data, error } = await signUpUser(values.email, values.password);
    const userId = data.user?.id;
    if (error) {
      toast.error(error.message, {
        style: {
          background: "var(--toast-error)",
        },
      });
    } else {
      toast.success("Successfully created account", {
        style: { background: "var(--toast-success" },
      });
      const result = createUserData(
        userId!,
        values.fName!,
        values.lName!,
        values.email
      );
      setValues({ fName: "", lName: "", email: "", password: "" });
    }
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    handleAuthSignUp();
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
      <Toaster />
    </div>
  );
};

export default SignUp;
