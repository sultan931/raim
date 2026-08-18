import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { acceptParentInvite, loadInvite, type ParentInvite } from '../lib/parentInvite';
import { saveCurrentProfile } from '../lib/roles';
import './InvitePage.css';

type InvitePageProps = {
  params: { token?: string };
};

export function InvitePage({ params }: InvitePageProps) {
  const token = params.token ?? '';
  const [invite, setInvite] = useState<ParentInvite | null>(null);
  const [message, setMessage] = useState('Загружаем приглашение...');
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    void loadInvite(token).then((loadedInvite) => {
      setInvite(loadedInvite);
      setMessage(
        loadedInvite
          ? `${loadedInvite.child_name} wants to add you as a parent.`
          : 'Это приглашение не найдено или уже истекло.',
      );
    });
  }, [token]);

  async function handleAccept() {
    if (!invite || isBusy) return;

    setIsBusy(true);
    await saveCurrentProfile('parent', 'Parent');
    const isAccepted = await acceptParentInvite(invite);
    setMessage(
      isAccepted
        ? 'Готово. Теперь Jey будет показывать только то, чем ребёнок сам поделится.'
        : 'Не получилось принять приглашение. Войди как родитель и попробуй ещё раз.',
    );
    setIsBusy(false);
  }

  return (
    <main className="invite-page">
      <section className="invite-card">
        <p className="eyebrow">Parent invite</p>
        <h1>Jey diary</h1>
        <p>{message}</p>
        <div className="invite-actions">
          <button disabled={!invite || isBusy} onClick={handleAccept} type="button">
            {isBusy ? 'Подключаем...' : 'Accept parent invite'}
          </button>
          <Link className="back-link" href="/register">
            Register / sign in
          </Link>
          <Link className="back-link" href="/parent">
            Parent chat
          </Link>
        </div>
      </section>
    </main>
  );
}
