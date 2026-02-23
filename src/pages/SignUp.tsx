import Auth from "../components/Auth";
import { signUpUser } from "../utils/supabase-auth";
import { type Dispatch, useState, type SetStateAction } from "react";

const SignUp = () => {
  const [emailVal, setEmailVal] = useState<string>("");
  const [passwordVal, setPasswordVal] = useState<string>("");
  const [signUpMessage, setSignUpMessage] = useState("");

  const setterConfig: Record<string, Dispatch<SetStateAction<string>>> = {
    email: setEmailVal,
    password: setPasswordVal,
  };

  const handleChange = (inputKey: string, value: string) => {
    setterConfig[inputKey](value);
    console.log("changing: ", inputKey);
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const { data, error } = await signUpUser(emailVal, passwordVal);

    if (error) {
      setSignUpMessage("failure");
    } else {
      setSignUpMessage("success");
      setEmailVal("");
      setPasswordVal("");
    }
  };

  return (
    <div>
      <h3>Create an account.</h3>
      <Auth
        onChange={handleChange}
        emailVal={emailVal}
        passwordVal={passwordVal}
        handleSubmit={handleSubmit}
        signUpMessage={signUpMessage}
        formKey="signUp"
        buttonCTA="Create Account"
      />
    </div>
  );
};

export default SignUp;
