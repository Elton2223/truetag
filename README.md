# True Tag

Independent product authentication for South Africa — Astro SSR + MySQL (XAMPP locally).

## Local setup (XAMPP)

1. Start **MySQL** in the XAMPP Control Panel (Apache is optional; this app runs on Node).
2. Copy env: `cp .env.example .env` (defaults use `root` with an empty password and database `truetag`).
3. Install and migrate:

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

### Seed logins

| Role  | Email                 | Password  |
|-------|-----------------------|-----------|
| Admin | admin@truetag.co.za   | admin123  |
| Brand | brand@example.com     | brand123  |

### Demo codes

- `TT-DEMO-1001` — genuine
- `TT-DEMO-2002` — suspicious
- `TT-DEMO-3003` — not found

## Key URLs

- `/verify`, `/demo` — live verification
- `/report` — consumer fake reports
- `/admin` — staff (vet brands, generate codes)
- `/portal` — brand dashboard
- `/api/v1/health`, `/api/v1/verify`, `/api/v1/integration/manifest`

## Notes

“Genuine” means issued by the brand through True Tag and behaving normally — not a government certificate.
