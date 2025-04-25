import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AppContent } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const { userData } = useContext(AppContent);
  return (
    <div className="flex flex-col items-center mt-20 px-4 text-center text-gray-800">
      <img src={assets.logo} alt="" className="w-36 h-36 rounded-xl mb-6" />
      <h1 className="flex items-center gap-2 text-3xl sm:text-3xl font-medium mb-2  text-blue-800">
        {" "}
        Hey {userData ? userData.name : `User`}!
        <img className="w-8 aspect-square" src={assets.hand_wave} alt="" />
      </h1>
      <h2 className="text-5xl font-extrabold text-blue-800 mb-4">
        Wellness Meets Productivity
      </h2>
      <p className="text-lg text-gray-700 max-w-xl mx-auto">
        Stay focused, stress-free, and productive with our AI-powered workplace
        wellness solutions.
      </p>
      <button onClick={()=> navigate('/')} className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700 transition duration-300">
        Get Started
      </button>
    </div>
  );
};

export default Header;
