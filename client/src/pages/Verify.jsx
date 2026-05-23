import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const Verify = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    // Clear any existing auth state when landing on verify page
    useAuthStore.getState().logout();

    const verifyEmail = async () => {
      try {
        await api.get(`/auth/verify/${token}`);
        setStatus('success');
        setMessage('Email verified successfully! Redirecting to sign in...');
        setTimeout(() => navigate('/signin'), 2000);
      } catch (err) {
        const errMessage =
          err.response?.data?.message ||
          'Verification link is invalid or expired.';
        setStatus('error');
        setMessage(errMessage);
      }
    };
    verifyEmail();
  }, [token]);

  const handleResend = async () => {
    if (!email.trim()) {
      setResendMessage('Please enter your email address.');
      return;
    }
    setResendLoading(true);
    setResendMessage('');
    try {
      await api.post('/auth/resend-verification', { email });
      setResendMessage('Verification email sent! Check your inbox.');
    } catch (err) {
      setResendMessage(
        err.response?.data?.message || 'Failed to resend email.',
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-[#f5f4ef] flex items-center justify-center'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-sm p-8 text-center'>
        <h1 className='text-3xl font-bold text-[#6c3fc5] mb-8'>Purplexity</h1>

        {/* Verifying */}
        {status === 'verifying' && (
          <div>
            <div className='w-10 h-10 border-4 border-[#6c3fc5] border-t-transparent rounded-full animate-spin mx-auto mb-4' />
            <p className='text-gray-500 text-sm'>Verifying your email...</p>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div>
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
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>
            <h2 className='text-lg font-semibold text-gray-800 mb-2'>
              Email Verified!
            </h2>
            <p className='text-gray-500 text-sm'>{message}</p>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div>
            <div className='w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-7 h-7 text-red-500'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </div>
            <h2 className='text-lg font-semibold text-gray-800 mb-2'>
              Verification Failed
            </h2>
            <p className='text-gray-500 text-sm mb-6'>{message}</p>

            {/* Resend form — inline, no navigation needed */}
            <div className='text-left space-y-3'>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email to resend'
                className='w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6c3fc5]'
              />
              {resendMessage && (
                <p
                  className={`text-sm ${resendMessage.includes('sent') ? 'text-green-600' : 'text-red-500'}`}
                >
                  {resendMessage}
                </p>
              )}
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className='w-full bg-[#6c3fc5] hover:bg-[#5a33a8] text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50'
              >
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </button>
              <button
                onClick={() => navigate('/signin')}
                className='w-full text-sm text-gray-500 hover:text-[#6c3fc5] transition-colors py-1'
              >
                Already verified? Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verify;
