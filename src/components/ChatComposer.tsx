import { PhotoButton } from './PhotoButton';
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
    moodOnly: string;
    noRecording: string;
    onlyMine: string;
    parentOk: string;
    placeholder: string;
    record: string;
    send: string;
    stop: string;
    thinking: string;
    voiceTranscriptHint: string;
    voiceReady: string;
  };
  privacy: PrivacyMode;
  recognitionLanguage: string;
  recordingPreviewUrl: string;
  photoPreviewUrl: string;
  text: string;
  onPrivacyChange: (privacy: PrivacyMode) => void;
  onPhotoReady: (photoUrl: string) => void;
  onRecordingReady: (blob: Blob, transcript: string) => void;
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
          <PhotoButton onPhotoReady={props.onPhotoReady} />
          <RecorderButton
            labels={props.labels}
            recognitionLanguage={props.recognitionLanguage}
            onRecordingReady={props.onRecordingReady}
            onTranscriptChange={props.onTextChange}
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
      {props.recordingPreviewUrl && (
        <div className="recording-preview">
          <audio controls src={props.recordingPreviewUrl}>
            <track kind="captions" />
          </audio>
          {props.text.trim().length === 0 && (
            <small>{props.labels.voiceTranscriptHint}</small>
          )}
        </div>
      )}
      {props.photoPreviewUrl && (
        <img
          alt="Selected diary moment"
          className="photo-preview"
          src={props.photoPreviewUrl}
        />
      )}
    </section>
  );
}
