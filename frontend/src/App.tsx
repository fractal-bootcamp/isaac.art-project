// src/App.tsx

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import DrumLoopPlayer from './pages/DrumMachine'; // Ensure this matches your component name
import AdvancedFeed from './pages/AdvancedFeed';

function App() {
  return (
    <Router>
      <nav className="p-4 bg-gray-200">
        <Link to="/" className="mr-4">Home</Link>
        <Link to="/about" className="mr-4">About</Link>
        <Link to="/drum-loop" className="mr-4">Drum Loop</Link>
        <Link to="/advancedfeed" className="mr-4">Advanced Feed</Link>
      </nav>
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/drum-loop" element={<DrumLoopPlayer />} />
          <Route path="/advancedfeed" element={<AdvancedFeed />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
