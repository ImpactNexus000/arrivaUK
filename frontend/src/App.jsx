import { Routes, Route } from 'react-router-dom';
import TabBar from './components/TabBar';
import Home from './pages/Home';
import Checklist from './pages/Checklist';
import Deals from './pages/Deals';
import Budget from './pages/Budget';

export default function App() {
  return (
    <div className="min-h-screen bg-ios-bg font-sans">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/budget" element={<Budget />} />
      </Routes>
      <TabBar />
    </div>
  );
}
