/** Only same-site paths are followed after login, so a crafted ?next= link can't send users elsewhere. */
export function safeNextPath(value: string | null, fallback = '/dashboard') {
  return value && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : fallback
}
