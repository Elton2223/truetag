import type { APIRoute } from 'astro';
import { query } from '../../../../lib/db';
import { newId } from '../../../../lib/id';
import { verifyCode } from '../../../../lib/verify';
import { rateLimit } from '../../../../lib/rateLimit';
import { clientIp, json, jsonError, readJson } from '../../../../lib/request';

export const prerender = false;

/**
 * Stub inbound webhook for WhatsApp / SMS providers.
 * Always logs to channel_outbox; runs verify when a code is present.
 * Does not send provider replies until WHATSAPP_TOKEN / SMS_PROVIDER_KEY are set.
 */
export const POST: APIRoute = async ({ request }) => {
  const ip = clientIp(request);
  if (!rateLimit(`channel:${ip}`, 120).ok) return jsonError('Too many requests', 429);

  const body = await readJson<{
    channel?: 'whatsapp' | 'sms';
    from?: string;
    text?: string;
    code?: string;
    city?: string;
  }>(request);

  const channel = body?.channel === 'sms' ? 'sms' : 'whatsapp';
  const text = body?.text || '';
  const code =
    body?.code ||
    text.match(/TT[-A-Z0-9]+/i)?.[0] ||
    text.trim();

  await query(
    `INSERT INTO channel_outbox (id, channel, direction, payload_json, related_code, status)
     VALUES (:id, :channel, 'inbound', :payload, :code, 'logged')`,
    {
      id: newId(),
      channel,
      payload: JSON.stringify(body || {}),
      code: code || null,
    },
  );

  let result = null;
  if (code) {
    result = await verifyCode({
      rawCode: code,
      channel,
      ip,
      cityApprox: body?.city || null,
      userAgent: request.headers.get('user-agent'),
    });

    const providersReady = Boolean(process.env.WHATSAPP_TOKEN || process.env.SMS_PROVIDER_KEY);
    await query(
      `INSERT INTO channel_outbox (id, channel, direction, payload_json, related_code, status)
       VALUES (:id, :channel, 'outbound', :payload, :code, :status)`,
      {
        id: newId(),
        channel,
        payload: JSON.stringify({
          to: body?.from,
          reply: result,
          note: providersReady
            ? 'Provider keys present — wire send adapter to deliver'
            : 'Stub only — no provider send',
        }),
        code: result.code,
        status: providersReady ? 'queued' : 'logged',
      },
    );
  }

  return json({
    ok: true,
    stub: !(process.env.WHATSAPP_TOKEN || process.env.SMS_PROVIDER_KEY),
    result,
  });
};
