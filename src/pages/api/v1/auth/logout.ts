import type { APIRoute } from 'astro';
import { clearSessionCookie, destroySession, getSessionToken } from '../../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ cookies, request }) => {
  await destroySession(getSessionToken(cookies));
  clearSessionCookie(cookies);
  const accept = request.headers.get('accept') || '';
  if (accept.includes('text/html')) {
    return new Response(null, { status: 302, headers: { Location: '/' } });
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
