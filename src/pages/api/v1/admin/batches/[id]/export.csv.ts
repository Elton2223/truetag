import type { APIRoute } from 'astro';
import { query, type Row } from '../../../../../../lib/db';
import { requireUser } from '../../../../../../lib/auth';
import { codesToCsv } from '../../../../../../lib/codes-service';

export const prerender = false;

export const GET: APIRoute = async ({ cookies, params }) => {
  const user = await requireUser(cookies, 'admin');
  if (!user) return new Response('Unauthorized', { status: 401 });

  const rows = await query<Row[]>(
    `SELECT code FROM codes WHERE batch_id = :id ORDER BY created_at ASC`,
    { id: params.id },
  );
  const csv = codesToCsv(rows.map((r) => r.code as string));
  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="truetag-batch-${params.id}.csv"`,
    },
  });
};
