import { useRef, useState } from 'react';
import {
  getInputLevel,
  startRecordingSession,
  type RecordingSession,
} from '../lib/recordingSession';
import {
  startSpeechRecognition,
  type SpeechRecognitionControl,
} from '../lib/speechRecognition';

type RecorderButtonProps = {
  labels: {
    micNeeded: string;
    noRecording: string;
    record: string;
    stop: string;
  };
  recognitionLanguage: string;
  onRecordingReady: (blob: Blob, transcript: string) => void;
  onTranscriptChange: (transcript: string) => void;
};

export function RecorderButton({
  labels,
  recognitionLanguage,
  onRecordingReady,
  onTranscriptChange,
}: RecorderButtonProps) {
  const [error, setError] = useState('');
  const [level, setLevel] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const frameRef = useRef<number | null>(null);
  const recognitionRef = useRef<SpeechRecognitionControl | null>(null);
  const sessionRef = useRef<RecordingSession | null>(null);

  async function toggleRecording() {
    if (isRecording) {
      void finishRecording();
      return;
    }

    if (!navigator.mediaDevices) {
      setError(labels.noRecording);
      return;
    }

    try {
      setIsStarting(true);
      const session = await startRecordingSession();
      sessionRef.current = session;
      recognitionRef.current = startSpeechRecognition(
        recognitionLanguage,
        onTranscriptChange,
      );
      setError('');
      startLevelMeter(session.analyser);
      setIsRecording(true);
      setIsStarting(false);
    } catch {
      setError(labels.micNeeded);
      setIsStarting(false);
    }
  }

  async function finishRecording() {
    const session = sessionRef.current;
    if (!session) return;

    stopLevelMeter();
    setIsRecording(false);
    const transcript =
      recognitionRef.current?.getTranscript() ??
      '';
    const finalTranscript =
      (await recognitionRef.current?.stop()) ??
      transcript;
    const recording = session.stop();
    session.cleanup();
    recognitionRef.current = null;
    sessionRef.current = null;

    if (recording.size <= 44) {
      setError(labels.noRecording);
      return;
    }

    onRecordingReady(recording, finalTranscript.trim());
  }

  function startLevelMeter(analyser: AnalyserNode) {
    const updateLevel = () => {
      setLevel(getInputLevel(analyser));
      frameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  }

  function stopLevelMeter() {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = null;
    setLevel(0);
  }

  return (
    <div className="recorder-control">
      <button
        className={isRecording ? 'recorder-button recording' : 'recorder-button'}
        disabled={isStarting}
        onClick={toggleRecording}
        type="button"
      >
        <span className="recorder-button__icon" />
        <span>{isRecording ? labels.stop : labels.record}</span>
      </button>
      {isRecording && (
        <div className="recording-meter" aria-label="Microphone level">
          <span style={{ width: `${level}%` }} />
        </div>
      )}
      {error && <small>{error}</small>}
    </div>
  );
}
