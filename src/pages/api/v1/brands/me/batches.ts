import type { APIRoute } from 'astro';
import { query, type Row } from '../../../../../lib/db';
import { requireUser } from '../../../../../lib/auth';
import { newId } from '../../../../../lib/id';
import { readForm, redirect } from '../../../../../lib/form';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = await requireUser(cookies, 'brand');
  if (!user?.brandId) return redirect('/portal/login');
  const f = await readForm(request);
  const owned = await query<Row[]>(
    `SELECT id FROM products WHERE id = :id AND brand_id = :brandId`,
    { id: f.product_id, brandId: user.brandId },
  );
  if (!owned[0] || !f.label?.trim()) return redirect('/portal/products?err=Invalid');
  const id = newId();
  await query(
    `INSERT INTO batches (id, product_id, label, manufactured_on, expires_on)
     VALUES (:id, :productId, :label, :mfg, :exp)`,
    {
      id,
      productId: f.product_id,
      label: f.label.trim(),
      mfg: f.manufactured_on || null,
      exp: f.expires_on || null,
    },
  );
  return redirect(`/portal/batches/${id}?ok=1`);
};
