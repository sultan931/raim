export type RecordingSession = {
  analyser: AnalyserNode;
  cleanup: () => void;
  stop: () => Blob;
};

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

export async function startRecordingSession(): Promise<RecordingSession> {
  const inputStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      autoGainControl: true,
      echoCancellation: true,
      noiseSuppression: true,
    },
  });
  const AudioContextClass =
    window.AudioContext || (window as AudioWindow).webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error('AudioContext is not supported');
  }

  const audioContext = new AudioContextClass();
  const source = audioContext.createMediaStreamSource(inputStream);
  const gain = audioContext.createGain();
  const analyser = audioContext.createAnalyser();
  const processor = audioContext.createScriptProcessor(4096, 1, 1);
  const chunks: Float32Array[] = [];

  gain.gain.value = 2.8;
  analyser.fftSize = 256;
  source.connect(gain);
  gain.connect(analyser);
  gain.connect(processor);
  processor.connect(audioContext.destination);

  processor.onaudioprocess = (event) => {
    chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
  };

  return {
    analyser,
    cleanup: () => {
      processor.disconnect();
      source.disconnect();
      gain.disconnect();
      inputStream.getTracks().forEach((track) => track.stop());
      void audioContext.close();
    },
    stop: () => encodeWav(chunks, audioContext.sampleRate),
  };
}

export function getInputLevel(analyser: AnalyserNode) {
  const samples = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteTimeDomainData(samples);
  const peak = samples.reduce((max, sample) => {
    return Math.max(max, Math.abs(sample - 128));
  }, 0);

  return Math.min(100, Math.round((peak / 64) * 100));
}

function encodeWav(chunks: Float32Array[], sampleRate: number) {
  const samples = mergeChunks(chunks);
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeText(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeText(view, 8, 'WAVE');
  writeText(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  samples.forEach((sample, index) => {
    const clampedSample = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + index * 2, clampedSample * 0x7fff, true);
  });

  return new Blob([view], { type: 'audio/wav' });
}

function mergeChunks(chunks: Float32Array[]) {
  const length = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const result = new Float32Array(length);
  let offset = 0;

  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });

  return result;
}

function writeText(view: DataView, offset: number, text: string) {
  Array.from(text).forEach((letter, index) => {
    view.setUint8(offset + index, letter.charCodeAt(0));
  });
}
