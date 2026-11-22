import type { APIRoute } from 'astro';
import { query, type Row } from '../../../../../../lib/db';
import { requireUser } from '../../../../../../lib/auth';
import { generateCodesForBatch } from '../../../../../../lib/codes-service';
import { readForm, redirect } from '../../../../../../lib/form';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, params }) => {
  const user = await requireUser(cookies, 'admin');
  if (!user) return redirect('/admin/login');
  const batchId = params.id!;
  const rows = await query<Row[]>(`SELECT id FROM batches WHERE id = :id`, { id: batchId });
  if (!rows[0]) return redirect('/admin/brands?err=Batch+not+found');

  const f = await readForm(request);
  const count = Number(f.count || 10);
  const scanLimit = Number(f.scan_limit || 5);
  const codes = await generateCodesForBatch(batchId, count, scanLimit);
  return redirect(`/admin/batches/${batchId}?ok=1&n=${codes.length}`);
};
