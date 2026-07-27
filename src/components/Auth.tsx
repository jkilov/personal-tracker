import type { AuthValues } from "../pages/SignUp";
import "./Auth.css";

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

  onChange: (inputKey: string, value: string) => void;
  handleSubmit: (e: React.SubmitEvent) => void;
  formKey: string;
  buttonCTA: React.ReactNode;
}

const Auth = ({
  onChange,
  handleSubmit,

  formKey,
  buttonCTA,
  values,
}: Props) => {
  const updatedArr = authConfig.filter((input) => input.form === formKey);

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {updatedArr.map((input) => (
        <div key={input.key} className="auth-field">
          <label htmlFor={`${input.form}-${input.key}`}>{input.label}</label>
          <input
            id={`${input.form}-${input.key}`}
            className="auth-input"
            type={input.type}
            value={values[input.key] as keyof AuthValues}
            onChange={(e) => onChange(input.key, e.target.value)}
            required
          />
        </div>
      ))}
      <button className="auth-submit" type="submit">
        {buttonCTA}
      </button>
    </form>
  );
};

export default Auth;
