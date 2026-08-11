import { useEffect, useMemo, useState } from 'react';
import { AlbumButton } from '../components/AlbumButton';
import { BuddyAvatar } from '../components/BuddyAvatar';
import { ChatComposer } from '../components/ChatComposer';
import { ChatThread } from '../components/ChatThread';
import { LanguageSelector } from '../components/LanguageSelector';
import { ParentHintCard } from '../components/ParentHintCard';
import { askJey } from '../lib/diaryAi';
import { saveRecording } from '../lib/audioStore';
import { createAlbumMoment, saveAlbumMoment } from '../lib/album';
import {
  hydrateAudioUrls,
  languageStorageKey,
  loadLanguage,
  loadMessages,
  messageStorageKey,
  translateWelcomeMessage,
} from '../lib/diaryStorage';
import { uiText, type Language } from '../lib/language';
import type { DiaryMessage, PrivacyMode } from '../lib/diaryTypes';
import './HomePage.css';

export function HomePage() {
  const [language, setLanguage] = useState<Language>(() => loadLanguage());
  const [messages, setMessages] = useState<DiaryMessage[]>(() =>
    loadMessages(loadLanguage()),
  );
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
  const [text, setText] = useState('');
  const [privacy, setPrivacy] = useState<PrivacyMode>('mine');
  const [recording, setRecording] = useState<Blob | null>(null);
  const [parentHint, setParentHint] = useState('');
  const [isSending, setIsSending] = useState(false);
  const t = uiText[language];

  const canSend = text.trim().length >= 4 || recording !== null;
  const moodLabel = useMemo(() => {
    if (privacy === 'mine') return t.mineMood;
    return t.parentMood;
  }, [privacy, t]);

  useEffect(() => {
    localStorage.setItem(languageStorageKey, language);
    setParentHint('');
    setMessages((current) => translateWelcomeMessage(current, language));
  }, [language]);

  useEffect(() => {
    localStorage.setItem(messageStorageKey, JSON.stringify(messages));
    void hydrateAudioUrls(messages, setAudioUrls);
  }, [messages]);

  async function handleSend() {
    if (!canSend || isSending) return;

    setIsSending(true);
    const audioId = recording ? crypto.randomUUID() : undefined;
    const entryText = text.trim() || t.voiceEntry;

    if (recording && audioId) {
      await saveRecording(audioId, recording);
    }

    const childMessage = createMessage('child', entryText, privacy, audioId);
    setMessages((current) => [...current, childMessage]);
    saveAlbumMoment(createAlbumMoment(entryText, privacy, language));
    setText('');
    setRecording(null);

    const reply = await askJey(entryText, privacy, language);
    setMessages((current) => [...current, createMessage('buddy', reply.text, 'mine')]);
    setParentHint(reply.parentHint);
    setIsSending(false);
  }

  return (
    <main className="diary-page">
      <section className="diary-hero">
        <div>
          <p className="eyebrow">{t.diaryName}</p>
          <h1>{t.headline}</h1>
          <p>{t.intro}</p>
        </div>
        <div className="hero-side">
          <LanguageSelector value={language} onChange={setLanguage} />
          <AlbumButton label={t.albumsButton} />
          <BuddyAvatar moodLabel={moodLabel} />
        </div>
      </section>

      <section className="diary-layout">
        <div className="chat-column">
          <ChatThread audioUrls={audioUrls} labels={t} messages={messages} />
          <ChatComposer
            canSend={canSend}
            hasRecording={recording !== null}
            isSending={isSending}
            labels={t}
            onPrivacyChange={setPrivacy}
            onRecordingReady={setRecording}
            onSend={handleSend}
            onTextChange={setText}
            privacy={privacy}
            text={text}
          />
        </div>
        <ParentHintCard hint={parentHint} labels={t} />
      </section>
    </main>
  );
}

function createMessage(
  role: DiaryMessage['role'],
  text: string,
  privacy: PrivacyMode,
  audioId?: string,
): DiaryMessage {
  return {
    id: crypto.randomUUID(),
    role,
    text,
    privacy,
    audioId,
    createdAt: new Date().toISOString(),
  };
}
