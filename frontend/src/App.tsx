import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ReactNode } from 'react';
import Home from './pages/Home';
import About from './pages/About';
import Builder from './pages/Builder';
import Feed from './pages/Feed';
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/clerk-react";
import { RedirectToSignIn } from "@clerk/clerk-react";

// Define props type for ProtectedRoute component
type ProtectedRouteProps = {
  children: ReactNode;
};

// Protected Route component
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
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
  return <>{children}</>;
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
          <Link to="/builder" className="mr-4">Builder</Link>
          <Link to="/feed" className="mr-4">Feed</Link>
          <Link to="/about" className="mr-4">About</Link>
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
          <Route
            path="/builder"
            element={
              <ProtectedRoute>
                <Builder />
              </ProtectedRoute>
            }
          />
          <Route path="/feed" element={<Feed />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
