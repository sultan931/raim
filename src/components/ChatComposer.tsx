import { RecorderButton } from './RecorderButton';
import { PrivacyToggle } from './PrivacyToggle';
import type { PrivacyMode } from '../lib/diaryTypes';
import './ChatComposer.css';

type ChatComposerProps = {
  canSend: boolean;
  hasRecording: boolean;
  isSending: boolean;
  labels: {
    diaryLabel: string;
    micNeeded: string;
    noRecording: string;
    onlyMine: string;
    parentOk: string;
    placeholder: string;
    record: string;
    send: string;
    stop: string;
    thinking: string;
    voiceReady: string;
  };
  privacy: PrivacyMode;
  text: string;
  onPrivacyChange: (privacy: PrivacyMode) => void;
  onRecordingReady: (blob: Blob) => void;
  onSend: () => void;
  onTextChange: (text: string) => void;
};

export function ChatComposer(props: ChatComposerProps) {
  return (
    <section className="chat-composer">
      <PrivacyToggle
        labels={props.labels}
        value={props.privacy}
        onChange={props.onPrivacyChange}
      />
      <textarea
        aria-label={props.labels.diaryLabel}
        onChange={(event) => props.onTextChange(event.target.value)}
        placeholder={props.labels.placeholder}
        value={props.text}
      />
      <div className="composer-actions">
        <div className="recording-side">
          <RecorderButton
            labels={props.labels}
            onRecordingReady={props.onRecordingReady}
          />
          {props.hasRecording && <span>{props.labels.voiceReady}</span>}
        </div>
        <button
          disabled={!props.canSend || props.isSending}
          onClick={props.onSend}
          type="button"
        >
          {props.isSending ? props.labels.thinking : props.labels.send}
        </button>
      </div>
    </section>
  );
}
