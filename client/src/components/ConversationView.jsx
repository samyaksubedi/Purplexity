import { useEffect, useRef } from 'react';
import MessageCard from './MessageCard';

const ConversationView = ({ messages, loading, onFollowUp }) => {
  const bottomRef = useRef(null);
  const prevLengthRef = useRef(0);

  useEffect(() => {
    const currentLength = messages.length;
    const prevLength = prevLengthRef.current;
    if (currentLength > prevLength) {
      const lastMessage = messages[currentLength - 1];
      if (lastMessage?.role === 'User') {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    prevLengthRef.current = currentLength;
  }, [messages]);

  if (messages.length === 0 && !loading) {
    return (
      <div className='flex-1 flex flex-col items-center justify-center text-center px-6'>
        <h2 className='text-2xl md:text-3xl font-bold text-gray-800 mb-2'>
          What do you want to know?
        </h2>
        <p className='text-gray-400 text-sm'>
          Ask anything — Purplexity searches the web and answers intelligently.
        </p>
      </div>
    );
  }

  return (
    <div className='flex-1 overflow-y-auto px-3 md:px-4 py-6 space-y-6'>
      {messages.map((message) => (
        <MessageCard
          key={message.id}
          message={message}
          onFollowUp={onFollowUp}
        />
      ))}

      {loading && (
        <div className='flex items-center gap-2 text-gray-400 text-sm max-w-3xl mx-auto w-full'>
          <div className='w-4 h-4 border-2 border-[#6c3fc5] border-t-transparent rounded-full animate-spin' />
          Searching and thinking...
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default ConversationView;
