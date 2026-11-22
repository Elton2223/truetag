import type { APIRoute } from 'astro';
import { query, type Row } from '../../../../../../../lib/db';
import { requireUser } from '../../../../../../../lib/auth';
import { codesToCsv } from '../../../../../../../lib/codes-service';

export const prerender = false;

export const GET: APIRoute = async ({ cookies, params }) => {
  const user = await requireUser(cookies, 'brand');
  if (!user?.brandId) return new Response('Unauthorized', { status: 401 });

  const owned = await query<Row[]>(
    `SELECT b.id FROM batches b JOIN products p ON p.id = b.product_id
     WHERE b.id = :id AND p.brand_id = :brandId`,
    { id: params.id, brandId: user.brandId },
  );
  if (!owned[0]) return new Response('Not found', { status: 404 });

  const rows = await query<Row[]>(
    `SELECT code FROM codes WHERE batch_id = :id ORDER BY created_at ASC`,
    { id: params.id },
  );
  return new Response(codesToCsv(rows.map((r) => r.code as string)), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="truetag-batch-${params.id}.csv"`,
    },
  });
};
