import React from 'react'
import {Routes, Route} from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import EmailVerify from './pages/EmailVerify'
import Pixelgame from './pages/Pixelgame'
import Home from './pages/Home'
import Journal from './pages/Journal';
import Bingogame from './pages/Bingogame'
import BreakTimerQuest from './pages/BreakTimerQuest'


const App = () => {
  return (
    <div>
       <ToastContainer/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />  
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/pixel-game" element={<Pixelgame />} />  
        <Route path='/journal' element={<Journal/>}/>
        <Route path="/bingo-game" element={<Bingogame />} />
        <Route path="/break-timer-quest" element={<BreakTimerQuest />} />
      </Routes>
    </div>
  )
}

export default App
