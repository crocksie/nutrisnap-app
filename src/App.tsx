import { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'; // Import Navigate and useLocation
import './App.css'; // Keep the default App.css or remove if not needed
import './index.css'; // Import the main styles
import { supabase } from './supabaseClient'; // Import the Supabase client
import type { Session } from '@supabase/supabase-js'; // Import Session type

// Import components
import Auth from './components/Auth'; // Import the Auth component
import Dashboard from './pages/Dashboard';
import UploadFood from './pages/UploadFood';
import History from './pages/History';
import Profile from './pages/Profile';
import Home from './pages/Home'; // Import the new Home component
import NotFound from './pages/NotFound';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    const localTheme = window.localStorage.getItem('theme');
    return localTheme || 'light';
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Session loaded:', session);
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', session);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <>
      <header>
        <div className="container">
          <nav className="main-navbar">
            <div className="main-navbar-left-group">
              <Link to="/" className="logo">
                <i className="fas fa-camera"></i> NutriSnap
              </Link>
              <ul>
                <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
                {session && (
                  <>
                    <li><Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link></li>
                    <li><Link to="/upload" className={location.pathname === '/upload' ? 'active' : ''}>Upload Food</Link></li>
                    <li><Link to="/history" className={location.pathname === '/history' ? 'active' : ''}>History</Link></li>
                    <li><Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>Profile</Link></li>
                  </>
                )}
              </ul> {/* Correctly closed ul tag */}
            </div>
            
            <div className="main-navbar-right-group"> {/* Wrapper for right-side buttons */}
              <button onClick={toggleTheme} className="btn btn-secondary btn-icon" aria-label="Toggle theme">
                {theme === 'light' ? <i className="fas fa-moon"></i> : <i className="fas fa-sun"></i>}
              </button>
              {session ? (
                <button className="btn btn-secondary" onClick={async () => await supabase.auth.signOut()}>Sign Out</button>
              ) : (
                <Link to="/auth" className="btn btn-primary">Sign In</Link>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Routes>
            <Route path="/" element={<Home />} /> {/* Home component includes hero and how-it-works */}
            <Route path="/auth" element={<Auth />} /> {/* Auth page */}

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={session ? <Dashboard /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/upload"
              element={session ? <UploadFood /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/history"
              element={session ? <History /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/profile"
              element={session ? <Profile /> : <Navigate to="/auth" replace />}
            />

            {/* Add a catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
