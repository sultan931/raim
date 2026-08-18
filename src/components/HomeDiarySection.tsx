import { ChatComposer } from './ChatComposer';
import { ChatThread } from './ChatThread';
import { ParentHintCard } from './ParentHintCard';
import { ParentInvitePanel } from './ParentInvitePanel';
import type { PrivacyMode } from '../lib/diaryTypes';
import type { DiaryMessage } from '../lib/diaryTypes';
import type { Language, uiText } from '../lib/language';

type DiaryLabels = (typeof uiText)[Language];

type HomeDiarySectionProps = {
  audioUrls: Record<string, string>;
  canSend: boolean;
  hasRecording: boolean;
  isSending: boolean;
  labels: DiaryLabels;
  messages: DiaryMessage[];
  onDeleteMessage: (messageId: string) => void;
  onPhotoReady: (photoUrl: string) => void;
  onPrivacyChange: (privacy: PrivacyMode) => void;
  onRecordingReady: (blob: Blob, transcript: string) => void;
  onSend: () => void;
  onTextChange: (text: string) => void;
  parentHint: string;
  photoPreviewUrl: string;
  privacy: PrivacyMode;
  recognitionLanguage: string;
  recordingPreviewUrl: string;
  text: string;
};

export function HomeDiarySection(props: HomeDiarySectionProps) {
  return (
    <section className="diary-layout">
      <div className="chat-column">
        <ParentInvitePanel />
        <ChatThread audioUrls={props.audioUrls} labels={props.labels} messages={props.messages} onDeleteMessage={props.onDeleteMessage} />
        <ChatComposer
          canSend={props.canSend}
          hasRecording={props.hasRecording}
          isSending={props.isSending}
          labels={props.labels}
          onPhotoReady={props.onPhotoReady}
          onPrivacyChange={props.onPrivacyChange}
          onRecordingReady={props.onRecordingReady}
          onSend={props.onSend}
          onTextChange={props.onTextChange}
          privacy={props.privacy}
          photoPreviewUrl={props.photoPreviewUrl}
          recognitionLanguage={props.recognitionLanguage}
          recordingPreviewUrl={props.recordingPreviewUrl}
          text={props.text}
        />
      </div>
      <ParentHintCard hint={props.parentHint} labels={props.labels} />
    </section>
  );
}
