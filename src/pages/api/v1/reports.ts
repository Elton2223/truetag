import type { APIRoute } from 'astro';
import { query, type Row } from '../../../lib/db';
import { normalizeCode } from '../../../lib/codes';
import { newId } from '../../../lib/id';
import { rateLimit } from '../../../lib/rateLimit';
import { clientIp, json, jsonError, readJson } from '../../../lib/request';
import { readForm, redirect } from '../../../lib/form';

export const prerender = false;

async function createReport(input: {
  codeText?: string;
  message: string;
  email?: string;
  phone?: string;
  city?: string;
}) {
  const message = input.message.trim();
  if (!message) throw new Error('Message required');

  let codeId: string | null = null;
  let brandId: string | null = null;
  const codeText = input.codeText ? normalizeCode(input.codeText) : null;
  if (codeText) {
    const rows = await query<Row[]>(
      `SELECT c.id, p.brand_id FROM codes c
       JOIN batches b ON b.id = c.batch_id
       JOIN products p ON p.id = b.product_id
       WHERE c.code = :code LIMIT 1`,
      { code: codeText },
    );
    if (rows[0]) {
      codeId = rows[0].id;
      brandId = rows[0].brand_id;
    }
  }

  const id = newId();
  await query(
    `INSERT INTO consumer_reports (id, code_id, code_text, brand_id, reporter_email, reporter_phone, message, city_approx)
     VALUES (:id, :codeId, :codeText, :brandId, :email, :phone, :message, :city)`,
    {
      id,
      codeId,
      codeText,
      brandId,
      email: input.email || null,
      phone: input.phone || null,
      message,
      city: input.city || null,
    },
  );
  return id;
}

export const POST: APIRoute = async ({ request }) => {
  const ip = clientIp(request);
  const rl = rateLimit(`report:${ip}`, 20);
  if (!rl.ok) return jsonError('Too many reports', 429);

  const ct = request.headers.get('content-type') || '';
  try {
    if (ct.includes('application/json')) {
      const body = await readJson<{
        code?: string;
        message?: string;
        email?: string;
        phone?: string;
        city?: string;
      }>(request);
      if (!body?.message) return jsonError('Message required');
      const id = await createReport({
        codeText: body.code,
        message: body.message,
        email: body.email,
        phone: body.phone,
        city: body.city,
      });
      return json({ ok: true, id });
    }

    const f = await readForm(request);
    await createReport({
      codeText: f.code,
      message: f.message || '',
      email: f.email,
      phone: f.phone,
      city: f.city,
    });
    return redirect('/report?ok=1');
  } catch (e) {
    if (ct.includes('application/json')) return jsonError(String(e), 400);
    return redirect('/report?err=1');
  }
};
