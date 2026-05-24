import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ConversationView from '../components/ConversationView';
import SearchBar from '../components/SearchBar';
import api from '../api/axios';

const Home = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState(null); // ✅ error state

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/conversations');
      setConversations(data.data);
    } catch (err) {
      if (err.response?.status === 404) setConversations([]);
    }
  };

  const fetchConversation = async (conversationId) => {
    try {
      const { data } = await api.get(`/conversation/${conversationId}`);
      setMessages(data.data.messages);
      setActiveConversationId(conversationId);
      setSidebarOpen(false);
    } catch (err) {
      console.error('Failed to fetch conversation');
    }
  };

  const handleAsk = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null); // ✅ clear previous error

    const userMessage = {
      id: Date.now(),
      role: 'User',
      content: query,
      sources: [],
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const { data } = await api.post('/ask', {
        query,
        ...(activeConversationId && { conversationId: activeConversationId }),
      });

      const { llmResponse, sources, conversationId } = data.data;
      if (!activeConversationId) setActiveConversationId(conversationId);

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'Assistant',
        content: JSON.stringify(llmResponse),
        sources,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      fetchConversations();
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 429) {
        setError(message || 'Rate limit reached. Please try again tomorrow.');
      } else {
        setError('Something went wrong. Please try again.');
      }

      // ✅ Remove optimistically added user message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (conversationId) => {
    try {
      await api.delete(`/conversation/${conversationId}`);
      if (conversationId === activeConversationId) {
        setMessages([]);
        setActiveConversationId(null);
      }
      fetchConversations();
    } catch (err) {
      console.error('Failed to delete conversation');
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveConversationId(null);
    setSidebarOpen(false);
  };

  return (
    <div className='flex h-screen bg-[#f5f4ef] overflow-hidden'>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 bg-black/30 z-20 md:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={fetchConversation}
        onDeleteConversation={handleDelete}
        onNewChat={handleNewChat}
        onMount={fetchConversations}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Area */}
      <div className='flex flex-col flex-1 overflow-hidden min-w-0'>
        {/* Mobile header */}
        <div className='md:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-[#f5f4ef]'>
          <button
            onClick={() => setSidebarOpen(true)}
            className='text-gray-600 hover:text-gray-900 transition-colors'
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
                d='M4 6h16M4 12h16M4 18h16'
              />
            </svg>
          </button>
          <h1 className='text-base font-bold text-[#6c3fc5]'>Purplexity</h1>
        </div>

        {/* Messages */}
        <ConversationView
          messages={messages}
          loading={loading}
          onFollowUp={handleAsk}
        />

        {/* ✅ Error toast */}
        {error && (
          <div className='px-3 md:px-4 pb-2 max-w-3xl mx-auto w-full'>
            <div className='flex items-center justify-between bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg'>
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className='ml-3 text-red-400 hover:text-red-600 transition-colors shrink-0'
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
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <SearchBar onAsk={handleAsk} loading={loading} />
      </div>
    </div>
  );
};

export default Home;
