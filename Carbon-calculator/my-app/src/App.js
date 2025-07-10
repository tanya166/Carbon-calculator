import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Offsetting from './components/Offsetting';
import Signup from './components/Signup';
import About from './components/About';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import UserDashboard from './components/UserDashboard';
import { authUtils } from './utils/auth';
import 'font-awesome/css/font-awesome.min.css';

function App() {
  return (
    <Router>
      <div className='bodyy'>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/offsetting" element={<Offsetting />} />

          <Route
            path="/login"
            element={
              authUtils.isAuthenticated()
                ? <Navigate to="/dashboard" replace />
                : <Login />
            }
          />
          <Route
            path="/signup"
            element={
              authUtils.isAuthenticated()
                ? <Navigate to="/dashboard" replace />
                : <Signup />
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/userDashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
