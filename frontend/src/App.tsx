import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import DrumLoopPlayer from './pages/DrumMachine';
import AdvancedFeed from './pages/AdvancedFeed';
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/clerk-react";

function App() {
  const { isSignedIn } = useAuth(); // This hook gives us the signed-in state

  return (
    <Router>
      <nav className="p-4 bg-gray-200 flex justify-between">
        <div>
          <Link to="/" className="mr-4">Home</Link>
          <Link to="/about" className="mr-4">About</Link>
          <Link to="/drum-loop" className="mr-4">Drum Loop</Link>
          <Link to="/advancedfeed" className="mr-4">Advanced Feed</Link>
        </div>
        <div>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </nav>
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/drum-loop" element={<DrumLoopPlayer />} />

          {/* Conditionally render AdvancedFeed only if signed in, otherwise redirect */}
          <Route
            path="/advancedfeed"
            element={isSignedIn ? <AdvancedFeed /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
