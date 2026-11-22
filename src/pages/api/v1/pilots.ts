import type { APIRoute } from 'astro';
import { query } from '../../../lib/db';
import { newId } from '../../../lib/id';
import { rateLimit } from '../../../lib/rateLimit';
import { clientIp, json, jsonError, readJson } from '../../../lib/request';
import { readForm, redirect } from '../../../lib/form';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const ip = clientIp(request);
  if (!rateLimit(`pilot:${ip}`, 10).ok) return jsonError('Too many requests', 429);

  const ct = request.headers.get('content-type') || '';
  let company = '';
  let name = '';
  let email = '';
  let type = '';
  let message = '';

  if (ct.includes('application/json')) {
    const body = await readJson<{
      company?: string;
      name?: string;
      email?: string;
      type?: string;
      msg?: string;
      message?: string;
    }>(request);
    company = body?.company || '';
    name = body?.name || '';
    email = body?.email || '';
    type = body?.type || '';
    message = body?.msg || body?.message || '';
  } else {
    const f = await readForm(request);
    company = f.company || '';
    name = f.name || '';
    email = f.email || '';
    type = f.type || '';
    message = f.msg || f.message || '';
  }

  if (!company.trim() || !name.trim() || !email.trim()) {
    if (ct.includes('application/json')) return jsonError('Missing fields');
    return redirect('/brands?err=1#pilot');
  }

  await query(
    `INSERT INTO pilot_requests (id, company, contact_name, email, product_type, message)
     VALUES (:id, :company, :name, :email, :type, :message)`,
    {
      id: newId(),
      company: company.trim(),
      name: name.trim(),
      email: email.trim(),
      type: type || 'Other',
      message: message || null,
    },
  );

  if (ct.includes('application/json')) return json({ ok: true });
  return redirect('/brands?ok=1#pilot');
};
