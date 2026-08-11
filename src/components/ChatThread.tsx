import type { DiaryMessage } from '../lib/diaryTypes';
import './ChatThread.css';

type ChatThreadProps = {
  audioUrls: Record<string, string>;
  labels: {
    buddyName: string;
    conversationLabel: string;
    me: string;
    onlyMine: string;
    parentBadge: string;
  };
  messages: DiaryMessage[];
};

export function ChatThread({ audioUrls, labels, messages }: ChatThreadProps) {
  return (
    <section className="chat-thread" aria-label={labels.conversationLabel}>
      {messages.map((message) => (
        <article className={`message-bubble ${message.role}`} key={message.id}>
          <div className="message-meta">
            <span>{message.role === 'child' ? labels.me : labels.buddyName}</span>
            {message.role === 'child' && (
              <small>
                {message.privacy === 'mine' ? labels.onlyMine : labels.parentBadge}
              </small>
            )}
          </div>
          <p>{message.text}</p>
          {message.audioId && audioUrls[message.audioId] && (
            <audio controls src={audioUrls[message.audioId]}>
              <track kind="captions" />
            </audio>
          )}
        </article>
      ))}
    </section>
  );
}
