import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import TabBar from './components/TabBar';
import Home from './pages/Home';
import Checklist from './pages/Checklist';
import Deals from './pages/Deals';
import Budget from './pages/Budget';
import Onboarding from './pages/Onboarding';
import Community from './pages/Community';
import LocalGuide from './pages/LocalGuide';
import More from './pages/More';

export default function App() {
  const [hasUser, setHasUser] = useState(
    () => !!localStorage.getItem('arrivauk_user_id')
  );

  if (!hasUser) {
    return <Onboarding onComplete={() => setHasUser(true)} />;
  }

  return (
    <div className="min-h-screen bg-ios-bg font-sans">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/community" element={<Community />} />
        <Route path="/guide" element={<LocalGuide />} />
        <Route path="/more" element={<More />} />
      </Routes>
      <TabBar />
    </div>
  );
}
