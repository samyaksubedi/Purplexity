const SourceCard = ({ url, index }) => {
  // Extract domain name from URL for display
  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <a
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      className='flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-[#6c3fc5] hover:shadow-sm transition-all group max-w-[200px]'
    >
      {/* Source number */}
      <span className='text-xs font-bold text-[#6c3fc5] shrink-0'>{index}</span>

      {/* Favicon */}
      <img
        src={`https://www.google.com/s2/favicons?domain=${getDomain(url)}&sz=16`}
        alt=''
        className='w-4 h-4 shrink-0'
        onError={(e) => (e.target.style.display = 'none')}
      />

      {/* Domain */}
      <span className='text-xs text-gray-600 truncate group-hover:text-[#6c3fc5] transition-colors'>
        {getDomain(url)}
      </span>
    </a>
  );
};

export default SourceCard;
