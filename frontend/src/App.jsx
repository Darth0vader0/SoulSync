import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import  ServerPage  from './pages/ServerPage';
import RootLayout from './layouts/layout'
import Home from './pages/page';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/serverPage" element={<ServerPage />} />
        <Route path="/chat" element={<RootLayout><Home /></RootLayout>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;