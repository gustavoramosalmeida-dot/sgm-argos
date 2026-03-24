const fetchOpts: RequestInit = { credentials: 'include' };

function notifyUnauthorized(url: string): void {
  if (typeof window === 'undefined') return;
  if (url.includes('/api/auth/me') || url.includes('/api/auth/login')) return;
  window.dispatchEvent(new CustomEvent('sgm-unauthorized'));
}

export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url, fetchOpts);

  if (response.status === 401) {
    notifyUnauthorized(url);
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }

  return response.json();
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (response.status === 401) {
    notifyUnauthorized(url);
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }
  return response.json();
}

export async function apiPut<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    ...fetchOpts,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (response.status === 401) {
    notifyUnauthorized(url);
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }
  return response.json();
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await fetch(url, { ...fetchOpts, method: 'DELETE' });
  if (response.status === 401) {
    notifyUnauthorized(url);
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }
  return response.json() as Promise<T>;
}
