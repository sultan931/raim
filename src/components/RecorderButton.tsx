import { useRef, useState } from 'react';

type RecorderButtonProps = {
  labels: {
    micNeeded: string;
    noRecording: string;
    record: string;
    stop: string;
  };
  onRecordingReady: (blob: Blob) => void;
};

export function RecorderButton({ labels, onRecordingReady }: RecorderButtonProps) {
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function toggleRecording() {
    if (isRecording) {
      recorderRef.current?.stop();
      return;
    }

    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setError(labels.noRecording);
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setError('');
    } catch {
      setError(labels.micNeeded);
      return;
    }

    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      onRecordingReady(new Blob(chunksRef.current, { type: recorder.mimeType }));
    };

    recorder.start();
    setIsRecording(true);
  }

  return (
    <div className="recorder-control">
      <button className="ghost" onClick={toggleRecording} type="button">
        {isRecording ? labels.stop : labels.record}
      </button>
      {error && <small>{error}</small>}
    </div>
  );
}
