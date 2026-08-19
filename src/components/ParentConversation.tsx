import type { ParentSharedEvent } from '../lib/parentSharing';

export type ParentConversationMessage = {
  role: 'parent' | 'jey';
  text: string;
};

type ParentConversationProps = {
  events: ParentSharedEvent[];
  isLoading: boolean;
  isThinking: boolean;
  messages: ParentConversationMessage[];
  onDeleteJeyMessage: (messageIndex: number) => void;
};

export function ParentConversation({
  events,
  isLoading,
  isThinking,
  messages,
  onDeleteJeyMessage,
}: ParentConversationProps) {
  const sharedMessages = events.slice(0, 6).reverse();

  return (
    <div className="parent-chat">
      {isLoading && <p className="from-jey">Jey загружает сообщения ребёнка...</p>}
      {!isLoading && sharedMessages.length === 0 && (
        <p className="from-jey">Когда ребёнок поделится настроением или записью, это появится здесь.</p>
      )}
      {sharedMessages.map((event) => (
        <p className="from-child" key={event.id}>
          <span>{event.privacy === 'mood' ? 'Child mood' : 'Child message'}</span>
          {getSharedText(event)}
        </p>
      ))}
      {messages.map((message, index) => (
        <article className={message.role === 'jey' ? 'from-jey' : 'from-parent'} key={index}>
          {message.role === 'jey' && (
            <button
              aria-label="Удалить сообщение Jey"
              className="parent-message-delete"
              onClick={() => onDeleteJeyMessage(index)}
              title="Удалить сообщение Jey"
              type="button"
            >
              Удалить
            </button>
          )}
          <p>{message.text}</p>
        </article>
      ))}
      {isThinking && <p className="from-jey">Jey думает...</p>}
    </div>
  );
}

function getSharedText(event: ParentSharedEvent) {
  if (event.privacy === 'parent' && event.child_text) return event.child_text;

  return event.summary;
}
