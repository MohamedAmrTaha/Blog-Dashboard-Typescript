import React from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../../http";
import { login } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

/**
 * Tracks which fields have been edited for validation feedback.
 */
type DidEdit = {
  email: boolean;
  password: boolean;
};

/**
 * Props for the login mutation.
 */
type LoginProps = {
  email: string;
  password: string;
};

/**
 * Login component renders a login form with validation.
 * Handles user input, validation, and submission to the login API.
 * On successful login, dispatches the login action and navigates to the dashboard.
 *
 * @component
 * @returns {JSX.Element} The rendered login form.
 */
const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [didEdit, setDidEdit] = useState<DidEdit>({
    email: false,
    password: false,
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /**
   * Handles the login mutation and navigation on success.
   */
  const { mutate, isPending, error } = useMutation<any, Error, LoginProps>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      dispatch(login(data));
      navigate("/dashboard");
    },
  });

  /**
   * Handles form submission, performs validation, and triggers login mutation.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setDidEdit({
        email: true,
        password: true,
      });
      return;
    }
    if (!email.includes("@")) {
      setDidEdit((prev) => ({ ...prev, email: true }));
      return;
    }
    if (password.length < 6) {
      setDidEdit((prev) => ({ ...prev, password: true }));
      return;
    }
    mutate({ email, password });
  };

  /**
   * Handles blur event for input fields to trigger validation feedback.
   * @param {string} identifier - The field identifier ("email" or "password").
   */
  const handleBlur = (identifier: string) => {
    setDidEdit((prev) => ({ ...prev, [identifier]: true }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow-md">
        <h2 className="text-2xl mb-4 text-center">Login</h2>
        {error && <p className="text-red-500 mb-3">{error.message}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 border rounded"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setEmail(e.target.value);
            setDidEdit((prev) => ({ ...prev, email: false }));
          }}
          onBlur={() => handleBlur("email")}
          required
        />
        {didEdit.email && !email.includes("@") && (
          <p className="text-red-500 mb-3">Enter a valid email</p>
        )}
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-3 border rounded"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setPassword(e.target.value);
            setDidEdit((prev) => ({ ...prev, password: false }));
          }}
          onBlur={() => handleBlur("password")}
          minLength={6}
          required
        />
        {didEdit.password && password.length < 6 && (
          <p className="text-red-500 mb-3">
            Password must be at least 6 charachters
          </p>
        )}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded cursor-pointer hover:bg-blue-600"
          disabled={isPending}
        >
          {isPending ? "Logingin..." : "Login"}
        </button>
        <p className="mt-3 text-center text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            signup
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
