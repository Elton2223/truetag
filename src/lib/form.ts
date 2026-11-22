export async function readForm(request: Request): Promise<Record<string, string>> {
  const ct = request.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const body = (await request.json()) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(body)) out[k] = v == null ? '' : String(v);
    return out;
  }
  const fd = await request.formData();
  const out: Record<string, string> = {};
  for (const [k, v] of fd.entries()) out[k] = String(v);
  return out;
}

export function redirect(location: string, status = 303): Response {
  return new Response(null, { status, headers: { Location: location } });
}
