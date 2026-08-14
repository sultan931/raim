export function wantsJeyTestMessage() {
  return new URLSearchParams(window.location.search).has('jeyTest');
}
