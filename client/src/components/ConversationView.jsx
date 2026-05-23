import { useEffect, useRef } from 'react';
import MessageCard from './MessageCard';

const ConversationView = ({ messages, loading, onFollowUp }) => {
  const bottomRef = useRef(null);

  // Auto scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Empty state
  if (messages.length === 0 && !loading) {
    return (
      <div className='flex-1 flex flex-col items-center justify-center text-center px-4'>
        <h2 className='text-3xl font-bold text-gray-800 mb-2'>
          What do you want to know?
        </h2>
        <p className='text-gray-400 text-sm'>
          Ask anything — Purplexity searches the web and answers intelligently.
        </p>
      </div>
    );
  }

  return (
    <div className='flex-1 overflow-y-auto px-4 py-6 space-y-6'>
      {messages.map((message) => (
        <MessageCard
          key={message.id}
          message={message}
          onFollowUp={onFollowUp}
        />
      ))}

      {/* Loading indicator */}
      {loading && (
        <div className='flex items-center gap-2 text-gray-400 text-sm'>
          <div className='w-4 h-4 border-2 border-[#6c3fc5] border-t-transparent rounded-full animate-spin' />
          Searching and thinking...
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
};

export default ConversationView;
