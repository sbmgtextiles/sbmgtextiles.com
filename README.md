# SBMG Digital Platform V2

A Next.js + Supabase wholesale kidswear website with:

- Premium public homepage
- Dynamic product catalogue
- Product detail pages
- PDF catalogue downloads
- Admin dashboard
- Product image uploads
- PDF catalogue uploads
- Dealer enquiry database
- Supabase authentication and storage

## 1. Create Supabase project

1. Create a project at Supabase.
2. Open **SQL Editor**.
3. Run `supabase/schema.sql`.
4. Open **Authentication → Users** and create the first admin user.
5. Copy Project URL, anon key and service-role key.

## 2. Configure the project

Copy `.env.example` to `.env.local` and enter your keys.

Important: never expose `SUPABASE_SERVICE_ROLE_KEY` publicly or commit `.env.local`.

## 3. Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.
Admin login: `http://localhost:3000/admin/login`.

## 4. Deploy

Recommended: import the GitHub repository into Vercel and add the same environment variables in Vercel Project Settings.

## 5. Before launch

- Replace the sample WhatsApp number `919000000000` in `components/Header.tsx`, `app/page.tsx`, and `app/products/[slug]/page.tsx`.
- Add your real address, email and brand logo.
- Add admin route protection using Next.js middleware before public launch.
- Connect your custom domain in Vercel.

## Important

GitHub Pages cannot run this application because it needs server-side features. Deploy it through Vercel, Netlify with Next.js support, or another Node.js host.
