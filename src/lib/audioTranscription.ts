import { isSupabaseConfigured, supabase } from './supabase';
import { languageNames, type Language } from './language';

export async function transcribeAudio(blob: Blob, language: Language) {
  if (!isSupabaseConfigured) return '';

  const data = await blobToBase64(blob);
  const prompt = [
    `Transcribe this child diary voice note in ${languageNames[language]}.`,
    'Return only the words that were spoken.',
    'If speech is unclear, return the clearest short transcript you can.',
    'Do not add commentary, punctuation guesses are okay.',
  ].join('\n');

  try {
    const { data: response, error } = await withTimeout(
      supabase.functions.invoke('ai', {
        body: {
          prompt,
          audio: {
            data,
            mimeType: blob.type || 'audio/wav',
          },
        },
      }),
    );

    if (error || !isTranscriptResponse(response)) return '';
    return response.text.trim();
  } catch {
    return '';
  }
}

function withTimeout<T>(promise: Promise<T>) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error('Audio transcription timed out')), 18_000);
    }),
  ]);
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read audio'));
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      resolve(result.split(',')[1] ?? '');
    };
    reader.readAsDataURL(blob);
  });
}

function isTranscriptResponse(data: unknown): data is { text: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'text' in data &&
    typeof (data as { text?: unknown }).text === 'string'
  );
}
