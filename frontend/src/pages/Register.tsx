import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('https://studystack-z2b3.onrender.com/api/auth/register', formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app p-4 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="card w-full max-w-md p-8 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-primary text-center mb-8 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">Create Account</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-4 text-sm min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div>
            <label className="text-sm text-secondary block mb-1 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-card-hover border border-border-subtle text-primary focus:border-accent-yellow focus:outline-none transition-colors min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label className="text-sm text-secondary block mb-1 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-card-hover border border-border-subtle text-primary focus:border-accent-yellow focus:outline-none transition-colors min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="text-sm text-secondary block mb-1 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-card-hover border border-border-subtle text-primary focus:border-accent-yellow focus:outline-none transition-colors min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-lg bg-accent-yellow text-gray-900 font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-secondary mt-6 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-yellow hover:underline min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
