/**
 * Baixa um recurso por URL (relativa ou absoluta) como ficheiro.
 */
export async function downloadFromUrl(url: string, filename: string): Promise<void> {
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Falha ao baixar (${response.status})`);
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
