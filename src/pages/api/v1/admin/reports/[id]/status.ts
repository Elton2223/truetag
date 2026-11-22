import type { APIRoute } from 'astro';
import { query } from '../../../../../../lib/db';
import { requireUser } from '../../../../../../lib/auth';
import { readForm, redirect } from '../../../../../../lib/form';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, params }) => {
  const user = await requireUser(cookies, 'admin');
  if (!user) return redirect('/admin/login');
  const f = await readForm(request);
  if (!['new', 'reviewed', 'escalated', 'closed'].includes(f.status)) {
    return redirect('/admin/reports?err=Bad+status');
  }
  await query(`UPDATE consumer_reports SET status = :status WHERE id = :id`, {
    status: f.status,
    id: params.id,
  });
  return redirect('/admin/reports?ok=1');
};
