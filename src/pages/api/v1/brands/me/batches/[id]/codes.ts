import type { APIRoute } from 'astro';
import { query, type Row } from '../../../../../../../lib/db';
import { requireUser } from '../../../../../../../lib/auth';
import { generateCodesForBatch } from '../../../../../../../lib/codes-service';
import { readForm, redirect } from '../../../../../../../lib/form';
import { json, readJson } from '../../../../../../../lib/request';

export const prerender = false;

async function assertOwnedBatch(batchId: string, brandId: string) {
  const rows = await query<Row[]>(
    `SELECT b.id FROM batches b JOIN products p ON p.id = b.product_id
     WHERE b.id = :id AND p.brand_id = :brandId`,
    { id: batchId, brandId },
  );
  return rows[0];
}

export const POST: APIRoute = async ({ request, cookies, params }) => {
  const user = await requireUser(cookies, 'brand');
  if (!user?.brandId) return redirect('/portal/login');
  const batchId = params.id!;
  if (!(await assertOwnedBatch(batchId, user.brandId))) {
    return redirect('/portal/products?err=Not+found');
  }

  const ct = request.headers.get('content-type') || '';
  let count = 10;
  let scanLimit = 5;
  if (ct.includes('application/json')) {
    const body = await readJson<{ count?: number; scan_limit?: number }>(request);
    count = Number(body?.count || 10);
    scanLimit = Number(body?.scan_limit || 5);
    const codes = await generateCodesForBatch(batchId, count, scanLimit);
    return json({ ok: true, count: codes.length, codes });
  }

  const f = await readForm(request);
  count = Number(f.count || 10);
  scanLimit = Number(f.scan_limit || 5);
  const codes = await generateCodesForBatch(batchId, count, scanLimit);
  return redirect(`/portal/batches/${batchId}?ok=1&n=${codes.length}`);
};
