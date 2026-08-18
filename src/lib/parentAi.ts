import type { ParentSharedEvent } from './parentSharing';
import { isSupabaseConfigured, supabase } from './supabase';

const system = [
  'You are Jey, helping a parent understand their child gently.',
  'Use only the shared child context provided in the prompt.',
  'Respect privacy: if the child shared mood only, never invent diary details.',
  'Give calm advice, follow-up questions, and small next steps.',
  'Do not diagnose. Do not make the parent panic.',
].join('\n');

export async function askParentJey(question: string, events: ParentSharedEvent[]) {
  if (!isSupabaseConfigured) return fallbackParentReply(events);

  const context = events
    .slice(0, 8)
    .map((event) => {
      const detail = event.privacy === 'parent' ? event.child_text : 'Diary text is private.';
      return `Mood: ${event.mood}\nShared: ${event.summary}\nDetail: ${detail}`;
    })
    .join('\n---\n');

  const prompt = [
    'Parent question:',
    question,
    'Shared child context:',
    context || 'No shared context yet.',
    'Answer with 2-4 short sentences.',
  ].join('\n');

  try {
    const { data, error } = await supabase.functions.invoke('ai', {
      body: { prompt, system },
    });
    if (error || !isTextResponse(data) || !data.text.trim()) return fallbackParentReply(events);
    return data.text;
  } catch {
    return fallbackParentReply(events);
  }
}

function fallbackParentReply(events: ParentSharedEvent[]) {
  const latest = events[0];
  if (!latest) {
    return 'Jey пока не видит сообщений от ребёнка. Когда ребёнок сам поделится настроением или записью, я помогу понять, как мягко поддержать.';
  }

  if (latest.privacy === 'mood') {
    return `Ребёнок поделился только настроением: ${latest.mood}. Лучше начать мягко: "Я рядом, если хочешь рассказать". Детали дневника остаются личными.`;
  }

  return `Ребёнок разрешил увидеть часть дня. Начните с отражения без давления: "Я услышал(а), что это было важно для тебя". Потом спросите, нужна ли поддержка или просто внимание.`;
}

function isTextResponse(data: unknown): data is { text: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'text' in data &&
    typeof (data as { text?: unknown }).text === 'string'
  );
}
