type authConfigType = {
  key: string;
  label: string;
  type: string;
  form: string;
};

const authConfig: authConfigType[] = [
  {
    key: "email-signIn",
    label: "Enter your email",
    type: "email",
    form: "signIn",
  },
  {
    key: "password-signIn",
    label: "Enter your password",
    type: "password",
    form: "signIn",
  },
  { key: "fName", label: "Enter your name", type: "string", form: "signUp" },
  {
    key: "lName",
    label: "Enter your last name",
    type: "string",
    form: "signUp",
  },
  {
    key: "email-signUp",
    label: "Enter your email",
    type: "email",
    form: "signUp",
  },
  {
    key: "password-signUp",
    label: "Enter your password",
    type: "password",
    form: "signUp",
  },
];

interface Props {
  emailVal: string;
  passwordVal: string;
  signUpMessage: string;
  onChange: (inputKey: string, value: string) => void;
  handleSubmit: (e: React.SubmitEvent) => void;
  formKey: string;
  buttonCTA: string;
}

const Auth = ({
  onChange,
  handleSubmit,
  emailVal,
  passwordVal,
  signUpMessage,
  formKey,
  buttonCTA,
}: //⬜️ here : i have added yhe prop - i need to then add the fact its option and then render one or the other based on whats been fed to this child component.
Props) => {
  //i thought of creating one state object to hold all values but thought only necessary for bigger multi input forms not just two inputs

  const updatedArr = authConfig.filter((input) => input.form === formKey);

  console.log("UA", updatedArr);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {updatedArr.map((input) => (
          <div key={input.key}>
            <span>{input.label}</span>
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
        <button type="submit">{buttonCTA}</button>
      </form>

      <br />
      <span>{signUpMessage}</span>
    </div>
  );
};

export default Auth;
