import type { APIRoute } from 'astro';
import { verifyCode, type VerifyChannel } from '../../../lib/verify';
import { rateLimit } from '../../../lib/rateLimit';
import { clientIp, json, jsonError, readJson } from '../../../lib/request';

export const prerender = false;

async function handle(code: string, request: Request, channel?: string, city?: string | null) {
  const ip = clientIp(request);
  const rl = rateLimit(`verify:${ip}`);
  if (!rl.ok) {
    return jsonError('Too many checks. Try again shortly.', 429);
  }

  const ch = (channel || 'web') as VerifyChannel;
  const allowed: VerifyChannel[] = ['web', 'whatsapp', 'sms', 'api', 'demo'];
  const result = await verifyCode({
    rawCode: code,
    channel: allowed.includes(ch) ? ch : 'web',
    ip,
    cityApprox: city || null,
    userAgent: request.headers.get('user-agent'),
  });

  return json(result);
}

export const GET: APIRoute = async ({ request, url }) => {
  const code = url.searchParams.get('code') || '';
  const channel = url.searchParams.get('channel') || 'web';
  const city = url.searchParams.get('city');
  if (!code.trim()) return jsonError('Missing code');
  return handle(code, request, channel, city);
};

export const POST: APIRoute = async ({ request }) => {
  const body = await readJson<{ code?: string; channel?: string; city?: string }>(request);
  if (!body?.code?.trim()) return jsonError('Missing code');
  return handle(body.code, request, body.channel, body.city);
};
