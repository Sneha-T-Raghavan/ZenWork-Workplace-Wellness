import React from 'react'
import {Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import EmailVerify from './pages/EmailVerify'
import Pixelgame from './pages/Pixelgame'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />  
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/pixel-game" element={<Pixelgame />} />  
      </Routes>
    </div>
  )
}

export default App
