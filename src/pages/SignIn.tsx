import Auth from "../components/Auth";
import { signInUser } from "../utils/supabase-auth";
import { type Dispatch, useState, type SetStateAction } from "react";

const SignIn = () => {
  const [emailVal, setEmailVal] = useState<string>("");
  const [passwordVal, setPasswordVal] = useState<string>("");
  const [signUpMessage, setSignUpMessage] = useState("");

  //i thought of creating one state object to hold all values but thought only necessary for bigger multi input forms not just two inputs

  const valConfig: Record<string, string> = {
    email: emailVal,
    password: passwordVal,
  };

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
    const { error } = await signUpUser(emailVal, passwordVal);

    if (error) {
      setSignUpMessage("failure");
    } else {
      setSignUpMessage("success");
    }
  };

  return (
    <div>
      <h3>Sign In.</h3>
      <Auth
        emailLabel="Enter your email"
        passwordLabel="Enter your password"
        onChange={handleChange}
        emailVal={valConfig.emailVal}
        passwordVal={valConfig.passwordVal}
        handleSubmit={handleSubmit}
        signUpMessage={signUpMessage}
      />
    </div>
  );
};

export default SignIn;
