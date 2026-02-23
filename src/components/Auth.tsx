import type { AuthValues } from "../pages/SignUp";

type authConfigType = {
  key: keyof AuthValues;
  label: string;
  type: string;
  form: string;
};

const authConfig: authConfigType[] = [
  {
    key: "email",
    label: "Enter your email",
    type: "email",
    form: "signIn",
  },
  {
    key: "password",
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
    key: "email",
    label: "Enter your email",
    type: "email",
    form: "signUp",
  },
  {
    key: "password",
    label: "Enter your password",
    type: "password",
    form: "signUp",
  },
];

interface Props {
  values: AuthValues;
  signUpMessage: string;
  onChange: (inputKey: string, value: string) => void;
  handleSubmit: (e: React.SubmitEvent) => void;
  formKey: string;
  buttonCTA: string;
}

const Auth = ({
  onChange,
  handleSubmit,
  signUpMessage,
  formKey,
  buttonCTA,
  values,
}: Props) => {
  //i thought of creating one state object to hold all values but thought only necessary for bigger multi input forms not just two inputs

  const updatedArr = authConfig.filter((input) => input.form === formKey);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {updatedArr.map((input) => (
          <div key={input.key}>
            <span>{input.label}</span>
            <input
              type={input.type}
              value={values[input.key] as keyof AuthValues}
              onChange={(e) => onChange(input.key, e.target.value)}
              required
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
