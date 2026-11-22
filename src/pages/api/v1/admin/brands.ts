import type { APIRoute } from 'astro';
import { query } from '../../../../lib/db';
import { requireUser, hashPassword } from '../../../../lib/auth';
import { newId } from '../../../../lib/id';
import { readForm, redirect } from '../../../../lib/form';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = await requireUser(cookies, 'admin');
  if (!user) return redirect('/admin/login');

  const f = await readForm(request);
  const name = f.name?.trim();
  if (!name) return redirect('/admin/brands?err=Name+required');

  const id = newId();
  const status = f.status === 'verified' ? 'verified' : 'pending';
  await query(
    `INSERT INTO brands (id, name, reg_number, licence_notes, status, contact_email)
     VALUES (:id, :name, :reg, :notes, :status, :email)`,
    {
      id,
      name,
      reg: f.reg_number || null,
      notes: f.licence_notes || null,
      status,
      email: f.contact_email || null,
    },
  );

  if (f.user_email && f.user_password) {
    await query(
      `INSERT INTO users (id, email, password_hash, role, brand_id, name)
       VALUES (:id, :email, :hash, 'brand', :brandId, :name)`,
      {
        id: newId(),
        email: f.user_email.trim().toLowerCase(),
        hash: await hashPassword(f.user_password),
        brandId: id,
        name: f.user_email.split('@')[0],
      },
    );
  }

  return redirect(`/admin/brands/${id}?ok=1`);
};
