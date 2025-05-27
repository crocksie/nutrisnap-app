import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Import the Supabase client

function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(true); // To toggle between Sign Up and Sign In

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (isSignUp) {
      const { data: { user }, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });
      if (error) {
        setMessage(`Error: ${error.message}` + (error.name ? ` [${error.name}]` : ''));
        console.error('Sign up error:', error);
      } else {
        setMessage('Sign up successful! Check your email for verification.');
        console.log('User signed up:', user);
        // Clear form on successful sign-up after verification message
        // setEmail('');
        // setPassword('');
      }
    } else {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        setMessage(`Error: ${error.message}` + (error.name ? ` [${error.name}]` : ''));
        console.error('Sign in error:', error);
      } else {
        setMessage('Sign in successful!');
        console.log('User signed in:', user);
        // App.tsx will handle redirect via onAuthStateChange
      }
    }
    setLoading(false);
  };

  return (
    <div className="page-container auth-page flex-center">
      <div className="app-card auth-card">
        <div className="app-card-header text-center">
          <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
        </div>
        <div className="app-card-content">
          <form onSubmit={handleSubmit}>
            <div className="form-input-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-input-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-inline"></span>
                  Processing...
                </>
              ) : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>
          {message && (
            <div className={`alert ${message.startsWith('Error:') ? 'alert-danger' : 'alert-success'} mt-1`}>
              {message}
            </div>
          )}
          <div className="text-center mt-1">
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setMessage(null); // Clear message when toggling
                // setEmail(''); // Optionally clear fields when toggling
                // setPassword('');
              }}
              className="btn btn-link"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
