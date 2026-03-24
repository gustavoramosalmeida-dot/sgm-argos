/**
 * Converte erros de fetch/API em mensagem amigável para a UI,
 * mantendo detalhe técnico opcional para diagnóstico (secundário).
 */
export function formatLoadError(
  error: unknown,
  userMessage: string
): { message: string; detail?: string } {
  const raw =
    error instanceof Error ? error.message : error != null ? String(error) : '';
  const trimmed = raw.trim();
  if (!trimmed) {
    return { message: userMessage };
  }
  const detail = trimmed.length > 320 ? `${trimmed.slice(0, 320)}…` : trimmed;
  return { message: userMessage, detail };
}
