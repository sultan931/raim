import { useEffect, useRef } from 'react';
import type { DiaryMessage } from '../lib/diaryTypes';
import './ChatThread.css';

type ChatThreadProps = {
  audioUrls: Record<string, string>;
  labels: {
    buddyName: string;
    conversationLabel: string;
    deleteMessage: string;
    me: string;
    moodBadge: string;
    onlyMine: string;
    parentBadge: string;
  };
  messages: DiaryMessage[];
  onDeleteMessage: (messageId: string) => void;
};

export function ChatThread({
  audioUrls,
  labels,
  messages,
  onDeleteMessage,
}: ChatThreadProps) {
  const threadRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages.length]);

  return (
    <section
      className="chat-thread"
      aria-label={labels.conversationLabel}
      ref={threadRef}
    >
      {messages.map((message) => (
        <article className={`message-bubble ${message.role}`} key={message.id}>
          <div className="message-meta">
            <span>{message.role === 'child' ? labels.me : labels.buddyName}</span>
            {message.role === 'child' && (
              <div className="message-meta__actions">
                <small>{getPrivacyLabel(message.privacy, labels)}</small>
                <button
                  aria-label={labels.deleteMessage}
                  className="message-delete"
                  onClick={() => onDeleteMessage(message.id)}
                  title={labels.deleteMessage}
                  type="button"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <p>{message.text}</p>
          {message.photoUrl && (
            <img
              alt="Diary moment"
              className="message-photo"
              src={message.photoUrl}
            />
          )}
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

function getPrivacyLabel(
  privacy: DiaryMessage['privacy'],
  labels: ChatThreadProps['labels'],
) {
  if (privacy === 'mine') return labels.onlyMine;
  if (privacy === 'mood') return labels.moodBadge;
  return labels.parentBadge;
}
