type SpeechRecognitionResultItem = {
  isFinal: boolean;
  0: { transcript: string };
};

type SpeechRecognitionResultList = {
  length: number;
  [index: number]: SpeechRecognitionResultItem;
};

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type SpeechWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

export type SpeechRecognitionControl = {
  getTranscript: () => string;
  stop: () => Promise<string>;
};

export function startSpeechRecognition(
  language: string,
  onTranscriptChange: (transcript: string) => void,
): SpeechRecognitionControl | null {
  const SpeechRecognitionClass =
    (window as SpeechWindow).SpeechRecognition ||
    (window as SpeechWindow).webkitSpeechRecognition;

  if (!SpeechRecognitionClass) return null;

  const recognition = new SpeechRecognitionClass();
  let finalTranscript = '';
  let interimTranscript = '';
  let isStopping = false;
  let restartTimer = 0;

  recognition.lang = language;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onerror = () => undefined;
  recognition.onend = () => {
    if (isStopping) return;
    restartTimer = window.setTimeout(() => {
      try {
        recognition.start();
      } catch {
        // Some browsers throw if recognition is already active.
      }
    }, 180);
  };
  recognition.onresult = (event) => {
    interimTranscript = '';

    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      if (result.isFinal) {
        finalTranscript = `${finalTranscript} ${result[0].transcript}`.trim();
      } else {
        interimTranscript = `${interimTranscript} ${result[0].transcript}`.trim();
      }
    }

    onTranscriptChange(getCurrentTranscript());
  };

  recognition.start();

  function getCurrentTranscript() {
    return `${finalTranscript} ${interimTranscript}`.trim();
  }

  return {
    getTranscript: getCurrentTranscript,
    stop: () =>
      new Promise((resolve) => {
        const finish = () => resolve(getCurrentTranscript());
        window.clearTimeout(restartTimer);
        recognition.onend = finish;

        if (isStopping) {
          finish();
          return;
        }

        isStopping = true;
        recognition.stop();
        window.setTimeout(finish, 900);
      }),
  };
}
