import type { SignInConfigType } from "../pages/SignIn";

const signUpConfig = [
  {
    key: "email",
    type: "email",
  },
  {
    key: "password",
    type: "password",
  },
];

interface Props {
  emailLabel: string;
  passwordLabel: string;
  emailVal: string;
  passwordVal: string;
  signUpMessage: string;
  onChange: (inputKey: string, value: string) => void;
  handleSubmit: (e: React.SubmitEvent) => void;
  signInConfig: SignInConfigType[];
}

const Auth = ({
  emailLabel,
  passwordLabel,
  onChange,
  handleSubmit,
  emailVal,
  passwordVal,
  signUpMessage,
  signInConfig,
}: //⬜️ here : i have added yhe prop - i need to then add the fact its option and then render one or the other based on whats been fed to this child component.
Props) => {
  //i thought of creating one state object to hold all values but thought only necessary for bigger multi input forms not just two inputs

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {signUpConfig.map((input) => (
          <div key={input.key}>
            <span>{input.key === "email" ? emailLabel : passwordLabel}</span>
            {/* //⛔️come back and fix above it is brittle⛔️ */}
            <input
              type={input.type}
              required
              //⛔️come back and fix below it is brittle⛔️
              value={input.key === "email" ? emailVal : passwordVal}
              onChange={(e) => onChange(input.key, e.target.value)}
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

export default Auth;
