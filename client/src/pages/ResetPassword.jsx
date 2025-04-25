import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const {backendUrl} = useContext(AppContent)
  axios.defaults.withCredentials = true;

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newcPassword, setNewcPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState("");
  const [otp, setOtp] = useState(0);
  const [isOtpSubmited, setIsOtpSubmitted] = useState(false);

  const inputRefs = React.useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) inputRefs.current[index].value = char;
    });
  };

  const onSubmitEmail = async(e) => {
    e.preventDefault();
    try {
      const {data} = await axios.post(backendUrl + '/api/auth/send-reset-otp', {email})
      data.success ? toast.success(data.message) : toast.error(data.message)
      data.success && setIsEmailSent(true);
    } catch (error) {
      toast.error(error.message)
    }
  }

  const onSubmitOtp = async(e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map(e => e.value)
    setOtp(otpArray.join(''))
    setIsOtpSubmitted(true)
  }

  const onSubmitNewPassword = async(e) => {
    e.preventDefault();
    try {
      const {data} = await axios.post(backendUrl + '/api/auth/reset-password',
      {email, otp, newPassword, newcPassword})
      data.success ? toast.success(data.message) : toast.error(data.message)
      data.success && navigate('/login')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-[url("/bg_img.png")] bg-cover bg-center'>
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      {/* Enter email id */}
      {!isEmailSent && (
        <form onSubmit={onSubmitEmail} className="bg-[#2a4192] p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset Password
          </h1>
          <p className="text-center mb-6 text-white">
            Enter your registered email address
          </p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#3a52b3]">
            <img src={assets.mail_icon} alt="" className="w-3 h-3" />
            <input
              type="email"
              placeholder="Email ID"
              className="bg-transparent outline-none text-white placeholder-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="w-full text-white py-2.5 rounded-full bg-gradient-to-r from-[#1a2f7a] to-[#2a4192] mt-3">
            Submit
          </button>
        </form>
      )}

      {/* OTP form */}
      {!isOtpSubmited && isEmailSent && (
        <form onSubmit={onSubmitOtp} className="bg-[#2a4192] p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Verify Your Identity
          </h1>
          <p className="text-center mb-6 text-white">
            Enter the 6-digit verification code sent to your email
          </p>
          <div className="flex justify-between mb-8" onPaste={handlePaste}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  type="text"
                  maxLength="1"
                  key={index}
                  required
                  className="w-12 h-12 bg-[#3a52b3] text-white text-center text-xl rounded-md"
                  ref={(e) => (inputRefs.current[index] = e)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
          </div>
          <button className="w-full text-white py-2.5 rounded-full bg-gradient-to-r from-[#1a2f7a] to-[#2a4192] mt-3">
            Verify
          </button>
        </form>
      )}

      {/* New password form */}
      {isOtpSubmited && isEmailSent && (
        <form onSubmit={onSubmitNewPassword} className="bg-[#2a4192] p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Create New Password
          </h1>
          <p className="text-center mb-6 text-white">
            Enter your new secure password
          </p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#3a52b3]">
            <img src={assets.lock_icon} alt="" className="w-3 h-3" />
            <input
              type="password"
              placeholder="New Password"
              className="bg-transparent outline-none text-white placeholder-white"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#3a52b3]">
            <img src={assets.lock_icon} alt="" className="w-3 h-3" />
            <input
              type="password"
              placeholder="Confirm Password"
              className="bg-transparent outline-none text-white placeholder-white"
              value={newcPassword}
              onChange={(e) => setNewcPassword(e.target.value)}
              required
            />
          </div>
          <button className="w-full text-white py-2.5 rounded-full bg-gradient-to-r from-[#1a2f7a] to-[#2a4192] mt-3">
            Reset Password
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;