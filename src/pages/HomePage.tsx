import { useEffect, useState } from 'react';
import { ChatComposer } from '../components/ChatComposer';
import { ChatThread } from '../components/ChatThread';
import { HomeHero } from '../components/HomeHero';
import { JeyIntro } from '../components/JeyIntro';
import { ParentHintCard } from '../components/ParentHintCard';
import { askJey } from '../lib/diaryAi';
import { deleteRecording, saveRecording } from '../lib/audioStore';
import { transcribeAudio } from '../lib/audioTranscription';
import { createDiaryMessage } from '../lib/createDiaryMessage';
import {
  hydrateAudioUrls,
  languageStorageKey,
  loadLanguage,
  saveMessages,
  translateWelcomeMessage,
} from '../lib/diaryStorage';
import { loadInitialMessages } from '../lib/loadInitialMessages';
import { uiText, type Language } from '../lib/language';
import { recognitionLanguages, shouldShowJeyIntro } from '../lib/homePageSettings';
import type { PrivacyMode } from '../lib/diaryTypes';
import { saveIfDiaryEntry } from '../lib/saveDiaryEntry';
import { useObjectUrl } from '../lib/useObjectUrl';
import { createVoiceReply } from '../lib/voiceReply';
import './HomePage.css';

export function HomePage() {
  const [language, setLanguage] = useState<Language>(() => loadLanguage());
  const [messages, setMessages] = useState(() => loadInitialMessages());
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
  const [text, setText] = useState('');
  const [privacy, setPrivacy] = useState<PrivacyMode>('mine');
  const [photoUrl, setPhotoUrl] = useState('');
  const [recording, setRecording] = useState<Blob | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [parentHint, setParentHint] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showIntro, setShowIntro] = useState(() => shouldShowJeyIntro());
  const t = uiText[language];
  const recognitionLanguage = recognitionLanguages[language];
  const recordingPreviewUrl = useObjectUrl(recording);

  const canSend = text.trim().length >= 4 || recording !== null || photoUrl !== '';
  const moodLabel =
    privacy === 'mine' ? t.mineMood : privacy === 'mood' ? t.moodMood : t.parentMood;

  useEffect(() => {
    localStorage.setItem(languageStorageKey, language);
    setParentHint('');
    setMessages((current) => translateWelcomeMessage(current, language));
  }, [language]);

  useEffect(() => {
    saveMessages(messages);
    void hydrateAudioUrls(messages, setAudioUrls);
  }, [messages]);

  async function handleSend() {
    if (!canSend || isSending) return;

    setIsSending(true);
    try {
      const audioId = recording ? crypto.randomUUID() : undefined;
      const writtenText = text.trim();
      const spokenText =
        recording && !writtenText && !voiceTranscript.trim()
          ? await transcribeAudio(recording, language)
          : voiceTranscript.trim();
      const entryText = writtenText || spokenText || t.voiceEntry;
      const hasUnderstoodVoice = spokenText.length > 0 && writtenText.length === 0;

      if (recording && audioId) {
        await saveRecording(audioId, recording);
      }

      const childMessage = createDiaryMessage('child', entryText, privacy, { audioId, photoUrl });
      setMessages((current) => [...current, childMessage]);
      const diarySave = saveIfDiaryEntry(entryText, privacy, language);
      setText('');
      setVoiceTranscript('');
      setPhotoUrl('');
      setRecording(null);

      const reply = recording && !hasUnderstoodVoice && writtenText.length === 0
        ? createVoiceReply(language)
        : await askJey(entryText, privacy, language);
      await diarySave;
      setMessages((current) => [
        ...current,
        createDiaryMessage('buddy', reply.text, 'mine'),
      ]);
      setParentHint(reply.parentHint);
    } finally {
      setIsSending(false);
    }
  }

  function handleTextChange(nextText: string) {
    setText(nextText);
    setVoiceTranscript(nextText);
  }

  function handleRecordingReady(blob: Blob, transcript: string) {
    setRecording(blob);
    setVoiceTranscript(transcript);
    if (transcript) setText(transcript);
  }

  function handleDeleteMessage(messageId: string) {
    const deletedMessage = messages.find((message) => message.id === messageId);
    if (deletedMessage?.audioId) void deleteRecording(deletedMessage.audioId);
    setMessages((current) => current.filter((message) => message.id !== messageId));
  }

  return (
    <main className="diary-page">
      {showIntro && <JeyIntro onDone={() => setShowIntro(false)} />}

      <HomeHero
        labels={t}
        language={language}
        moodLabel={moodLabel}
        onLanguageChange={setLanguage}
      />

      <section className="diary-layout">
        <div className="chat-column">
          <ChatThread audioUrls={audioUrls} labels={t} messages={messages} onDeleteMessage={handleDeleteMessage} />
          <ChatComposer
            canSend={canSend}
            hasRecording={recording !== null}
            isSending={isSending}
            labels={t}
            onPhotoReady={setPhotoUrl}
            onPrivacyChange={setPrivacy}
            onRecordingReady={handleRecordingReady}
            onSend={handleSend}
            onTextChange={handleTextChange}
            privacy={privacy}
            photoPreviewUrl={photoUrl}
            recognitionLanguage={recognitionLanguage}
            recordingPreviewUrl={recordingPreviewUrl}
            text={text}
          />
        </div>
        <ParentHintCard hint={parentHint} labels={t} />
      </section>
    </main>
  );
}
