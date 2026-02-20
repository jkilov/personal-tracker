import { signUpUser } from "../utils/supabase-auth";
import { type Dispatch, useState, type SetStateAction } from "react";

const signUpConfig = [
  {
    key: "email",
    label: "Enter your email address",
    type: "email",
    placeholder: "example@example.com",
  },
  {
    key: "password",
    label: "Create your password",
    type: "password",
    placeholder: "Password1234!",
  },
];

const SignUp = () => {
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
      <form onSubmit={handleSubmit}>
        {signUpConfig.map((input) => (
          <div key={input.key}>
            <span>{input.label}</span>
            <input
              type={input.type}
              placeholder={input.placeholder}
              required
              value={valConfig[input.key]}
              onChange={(e) => {
                setterConfig[input.key](e.target.value);
              }}
            />
          </div>
        ))}
        <button type="submit">Create</button>
      </form>

      <br />
      <span>{signUpMessage}</span>
    </div>
  );
};

export default SignUp;
