import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

const Sidebar = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewChat,
  onMount,
  isOpen,
  onClose,
}) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    onMount();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // ignore
    } finally {
      logout();
      window.location.href = '/signin';
    }
  };

  return (
    <div
      className={`
        fixed md:static inset-y-0 left-0 z-30
        w-64 h-screen bg-[#eeede8] flex flex-col border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}
    >
      {/* Logo */}
      <div className='px-4 py-5 border-b border-gray-200 flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold text-[#6c3fc5]'>Purplexity</h1>
          <p className='text-xs text-gray-400 mt-0.5'>AI Search Engine</p>
        </div>
        {/* ✅ Close button on mobile */}
        <button
          onClick={onClose}
          className='md:hidden text-gray-400 hover:text-gray-600 transition-colors'
        >
          <svg
            className='w-5 h-5'
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
        </button>
      </div>

      {/* New Chat Button */}
      <div className='px-3 py-3'>
        <button
          onClick={onNewChat}
          className='w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors'
        >
          <svg
            className='w-4 h-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 4v16m8-8H4'
            />
          </svg>
          New Chat
        </button>
      </div>

      {/* Conversations List */}
      <div className='flex-1 overflow-y-auto px-3 space-y-1'>
        {conversations.length === 0 ? (
          <p className='text-xs text-gray-400 text-center mt-8 px-4'>
            No conversations yet. Ask something!
          </p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onMouseEnter={() => setHoveredId(conv.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelectConversation(conv.id)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer group transition-colors ${
                activeConversationId === conv.id
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'hover:bg-gray-200 text-gray-600'
              }`}
            >
              <span className='text-sm truncate flex-1'>{conv.title}</span>

              {/* ✅ Always show delete on mobile, hover on desktop */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
                className={`ml-2 text-gray-400 hover:text-red-500 transition-colors
                  md:opacity-0 md:group-hover:opacity-100 opacity-100
                  ${activeConversationId === conv.id ? 'md:opacity-100' : ''}
                `}
              >
                <svg
                  className='w-3.5 h-3.5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* User Info + Logout */}
      <div className='px-4 py-4 border-t border-gray-200'>
        <div className='flex items-center justify-between'>
          <div className='min-w-0 flex-1'>
            <p className='text-sm font-medium text-gray-800 truncate'>
              {user?.name}
            </p>
            <p className='text-xs text-gray-400 truncate'>{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className='ml-2 shrink-0 text-gray-400 hover:text-red-500 transition-colors'
            title='Logout'
          >
            <svg
              className='w-4 h-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
