export function friendlyErrorMessage(error: unknown) {
  const message = getMessage(error).toLowerCase();

  if (message.includes('invalid login') || message.includes('invalid credentials')) {
    return 'Похоже, email или пароль не подошли. Проверь их и попробуй ещё раз.';
  }

  if (message.includes('already registered') || message.includes('already exists')) {
    return 'Такой email уже зарегистрирован. Попробуй войти или используй другой email.';
  }

  if (message.includes('email') && message.includes('confirm')) {
    return 'Нужно подтвердить email. Проверь почту и попробуй войти снова.';
  }

  if (message.includes('network') || message.includes('failed to fetch')) {
    return 'Не получилось связаться с сервером. Проверь интернет и попробуй ещё раз.';
  }

  if (message.includes('row-level security') || message.includes('permission')) {
    return 'Пока нет доступа к этим данным. Попробуй войти снова.';
  }

  return 'Что-то не получилось. Попробуй ещё раз через минуту.';
}

function getMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }

  return '';
}
