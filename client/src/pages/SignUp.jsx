import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post('/auth/signup', formData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage(null);
    try {
      await api.post('/auth/resend-verification', { email: formData.email });
      setResendMessage('Verification email resent! Check your inbox.');
    } catch (err) {
      setResendMessage(
        err.response?.data?.message || 'Failed to resend email.',
      );
    } finally {
      setResendLoading(false);
    }
  };

  // ─── Success State ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className='min-h-screen bg-[#f5f4ef] flex items-center justify-center'>
        <div className='w-full max-w-md bg-white rounded-2xl shadow-sm p-8 text-center'>
          <div className='w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg
              className='w-7 h-7 text-green-500'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
              />
            </svg>
          </div>

          <h2 className='text-xl font-bold text-gray-800 mb-2'>
            Check your email!
          </h2>
          <p className='text-gray-500 text-sm mb-6'>
            We sent a verification link to <strong>{formData.email}</strong>
          </p>

          {/* Resend section */}
          {resendMessage && (
            <p className='text-sm text-green-600 mb-3'>{resendMessage}</p>
          )}
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className='text-sm text-[#6c3fc5] hover:underline disabled:opacity-50'
          >
            {resendLoading ? 'Sending...' : "Didn't get the email? Resend"}
          </button>

          <div className='mt-6 border-t border-gray-100 pt-4'>
            <Link
              to='/signin'
              className='text-sm text-gray-500 hover:text-[#6c3fc5]'
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Sign Up Form ─────────────────────────────────────────────────────────
  return (
    <div className='min-h-screen bg-[#f5f4ef] flex items-center justify-center'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-sm p-8'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-[#6c3fc5]'>Purplexity</h1>
          <p className='text-gray-500 text-sm mt-1'>Create your account</p>
        </div>

        {error && (
          <div className='bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Name
            </label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
              placeholder='John Doe'
              required
              className='w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6c3fc5] focus:border-transparent'
            />
          </div>

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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className='text-center text-sm text-gray-500 mt-6'>
          Already have an account?{' '}
          <Link
            to='/signin'
            className='text-[#6c3fc5] font-medium hover:underline'
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
