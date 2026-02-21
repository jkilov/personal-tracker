import Auth from "../components/Auth";
import { signUpUser } from "../utils/supabase-auth";
import { type Dispatch, useState, type SetStateAction } from "react";

const SignUp = () => {
  const [emailVal, setEmailVal] = useState<string>("");
  const [passwordVal, setPasswordVal] = useState<string>("");
  const [signUpMessage, setSignUpMessage] = useState("");

  //i thought of creating one state object to hold all values but thought only necessary for bigger multi input forms not just two inputs

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

    if (error && data.user) {
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
        emailLabel="Add your Email"
        passwordLabel="Create a password"
        onChange={handleChange}
        emailVal={emailVal}
        passwordVal={passwordVal}
        handleSubmit={handleSubmit}
        signUpMessage={signUpMessage}
      />
    </div>
  );
};

export default SignUp;
