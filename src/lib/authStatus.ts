const registeredUserKey = 'jey-registered-user';
const authStatusEvent = 'jey-auth-status-change';

export function rememberRegisteredUser() {
  localStorage.setItem(registeredUserKey, 'true');
  window.dispatchEvent(new Event(authStatusEvent));
}

export function forgetRegisteredUser() {
  localStorage.removeItem(registeredUserKey);
  window.dispatchEvent(new Event(authStatusEvent));
}

export function hasRememberedRegisteredUser() {
  return localStorage.getItem(registeredUserKey) === 'true';
}

export function subscribeToRememberedUserChange(onChange: () => void) {
  window.addEventListener(authStatusEvent, onChange);
  window.addEventListener('storage', onChange);

  return () => {
    window.removeEventListener(authStatusEvent, onChange);
    window.removeEventListener('storage', onChange);
  };
}
