import type { APIRoute } from 'astro';
import { query } from '../../../../../../lib/db';
import { requireUser } from '../../../../../../lib/auth';
import { readForm, redirect } from '../../../../../../lib/form';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, params }) => {
  const user = await requireUser(cookies, 'admin');
  if (!user) return redirect('/admin/login');
  const f = await readForm(request);
  const status = f.status;
  if (!['pending', 'verified', 'suspended'].includes(status)) {
    return redirect('/admin/brands?err=Bad+status');
  }
  await query(`UPDATE brands SET status = :status WHERE id = :id`, { status, id: params.id });
  return redirect('/admin/brands?ok=1');
};
