import type { APIRoute } from 'astro';
import { query, type Row } from '../../../../../lib/db';
import { requireUser } from '../../../../../lib/auth';
import { json, jsonError } from '../../../../../lib/request';

export const prerender = false;

export const GET: APIRoute = async ({ cookies, url }) => {
  const user = await requireUser(cookies, 'brand');
  if (!user?.brandId) return jsonError('Unauthorized', 401);

  const limit = Math.min(Number(url.searchParams.get('limit') || 50), 200);
  const rows = await query<Row[]>(
    `SELECT s.created_at, s.channel, s.verdict, s.city_approx, c.code, p.name AS product, b.label AS batch
     FROM scan_events s
     JOIN codes c ON c.id = s.code_id
     JOIN batches b ON b.id = c.batch_id
     JOIN products p ON p.id = b.product_id
     WHERE p.brand_id = :brandId
     ORDER BY s.created_at DESC
     LIMIT ${limit}`,
    { brandId: user.brandId },
  );
  return json({ scans: rows });
};
