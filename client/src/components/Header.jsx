import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { AppContent } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

const Header = () => {
  const navigate = useNavigate();
  const { userData } = useContext(AppContent);
  const [openFAQ, setOpenFAQ] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const toggleFAQ = (idx) => {
    setOpenFAQ((prev) => (prev === idx ? null : idx));
  };

  const features = [
    ["AI Chatbot", "Offers emotional support and personalized feedback using natural language understanding."],
    ["Journaling Assistant", "Track your mood and thoughts with AI-powered sentiment analysis and gentle nudges."],
    ["Pixel Art Therapy", "Engage in calming color-by-pixel art activities during your breaks for relaxation."],
    ["Mindful Bingo", "Play wellness games that reward consistent self-care activities and break rituals."],
    ["Break Timer Quest", "Gamify your screen-free breaks and earn points by maintaining healthy streaks."],
    ["Calendar Integration", "Plan your breaks and reminders around your existing tasks with smart sync options."]
  ];

  const faqs = [
    ["How does ZenWork help with burnout?", "It combines reminders, mental health tools, and journaling to monitor and reduce early signs of burnout."],
    ["Is my data secure with ZenWork?", "Yes. We use encryption and privacy-focused practices to protect user information and journaling logs."],
    ["Can I personalize reminders and goals?", "Absolutely! ZenWork adapts to your rhythm and provides flexible scheduling for optimal wellness."],
    ["What makes ZenWork different from other wellness apps?", "ZenWork merges productivity tools with wellness features to build sustainable habits."],
    ["Can I use ZenWork during office hours?", "Yes! It is specifically designed to blend seamlessly into work schedules and improve focus during breaks."],
    ["Does ZenWork support dark mode?", "We are working on a theme toggle to give you even more comfort while working."]
  ];

  return (
    <div className="w-full min-h-full bg-blue-100 text-gray-800 px-6 py-10 font-sans">
      {/* Welcome Section */}
      <div className="text-center mb-20 mt-20" data-aos="fade-up">
        <img src={assets.logo} alt="ZenWork Logo" className="w-28 mx-auto mb-4" />
        <h1 className="text-4xl font-semibold text-blue-800 flex justify-center items-center gap-2">
          Hey {userData ? userData.name : "User"}! <img src={assets.hand_wave} alt="wave" className="w-7" />
        </h1>
        <h2 className="text-6xl font-extrabold text-blue-900 mt-3">Wellness Meets Productivity</h2>
        <p className="text-xl text-blue-900 mt-4 max-w-2xl mx-auto">
          Stay focused, stress-free, and productive with our AI-powered workplace wellness platform.
        </p>
        <button
          onClick={() => navigate("/pixel-game")}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300"
        >
          Get Started
        </button>
      </div>

      {/* What is ZenWork */}
      <section className="max-w-4xl mx-auto mb-20" data-aos="fade-up">
        <h3 className="text-4xl font-bold text-blue-900 mb-4">What is ZenWork?</h3>
        <p className="text-lg text-gray-700 leading-relaxed">
          ZenWork is your personalized AI-driven wellness assistant designed to help you manage workplace stress,
          enhance productivity, and achieve better work-life balance. With intelligent tracking, real-time feedback,
          and soothing wellness tools, ZenWork transforms your breaks into moments of recovery.
        </p>
      </section>

      {/* Why ZenWork */}
      <section className="max-w-4xl mx-auto mb-20" data-aos="fade-up">
        <h3 className="text-4xl font-bold text-blue-900 mb-4">Why ZenWork?</h3>
        <p className="text-lg text-gray-700 leading-relaxed">
          With rising levels of burnout, digital fatigue, and scattered routines, employees need more than task lists.
          ZenWork goes beyond traditional productivity apps—it promotes mental clarity, encourages healthy habits,
          and motivates through interactive, stress-reducing tools.
        </p>
      </section>

      {/* Core Features */}
      <section className="max-w-5xl mx-auto mb-24" data-aos="fade-up">
        <h3 className="text-4xl font-bold text-blue-900 mb-8 text-center">Core Features</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {features.map(([title, desc], idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 hover:border-2 border-blue-400 transition duration-300 text-blue-800"
            >
              <h4 className="text-xl font-semibold mb-2">{title}</h4>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto mb-10" data-aos="fade-up">
        <h3 className="text-4xl font-bold text-blue-900 mb-6 text-center">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map(([question, answer], idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg shadow cursor-pointer" onClick={() => toggleFAQ(idx)}>
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-blue-700">{question}</h4>
                <span className="text-blue-500 font-bold text-xl">{openFAQ === idx ? "-" : "+"}</span>
              </div>
              {openFAQ === idx && (
                <p className="text-sm text-gray-600 mt-2 transition-all duration-200">{answer}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Header;