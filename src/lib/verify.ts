import { randomBytes } from 'node:crypto';
import { query, type Row } from './db';
import { normalizeCode } from './codes';
import { newId } from './id';
import { hashIp } from './auth';
import { verdictCopy, type Verdict } from '../content/site';

export type VerifyChannel = 'web' | 'whatsapp' | 'sms' | 'api' | 'demo';

export type VerifyResult = {
  verdict: Verdict;
  code: string;
  product: string | null;
  brand: string | null;
  batch: string | null;
  detail: string;
  advice: string;
  rewardEligible?: boolean;
  rewardToken?: string;
};

const CITY_WINDOW_HOURS = 24;
const CITY_THRESHOLD = 2;

type CodeRow = Row & {
  id: string;
  code: string;
  status: string;
  scan_count: number;
  scan_limit: number;
  batch_id: string;
  batch_label: string;
  product_name: string;
  brand_id: string;
  brand_name: string;
  brand_status: string;
};

export async function verifyCode(opts: {
  rawCode: string;
  channel?: VerifyChannel;
  ip?: string;
  cityApprox?: string | null;
  userAgent?: string | null;
}): Promise<VerifyResult> {
  const code = normalizeCode(opts.rawCode);
  const channel = opts.channel ?? 'web';
  const copy = (v: Verdict, detail?: string): VerifyResult => ({
    verdict: v,
    code,
    product: null,
    brand: null,
    batch: null,
    detail: detail ?? verdictCopy[v].text,
    advice: verdictCopy[v].advice,
  });

  if (!code) return copy('invalid');

  const rows = await query<CodeRow[]>(
    `SELECT c.id, c.code, c.status, c.scan_count, c.scan_limit, c.batch_id,
            b.label AS batch_label, p.name AS product_name, p.id AS product_id,
            br.id AS brand_id, br.name AS brand_name, br.status AS brand_status
     FROM codes c
     JOIN batches b ON b.id = c.batch_id
     JOIN products p ON p.id = b.product_id
     JOIN brands br ON br.id = p.brand_id
     WHERE c.code = :code
     LIMIT 1`,
    { code },
  );

  const row = rows[0];
  if (!row || row.brand_status !== 'verified' || row.status === 'revoked') {
    return copy('invalid');
  }

  const newCount = Number(row.scan_count) + 1;
  let verdict: Verdict = 'genuine';
  let detail = `Scan ${newCount} of ${row.scan_limit} allowed. Batch ${row.batch_label}.`;

  if (newCount > Number(row.scan_limit) || row.status === 'flagged') {
    verdict = 'suspicious';
    detail = `Scanned ${newCount} times (limit ${row.scan_limit}). Batch ${row.batch_label}.`;
  } else if (opts.cityApprox) {
    const cities = await query<Row[]>(
      `SELECT DISTINCT city_approx AS city FROM scan_events
       WHERE code_id = :id AND city_approx IS NOT NULL AND city_approx != ''
         AND created_at > DATE_SUB(NOW(), INTERVAL ${CITY_WINDOW_HOURS} HOUR)`,
      { id: row.id },
    );
    const set = new Set(cities.map((c) => String(c.city).toLowerCase()));
    set.add(opts.cityApprox.toLowerCase());
    if (set.size > CITY_THRESHOLD) {
      verdict = 'suspicious';
      detail = `Scanned in several places within ${CITY_WINDOW_HOURS}h. Batch ${row.batch_label}.`;
    }
  }

  const flagSql =
    verdict === 'suspicious'
      ? `, status = 'flagged'`
      : '';

  await query(
    `UPDATE codes SET scan_count = :n${flagSql} WHERE id = :id`,
    { n: newCount, id: row.id },
  );

  const eventId = newId();
  await query(
    `INSERT INTO scan_events (id, code_id, channel, verdict, ip_hash, city_approx, user_agent)
     VALUES (:id, :codeId, :channel, :verdict, :ipHash, :city, :ua)`,
    {
      id: eventId,
      codeId: row.id,
      channel,
      verdict,
      ipHash: opts.ip ? hashIp(opts.ip) : null,
      city: opts.cityApprox || null,
      ua: opts.userAgent?.slice(0, 500) || null,
    },
  );

  let rewardEligible = false;
  let rewardToken: string | undefined;

  if (verdict === 'genuine') {
    const campaigns = await query<Row[]>(
      `SELECT id, claim_limit FROM reward_campaigns
       WHERE brand_id = :brandId AND active = 1
         AND (product_id IS NULL OR product_id = :productId)
       ORDER BY created_at DESC LIMIT 1`,
      { brandId: row.brand_id, productId: (row as Row).product_id },
    );
    const campaign = campaigns[0];
    if (campaign) {
      const existing = await query<Row[]>(
        `SELECT id FROM reward_claims WHERE campaign_id = :cid AND code_id = :codeId LIMIT 1`,
        { cid: campaign.id, codeId: row.id },
      );
      if (!existing[0] && newCount === 1) {
        const token = randomToken();
        await query(
          `INSERT INTO reward_claims (id, campaign_id, code_id, claim_token, status)
           VALUES (:id, :cid, :codeId, :token, 'eligible')`,
          { id: newId(), cid: campaign.id, codeId: row.id, token },
        );
        rewardEligible = true;
        rewardToken = token;
      }
    }
  }

  return {
    verdict,
    code,
    product: row.product_name,
    brand: row.brand_name,
    batch: row.batch_label,
    detail,
    advice: verdictCopy[verdict].advice,
    rewardEligible,
    rewardToken,
  };
}

function randomToken(): string {
  return randomBytes(16).toString('hex');
}
