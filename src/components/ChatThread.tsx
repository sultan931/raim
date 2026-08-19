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
                <DeleteButton label={labels.deleteMessage} onClick={() => onDeleteMessage(message.id)} />
              </div>
            )}
          </div>
          <p>{message.text}</p>
          {message.role === 'buddy' && (
            <div className="message-actions">
              <DeleteButton label={labels.deleteMessage} onClick={() => onDeleteMessage(message.id)} text />
            </div>
          )}
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

type DeleteButtonProps = {
  label: string;
  onClick: () => void;
  text?: boolean;
};

function DeleteButton({ label, onClick, text = false }: DeleteButtonProps) {
  return (
    <button
      aria-label={label}
      className={text ? 'message-delete message-delete--text' : 'message-delete'}
      onClick={onClick}
      title={label}
      type="button"
    >
      {text ? label : '×'}
    </button>
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
