import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import AtsCheck from './pages/ATS/AtsCheck';
import ResumeBuilder from './pages/Resume/ResumeBuilder';
import InterviewPrep from './pages/Interview/InterviewPrep';
import InterviewReportView from './pages/Interview/InterviewReportView';
import AtsReportView from './pages/ATS/AtsReportView';
import NotFound from './pages/NotFound';
import AboutUs from './pages/Info/AboutUs';
import TermsOfService from './pages/Info/TermsOfService';
import TrustAndSafety from './pages/Info/TrustAndSafety';
import Contact from './pages/Info/Contact';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/ats-check" element={<AtsCheck />} />
          <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
          <Route path="/interview-prep" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
          <Route path="/interview-report/:id" element={<ProtectedRoute><InterviewReportView /></ProtectedRoute>} />
          <Route path="/ats-report/:id" element={<ProtectedRoute><AtsReportView /></ProtectedRoute>} />

          {/* Info Pages */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<TrustAndSafety />} />
          <Route path="/contact" element={<Contact />} />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;