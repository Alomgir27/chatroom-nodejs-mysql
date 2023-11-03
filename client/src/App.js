import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import HomePage from "./views/app.jsx";
import ChatroomLandingPage from './views/landing';
import { baseURL } from './components/config/baseURL';
import socketIO from 'socket.io-client';

import './App.css';

const socket = socketIO(baseURL, { transports: ['websocket', 'polling', 'flashsocket'] });
function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<ChatroomLandingPage  />} />
        <Route exact path="/chatroom" element={<HomePage socket={socket} />} />
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;

