import SourceCard from './SourceCard';
import FollowUpChips from './FollowUpChips';
import { parseMessage } from '../utils/parseMessage';

const MessageCard = ({ message, onFollowUp }) => {
  const { role, content, sources } = message;
  const { answer, followUps } = parseMessage(role, content);
  const isUser = role === 'User';

  return (
    <div
      className={`max-w-3xl mx-auto w-full ${isUser ? 'flex justify-end' : ''}`}
    >
      {/* User Message */}
      {isUser && (
        <div className='bg-white border border-gray-200 rounded-2xl px-4 py-3 max-w-[85%] md:max-w-xl shadow-sm'>
          <p className='text-gray-800 text-sm'>{answer}</p>
        </div>
      )}

      {/* Assistant Message */}
      {!isUser && (
        <div className='space-y-4'>
          <div className='bg-white rounded-2xl px-4 md:px-6 py-5 shadow-sm border border-gray-100'>
            <div className='flex items-center gap-2 mb-3'>
              <div className='w-5 h-5 bg-[#6c3fc5] rounded-full flex items-center justify-center shrink-0'>
                <span className='text-white text-xs font-bold'>P</span>
              </div>
              <span className='text-xs font-semibold text-[#6c3fc5]'>
                Purplexity
              </span>
            </div>
            <p className='text-gray-800 text-sm leading-relaxed whitespace-pre-wrap'>
              {answer}
            </p>
          </div>

          {sources && sources.length > 0 && (
            <div>
              <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2'>
                Sources
              </p>
              <div className='flex flex-wrap gap-2'>
                {sources.map((url, index) => (
                  <SourceCard key={index} url={url} index={index + 1} />
                ))}
              </div>
            </div>
          )}

          {followUps && followUps.length > 0 && (
            <div>
              <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2'>
                Related
              </p>
              <FollowUpChips followUps={followUps} onFollowUp={onFollowUp} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageCard;
