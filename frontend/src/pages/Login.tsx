import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await axios.post('https://studystack-z2b3.onrender.com/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      localStorage.setItem('token', response.data.access_token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <h1 className="text-3xl font-bold text-white text-center mb-8">Welcome to StudyStack</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-zinc-300 block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none transition-all"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300 block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-yellow-500 text-zinc-950 font-bold hover:bg-yellow-400 active:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-yellow-500 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
