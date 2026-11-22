import type { APIRoute } from 'astro';
import { query } from '../../../../lib/db';
import { requireUser } from '../../../../lib/auth';
import { newId } from '../../../../lib/id';
import { readForm, redirect } from '../../../../lib/form';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = await requireUser(cookies, 'admin');
  if (!user) return redirect('/admin/login');
  const f = await readForm(request);
  if (!f.product_id || !f.label?.trim()) return redirect('/admin/brands?err=Missing+fields');
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
  return redirect(`/admin/batches/${id}?ok=1`);
};
