import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const SignIn = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    email: 'test@purplexity.com',
    password: 'testuser@123',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signin', formData);
      setAuth(data.data.accessToken, data.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-[#f5f4ef] flex items-center justify-center'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-sm p-8'>
        {/* Logo */}
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-[#6c3fc5]'>Purplexity</h1>
          <p className='text-gray-500 text-sm mt-1'>Sign in to continue</p>
        </div>

        {/* Demo account banner */}
        <div className='mb-4 px-4 py-3 bg-purple-50 border border-purple-100 rounded-lg text-center'>
          <p className='text-xs font-medium text-[#6c3fc5]'>Demo Account</p>
          <p className='text-xs text-gray-500 mt-0.5'>
            Credentials are pre-filled — just click Sign In!
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className='bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4'>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Email
            </label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              placeholder='you@example.com'
              required
              className='w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6c3fc5] focus:border-transparent'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Password
            </label>
            <input
              type='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              placeholder='••••••••'
              required
              className='w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6c3fc5] focus:border-transparent'
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-[#6c3fc5] hover:bg-[#5a33a8] text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <p className='text-center text-sm text-gray-500 mt-6'>
          Don't have an account?{' '}
          <Link
            to='/signup'
            className='text-[#6c3fc5] font-medium hover:underline'
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
