import React from "react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-200 to-green-50">
      {/* Navbar */}
      <nav className="bg-green-700 text-white py-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center px-6">
          <h1 className="text-3xl font-bold">ZenWork</h1>
          <div className="space-x-6">
            <a href="#" className="hover:underline">Wellness Hub</a>
            <a href="#" className="hover:underline">Smart Assistant</a>
            <a href="#" className="hover:underline">Insights</a>
            <button className="bg-white text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition">Log In</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="text-center py-20 px-4">
        <h2 className="text-5xl font-extrabold text-green-800 mb-4">Wellness Meets Productivity</h2>
        <p className="text-lg text-gray-700 max-w-xl mx-auto">
          Stay focused, stress-free, and productive with our AI-powered workplace wellness solutions.
        </p>
        <button className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700 transition duration-300">
          Get Started
        </button>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition">
          <h3 className="text-xl font-bold text-green-700">AI Chatbot</h3>
          <p className="text-gray-600 mt-2">Engage with our virtual coach for personalized therapy & stress management.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition">
          <h3 className="text-xl font-bold text-green-700">Journaling & Insights</h3>
          <p className="text-gray-600 mt-2">Track emotions & gain insights through AI-driven sentiment analysis.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition">
          <h3 className="text-xl font-bold text-green-700">Productivity Boosters</h3>
          <p className="text-gray-600 mt-2">Prevent burnout with relaxing games & smart reminders.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-700 text-white py-6 text-center mt-12">
        <p className="text-sm">© 2025 ZenWork. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
