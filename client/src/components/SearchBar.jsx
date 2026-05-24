import { useState } from 'react';

const SearchBar = ({ onAsk, loading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    onAsk(query);
    setQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className='px-3 md:px-4 py-4 border-t border-gray-200 bg-[#f5f4ef]'>
      <form
        onSubmit={handleSubmit}
        className='max-w-3xl mx-auto flex items-end gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm focus-within:border-[#6c3fc5] focus-within:ring-1 focus-within:ring-[#6c3fc5] transition-all'
      >
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Ask anything...'
          rows={1}
          disabled={loading}
          className='flex-1 resize-none text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent disabled:opacity-50 min-w-0'
          style={{ maxHeight: '120px', overflowY: 'auto' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />

        <button
          type='submit'
          disabled={!query.trim() || loading}
          className='shrink-0 w-8 h-8 bg-[#6c3fc5] hover:bg-[#5a33a8] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors'
        >
          {loading ? (
            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
          ) : (
            <svg
              className='w-4 h-4 text-white'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 10l7-7m0 0l7 7m-7-7v18'
              />
            </svg>
          )}
        </button>
      </form>

      <p className='text-center text-xs text-gray-400 mt-2 hidden md:block'>
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
};

export default SearchBar;
