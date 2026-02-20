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
}

const Auth = ({
  emailLabel,
  passwordLabel,
  onChange,
  handleSubmit,
  emailVal,
  passwordVal,
  signUpMessage,
}: Props) => {
  //i thought of creating one state object to hold all values but thought only necessary for bigger multi input forms not just two inputs

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {signUpConfig.map((input) => (
          <div key={input.key}>
            <span>{input.key === "email" ? emailLabel : passwordLabel}</span>
            <input
              type={input.type}
              required
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
