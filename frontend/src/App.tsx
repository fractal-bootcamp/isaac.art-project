import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import DrumLoopPlayer from './pages/DrumMachine';
import Builder from './pages/Builder';
import Feed from './pages/Feed';
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/clerk-react";
import { RedirectToSignIn } from "@clerk/clerk-react";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  // If user is not signed in, redirect to sign-in page
  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  // If user is signed in, render the protected content
  return children;
};

function App() {
  const { isLoaded } = useAuth();

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <nav className="p-4 bg-gray-200 flex justify-between">
        <div>
          <Link to="/" className="mr-4">Home</Link>
          <Link to="/about" className="mr-4">About</Link>
          <Link to="/drum-loop" className="mr-4">Drum Loop</Link>
          <Link to="/feed" className="mr-4">Feed</Link>
          <Link to="/builder" className="mr-4">Builder</Link>
        </div>
        <div>
          <SignedOut>
            <SignInButton mode="modal" />
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
          <Route path="/feed" element={<Feed />} />
          <Route
            path="/builder"
            element={
              <ProtectedRoute>
                <Builder />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;