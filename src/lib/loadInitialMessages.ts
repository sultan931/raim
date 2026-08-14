import { loadLanguage, loadMessages } from './diaryStorage';
import { addDueJeyFollowUps, addJeyTestMessage } from './proactiveJey';
import { wantsJeyTestMessage } from './testMessageMode';

export function loadInitialMessages() {
  const language = loadLanguage();
  const messages = addDueJeyFollowUps(loadMessages(language));
  return wantsJeyTestMessage() ? addJeyTestMessage(messages, language) : messages;
}
