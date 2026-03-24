const PREFIX = "SGM-ATV-";

/** Formata o número da sequence em código público oficial (máx. 15 caracteres). */
export function formatPublicCodeFromSequence(seq: number): string {
  if (!Number.isInteger(seq) || seq < 1 || seq > 999_999) {
    throw new Error("Invalid sequence for public_code");
  }
  return `${PREFIX}${String(seq).padStart(6, "0")}`;
}

export const PUBLIC_CODE_PATTERN = /^SGM-ATV-\d{6}$/;

export function isValidPublicCodeFormat(value: string): boolean {
  return PUBLIC_CODE_PATTERN.test(value);
}
