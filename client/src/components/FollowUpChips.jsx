const FollowUpChips = ({ followUps, onFollowUp }) => {
  return (
    <div className='space-y-2'>
      {followUps.map((question, index) => (
        <button
          key={index}
          onClick={() => onFollowUp(question)}
          className='flex items-center gap-2 w-full text-left px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-[#6c3fc5] hover:shadow-sm transition-all group'
        >
          <svg
            className='w-3.5 h-3.5 text-[#6c3fc5] shrink-0'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 5l7 7-7 7'
            />
          </svg>
          <span className='text-sm text-gray-600 group-hover:text-gray-900 transition-colors'>
            {question}
          </span>
        </button>
      ))}
    </div>
  );
};

export default FollowUpChips;
