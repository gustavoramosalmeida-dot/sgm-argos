/**
 * Valida returnUrl pós-login (evita open redirect).
 * Permite caminhos relativos internos e, em dev, http(s)://localhost|127.0.0.1 com portas do app apontando para /q ou rotas SGM.
 */
export function getSafeReturnUrl(raw: string | null | undefined, fallback = '/plants'): string {
  if (raw == null || typeof raw !== 'string') return fallback;
  const s = raw.trim();
  if (!s) return fallback;

  try {
    if (s.startsWith('/')) {
      if (s.startsWith('//') || s.startsWith('/\\')) return fallback;
      if (s.startsWith('/login')) return fallback;
      return s;
    }

    const u = new URL(s);
    if (typeof window !== 'undefined' && u.origin === window.location.origin) {
      if (u.pathname.startsWith('/login')) return fallback;
      return s;
    }

    const isLocal = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
    const portOk = u.port === '5173' || u.port === '3333' || u.port === '4173' || u.port === '';
    if (import.meta.env.DEV && isLocal && portOk) {
      if (u.port === '3333' && u.pathname.startsWith('/q/')) {
        return `${u.pathname}${u.search}${u.hash}`;
      }
      if (
        u.pathname.startsWith('/q/') ||
        u.pathname.startsWith('/machines/') ||
        u.pathname.startsWith('/plants')
      ) {
        return s;
      }
    }

    return fallback;
  } catch {
    return fallback;
  }
}
