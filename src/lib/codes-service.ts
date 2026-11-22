import { query } from './db';
import { generateCode } from './codes';
import { newId } from './id';
import { siteUrl } from './request';

export async function generateCodesForBatch(batchId: string, count: number, scanLimit = 5): Promise<string[]> {
  const n = Math.min(Math.max(1, count), 5000);
  const codes: string[] = [];
  for (let i = 0; i < n; i++) {
    let code = generateCode();
    let attempts = 0;
    while (attempts < 5) {
      try {
        await query(
          `INSERT INTO codes (id, batch_id, code, status, scan_count, scan_limit)
           VALUES (:id, :batchId, :code, 'active', 0, :scanLimit)`,
          { id: newId(), batchId, code, scanLimit },
        );
        codes.push(code);
        break;
      } catch {
        code = generateCode();
        attempts += 1;
      }
    }
  }
  return codes;
}

export function verifyUrlForCode(code: string): string {
  const base = siteUrl().replace(/\/$/, '');
  return `${base}/verify?code=${encodeURIComponent(code)}`;
}

export function codesToCsv(codes: string[]): string {
  const lines = ['code,verify_url'];
  for (const c of codes) {
    lines.push(`${c},${verifyUrlForCode(c)}`);
  }
  return lines.join('\n') + '\n';
}
