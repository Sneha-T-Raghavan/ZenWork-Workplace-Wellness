import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();

  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContent);

  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setcPassword] = useState("");
  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();

      axios.defaults.withCredentials = true;

      if (state === "Sign Up") {
        const { data } = await axios.post(backendUrl + "/api/auth/register", {
          name,
          email,
          password,
          cpassword
        });

        if (data.success) {
          setIsLoggedin(true);
          getUserData();
          navigate("/");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/auth/login", {
          email,
          password,
        });

        if (data.success) {
          setIsLoggedin(true);
          getUserData();
          navigate("/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div
      className='flex flex-col items-center justify-center min-h-screen bg-[url("/bg_img.png")] bg-cover bg-center'
    >
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="absolute 
      left-5 sm:left-20 top-5 w-28 sm:32 cursor-pointer"
      />
      <div
        className="bg-[#2a4192] p-10 rounded-lg shadow-lg w-full sm:w-96 
  text-white text-sm"
      >
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {state === "Sign Up" ? "Join ZenWork!" : "Welcome Back to ZenWork"}
        </h2>
        <p className="text-center text-sm mb-6">
          {state === "Sign Up"
            ? "A platform dedicated to your workplace wellbeing and productivity"
            : "Continue your wellness journey!"}
        </p>

        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-md bg-[#3a52b3]">
              <img src={assets.person_icon} alt="" />
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="bg-transparent outline-none text-white placeholder-white"
                type="text"
                placeholder="Full Name"
                required
              />
            </div>
          )}

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-md bg-[#3a52b3]">
            <img src={assets.mail_icon} alt="" />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="bg-transparent outline-none text-white placeholder-white"
              type="email"
              placeholder="Email ID"
              required
            />
          </div>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-md bg-[#3a52b3]">
            <img src={assets.lock_icon} alt="" />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="bg-transparent outline-none text-white placeholder-white"
              type="password"
              placeholder="Password"
              required
            />
          </div>
          {state === "Sign Up" && (
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-md bg-[#3a52b3]">
            <img src={assets.lock_icon} alt="" />
            <input
              onChange={(e) => setcPassword(e.target.value)}
              value={cpassword}
              className="bg-transparent outline-none text-white placeholder-white"
              type="password"
              placeholder="Confirm Password"
              required
            />
          </div>
          )}

          <p
            onClick={() => navigate("/reset-password")}
            className="mb-4 text-white cursor-pointer"
          >
            Forgot password?
          </p>
          <button className="w-full py-2.5 rounded-md bg-gradient-to-r from-[#1a2f7a] to-[#2a4192] text-white">
            {" "}
            {state}
          </button>
        </form>
        {state === "Sign Up" ? (
          <p className="text-white text-center text-xs mt-4">
            Already have an account?{" "}
            <span
              onClick={() => setState("Login")}
              className="text-white cursor-pointer underline"
            >
              Login here
            </span>
          </p>
        ) : (
          <p className="text-white text-center text-xs mt-4">
            Don't have an account?{" "}
            <span
              onClick={() => setState("Sign Up")}
              className="text-white cursor-pointer underline"
            >
              Sign up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;