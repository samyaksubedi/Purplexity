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

  // ─── Fetch all conversations for sidebar ─────────────────────────────────
  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/conversations');
      setConversations(data.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setConversations([]);
      }
    }
  };

  // ─── Fetch single conversation messages ──────────────────────────────────
  const fetchConversation = async (conversationId) => {
    try {
      const { data } = await api.get(`/conversation/${conversationId}`);
      setMessages(data.data.messages);
      setActiveConversationId(conversationId);
    } catch (err) {
      console.error('Failed to fetch conversation');
    }
  };

  // ─── Send query to /api/ask ───────────────────────────────────────────────
  const handleAsk = async (query) => {
    if (!query.trim()) return;
    setLoading(true);

    // Optimistically add user message to UI immediately
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
        // ✅ only send conversationId if it exists — don't send null
        ...(activeConversationId && { conversationId: activeConversationId }),
      });

      const { llmResponse, sources, conversationId } = data.data;

      // Set active conversation if new
      if (!activeConversationId) {
        setActiveConversationId(conversationId);
      }

      // Add assistant message to UI
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'Assistant',
        content: JSON.stringify(llmResponse),
        sources,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Refresh sidebar to show new/updated conversation
      fetchConversations();
    } catch (err) {
      console.error('Failed to ask:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Delete conversation ──────────────────────────────────────────────────
  const handleDelete = async (conversationId) => {
    try {
      await api.delete(`/conversation/${conversationId}`);
      // If deleted active conversation → clear messages
      if (conversationId === activeConversationId) {
        setMessages([]);
        setActiveConversationId(null);
      }
      fetchConversations();
    } catch (err) {
      console.error('Failed to delete conversation');
    }
  };

  // ─── New chat ─────────────────────────────────────────────────────────────
  const handleNewChat = () => {
    setMessages([]);
    setActiveConversationId(null);
  };

  return (
    <div className='flex h-screen bg-[#f5f4ef] overflow-hidden'>
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={fetchConversation}
        onDeleteConversation={handleDelete}
        onNewChat={handleNewChat}
        onMount={fetchConversations}
      />

      {/* Main Area */}
      <div className='flex flex-col flex-1 overflow-hidden'>
        {/* Messages */}
        <ConversationView
          messages={messages}
          loading={loading}
          onFollowUp={handleAsk}
        />

        {/* Search Bar */}
        <SearchBar onAsk={handleAsk} loading={loading} />
      </div>
    </div>
  );
};

export default Home;
