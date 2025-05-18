import React, { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { signupUser } from "../../http"; 
import { Link } from "react-router-dom";

/**
 * Tracks which fields have been edited for validation feedback.
 */
type DidEdit = {
  name: boolean;
  email: boolean;
  password: boolean;
};

/**
 * Props for the signup mutation.
 */
type SignupProps = {
  name: string;
  email: string;
  password: string;
};

/**
 * Signup component renders a registration form with validation.
 * Handles user input, validation, and submission to the signup API.
 * On successful signup, navigates to the home page.
 *
 * @component
 * @returns {JSX.Element} The rendered signup form.
 */
const Signup: React.FC = () =>{
      const [name, setName] = useState<string>("");
      const [email, setEmail] = useState<string>("");
      const [password, setPassword] = useState<string>("");
      const [didEdit,setDidEdit] = useState<DidEdit>({
        name: false,
        email: false,
        password: false,
      });
      const navigate = useNavigate();
      
      /**
       * Handles the signup mutation and navigation on success.
       */
      const { mutate, isPending, error } = useMutation<any,Error,SignupProps>({
        mutationFn: signupUser,
        onSuccess: (data) => {
          navigate("/"); 
        }
      });

      /**
       * Handles form submission, performs validation, and triggers signup mutation.
       * @param {React.FormEvent} e - The form submission event.
       */
      const handleSubmit = (e:React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password) {
          setDidEdit({
            name: true,
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
        
        mutate({ name, email, password });
      };

      /**
       * Handles blur event for input fields to trigger validation feedback.
       * @param {string} identifier - The field identifier ("name", "email", or "password").
       */
      const handleBlur = (identifier:string) => {
        setDidEdit((prev) => ({ ...prev, [identifier]: true }));
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <form
            onSubmit={handleSubmit}
            className="p-6 bg-white rounded shadow-md w-80"
          >
            <h2 className="text-2xl mb-4 text-center">Sign Up</h2>
            {error && <p className="text-red-500 mb-3">{error.message}</p>}
            <input
              type="text"
              placeholder="Name"
              className="w-full p-2 mb-3 border rounded"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {setName(e.target.value)
              setDidEdit((prev) => ({ ...prev, name: false }))}}
              onBlur={() => handleBlur("name")}
              required
            />
            {didEdit.name && !name && <p className="text-red-500 mb-3">Enter your name</p>}
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 mb-3 border rounded"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {setEmail(e.target.value)
              setDidEdit((prev) => ({ ...prev, email: false }))}
              }
              onBlur={() => handleBlur("email")}
              required
            />
            {didEdit.email && !email.includes('@') &&<p className="text-red-500 mb-3">Enter a valid email</p>}
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 mb-3 border rounded"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {setPassword(e.target.value)
              setDidEdit((prev) => ({ ...prev, password: false }))}
              }
              onBlur={() => handleBlur("password")}
              minLength={6}
              required
            />
            {didEdit.password && password.length<6 && <p className="text-red-500 mb-3">Password must be at least 6 charachters</p>}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded cursor-pointer hover:bg-blue-600"
              disabled={isPending}
            >
              {isPending ? "Signing Up..." : "SignUp"}
            </button>
            <p className="mt-3 text-center text-sm">
              Already have an account?{" "}
              <Link to="/" className="text-blue-500 hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      );
    };

export default Signup;
