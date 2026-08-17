// AI-функция через Google Gemini.
// Вызов с фронта: supabase.functions.invoke('ai', { body: { prompt, system, audio? } })
//
// Запуск (один раз):
//   1) Добавь GEMINI_API_KEY в локальный .env.local или .env
//   2) Загрузи секрет:  npm run ai:secret
//   3) Задеплой:        npm run ai:deploy

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? Deno.env.get('gemini_api_key');
const MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: unknown }>;
    };
  }>;
  error?: { message?: unknown };
  output_text?: unknown;
  steps?: Array<{
    content?: Array<{ text?: unknown; type?: unknown }>;
    type?: unknown;
  }>;
};

type AiRequestBody = {
  audio?: {
    data?: unknown;
    mimeType?: unknown;
  };
  prompt?: unknown;
  system?: unknown;
};

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Используй POST-запрос' }, 405);

  try {
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return json({ error: 'AI пока не настроен. Проверь GEMINI_API_KEY.' }, 503);
    }

    const body = (await req.json()) as AiRequestBody;
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const system = typeof body.system === 'string' ? body.system.trim() : '';
    const audio = parseAudio(body.audio);

    if (!prompt) return json({ error: 'Напиши запрос для AI.' }, 400);
    if (prompt.length > 10_000 || system.length > 5_000) {
      return json({ error: 'Запрос слишком длинный. Сделай его короче.' }, 400);
    }
    if (audio && audio.data.length > 12_000_000) {
      return json({ error: 'Аудио слишком длинное. Запиши короче.' }, 400);
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify(createGeminiRequest(prompt, system, audio)),
      },
    );

    const data = (await response.json()) as GeminiResponse;
    if (!response.ok) {
      console.error('Gemini request failed', response.status, data);
      return json({
        detail: getGeminiError(data),
        text: '',
        warning: 'AI сейчас не ответил. Используем запасной ответ.',
        status: response.status,
      });
    }

    const text = getText(data);
    if (typeof text !== 'string' || !text.trim()) {
      console.error('Gemini returned an empty response', data);
      return json({ text: '', warning: 'AI вернул пустой ответ. Используем запасной ответ.' });
    }

    return json({ text });
  } catch (error) {
    console.error('AI function failed', error);
    return json({ text: '', warning: 'Не получилось обратиться к AI. Используем запасной ответ.' });
  }
});

function parseAudio(audio: AiRequestBody['audio']) {
  const data = typeof audio?.data === 'string' ? audio.data : '';
  const mimeType = typeof audio?.mimeType === 'string' ? audio.mimeType : '';
  if (!data || !mimeType.startsWith('audio/')) return null;
  return { data, mimeType: normalizeMimeType(mimeType) };
}

function createGeminiRequest(prompt: string, system: string, audio: ReturnType<typeof parseAudio>) {
  const parts: Array<
    | { text: string }
    | { inline_data: { data: string; mime_type: string } }
  > = [{ text: prompt }];

  if (audio) {
    parts.push({
      inline_data: {
        data: audio.data,
        mime_type: audio.mimeType,
      },
    });
  }

  return {
    contents: [{ role: 'user', parts }],
    systemInstruction: system ? { parts: [{ text: system }] } : undefined,
  };
}

function getText(data: GeminiResponse) {
  const candidateText = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter((text): text is string => typeof text === 'string')
    .join('')
    .trim();
  if (candidateText) return candidateText;
  if (typeof data.output_text === 'string') return data.output_text;
  return data.steps
    ?.find((step) => step.type === 'model_output')
    ?.content?.find((part) => part.type === 'text' && typeof part.text === 'string')
    ?.text;
}

function getGeminiError(data: GeminiResponse) {
  return typeof data.error?.message === 'string' ? data.error.message.slice(0, 240) : '';
}

function normalizeMimeType(mimeType: string) {
  if (mimeType === 'audio/x-aiff') return 'audio/aiff';
  if (mimeType === 'audio/x-wav') return 'audio/wav';
  return mimeType;
}
