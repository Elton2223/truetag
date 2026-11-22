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
  if (!f.brand_id || !f.name?.trim()) return redirect('/admin/brands?err=Missing+fields');
  const id = newId();
  const category = ['alcohol', 'tobacco', 'other'].includes(f.category) ? f.category : 'other';
  await query(
    `INSERT INTO products (id, brand_id, name, category, sku) VALUES (:id, :brandId, :name, :category, :sku)`,
    { id, brandId: f.brand_id, name: f.name.trim(), category, sku: f.sku || null },
  );
  return redirect(`/admin/products/${id}?ok=1`);
};
