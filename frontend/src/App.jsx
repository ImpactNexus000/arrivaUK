import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TabBar from './components/TabBar';
import Home from './pages/Home';
import Checklist from './pages/Checklist';
import Deals from './pages/Deals';
import Budget from './pages/Budget';
import Community from './pages/Community';
import LocalGuide from './pages/LocalGuide';
import More from './pages/More';
import Documents from './pages/Documents';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';

export default function App() {
  const [authed, setAuthed] = useState(
    () => !!localStorage.getItem('arrivauk_token')
  );

  if (!authed) {
    return (
      <div className="app-shell">
        <Routes>
          <Route path="/register" element={<Register onAuth={() => setAuthed(true)} />} />
          <Route path="/login" element={<Login onAuth={() => setAuthed(true)} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app-shell bg-ios-bg font-sans">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/community" element={<Community />} />
        <Route path="/guide" element={<LocalGuide />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/more" element={<More />} />
        <Route path="/profile" element={<Profile onLogout={() => setAuthed(false)} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <TabBar />
    </div>
  );
}
