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
  if (!f.title?.trim() || !f.message?.trim()) return redirect('/portal/rewards?err=Missing');

  let productId: string | null = f.product_id || null;
  if (productId) {
    const owned = await query<Row[]>(
      `SELECT id FROM products WHERE id = :id AND brand_id = :brandId`,
      { id: productId, brandId: user.brandId },
    );
    if (!owned[0]) productId = null;
  }

  await query(
    `INSERT INTO reward_campaigns (id, brand_id, product_id, title, message, claim_limit, active)
     VALUES (:id, :brandId, :productId, :title, :message, :limit, 1)`,
    {
      id: newId(),
      brandId: user.brandId,
      productId,
      title: f.title.trim(),
      message: f.message.trim(),
      limit: Number(f.claim_limit || 1),
    },
  );
  return redirect('/portal/rewards?ok=1');
};
