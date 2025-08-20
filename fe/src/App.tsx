import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TeamProvider } from './contexts/TeamContext';
import Navigation from './components/layout/Navigation';
import Home from './pages/Home';
import Players from './pages/Players';
import Matches from './pages/Matches';
import Stadiums from './pages/Stadiums';
import './App.css';

function App() {
  return (
    <TeamProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/players" element={<Players />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/stadiums" element={<Stadiums />} />
            </Routes>
          </main>
        </div>
      </Router>
    </TeamProvider>
  );
}

export default App;
