import { randomBytes } from 'node:crypto';

/** Crockford base32 — no 0/O/1/I ambiguity */
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function normalizeCode(raw: string): string {
  // Uppercase + strip junk only. Do not remap O/I/L — demo codes use letters like DEMO,
  // and generated codes already use Crockford alphabet without ambiguous glyphs.
  return raw.trim().toUpperCase().replace(/[^0-9A-Z-]/g, '');
}

function randomChars(n: number): string {
  const bytes = randomBytes(n);
  let out = '';
  for (let i = 0; i < n; i++) out += ALPHABET[bytes[i]! % ALPHABET.length];
  return out;
}

/** Format: TT-XXXX-XXXX-XXXX (12 Crockford chars) */
export function generateCode(): string {
  const body = randomChars(12);
  return `TT-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}`;
}

export const CODE_ALPHABET = ALPHABET;
export const CODE_PATTERN = /^TT-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/;
