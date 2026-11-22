import type { APIRoute } from 'astro';
import { query, type Row } from '../../../../lib/db';
import { json, jsonError, readJson } from '../../../../lib/request';

export const prerender = false;

/** Stub claim endpoint — marks eligible → claimed */
export const POST: APIRoute = async ({ request }) => {
  const body = await readJson<{ token?: string }>(request);
  if (!body?.token) return jsonError('Missing token');

  const rows = await query<Row[]>(
    `SELECT rc.id, rc.status, rc.claim_token, camp.title, camp.message
     FROM reward_claims rc
     JOIN reward_campaigns camp ON camp.id = rc.campaign_id
     WHERE rc.claim_token = :token LIMIT 1`,
    { token: body.token },
  );
  const claim = rows[0];
  if (!claim) return jsonError('Unknown token', 404);
  if (claim.status !== 'eligible' && claim.status !== 'claimed') {
    return jsonError(`Claim is ${claim.status}`, 409);
  }

  if (claim.status === 'eligible') {
    await query(
      `UPDATE reward_claims SET status = 'claimed', claimed_at = NOW() WHERE id = :id`,
      { id: claim.id },
    );
  }

  return json({
    ok: true,
    status: 'claimed',
    title: claim.title,
    message: claim.message,
    note: 'Redemption fulfilment is stubbed — brand staff handle manually for now.',
  });
};
