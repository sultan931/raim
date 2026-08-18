import { useEffect, useState } from 'react';
import { createParentInvite } from '../lib/parentInvite';
import { loadCurrentProfile } from '../lib/roles';
import './ParentInvitePanel.css';

export function ParentInvitePanel() {
  const [childName, setChildName] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [message, setMessage] = useState('');
  const [isKid, setIsKid] = useState(false);

  useEffect(() => {
    void loadCurrentProfile().then((profile) => {
      setIsKid(profile?.role === 'kid');
      setChildName(profile?.display_name ?? '');
    });
  }, []);

  if (!isKid) return null;

  async function handleCreateInvite() {
    setMessage('');
    const link = await createParentInvite(childName);
    setInviteLink(link);
    setMessage(link ? 'Ссылка готова.' : 'Сначала войди в аккаунт ребёнка.');
  }

  async function handleCopy() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setMessage('Ссылка скопирована.');
  }

  async function handleShare() {
    if (!inviteLink || !navigator.share) {
      await handleCopy();
      return;
    }

    await navigator.share({
      title: 'Jey diary parent invite',
      text: `${childName || 'Someone'} invites you to be their parent in Jey diary.`,
      url: inviteLink,
    });
  }

  return (
    <section className="parent-invite-panel">
      <div>
        <p className="eyebrow">Parent link</p>
        <h2>Добавить родителя</h2>
        <p>Родитель увидит только то, что ты разрешишь в настройках приватности.</p>
      </div>
      <div className="parent-invite-panel__actions">
        <button onClick={handleCreateInvite} type="button">
          Создать invite link
        </button>
        {inviteLink && (
          <>
            <button className="ghost" onClick={handleCopy} type="button">
              <span className="invite-icon invite-icon--copy" aria-hidden="true" />
              <span>Copy</span>
            </button>
            <button className="ghost" onClick={handleShare} type="button">
              <span className="invite-icon invite-icon--share" aria-hidden="true" />
              <span>Share</span>
            </button>
          </>
        )}
      </div>
      {inviteLink && <input readOnly value={inviteLink} />}
      {message && <small>{message}</small>}
    </section>
  );
}
