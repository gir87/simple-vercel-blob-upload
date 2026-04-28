# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start Turbopack dev server on http://localhost:3000
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # Run ESLint (next lint is removed in v16 — linting is NOT automatic on build)
```

## Architecture

Next.js 16 App Router project for uploading files of any type/size to Vercel Blob and returning a public URL.

**Upload flow (client-upload path):**
1. `app/_components/upload-form.tsx` (`"use client"`) calls `upload()` from `@vercel/blob/client` with `multipart: true`
2. The library POSTs to `app/api/upload/route.ts` to exchange for a one-time token via `handleUpload()`
3. The file streams directly from the browser to Vercel Blob CDN — bypassing the 4.5 MB server body limit
4. `upload()` resolves with `blob.url`, which `UploadForm` displays

**Key constraint:** `onBeforeGenerateToken` must not include `allowedContentTypes` (omitting it allows all types; passing `[]` blocks everything).

**Environment variable:** `BLOB_READ_WRITE_TOKEN` must be set in `.env.local` (obtain from Vercel Dashboard → Storage → Blob).

**Auth flow:**
- `proxy.ts` (project root) runs on every request; reads the `auth_token` cookie and compares it to `SHA-256(process.env.PASSPHRASE)`. Unauthenticated page requests redirect to `/login`; unauthenticated API requests get a 401. `/login` and `/api/auth` are always allowed through.
- `app/login/page.tsx` — passphrase form (`"use client"`); POSTs to `/api/auth`, redirects to `/` on success.
- `app/api/auth/route.ts` — validates the submitted passphrase against `process.env.PASSPHRASE`, sets an `httpOnly` `auth_token` cookie containing the SHA-256 hash. Changing `PASSPHRASE` immediately invalidates all sessions.

**Environment variables** (`.env.local`):
- `BLOB_READ_WRITE_TOKEN` — Vercel Dashboard → Storage → Blob
- `PASSPHRASE` — any string; the site passphrase

**Blob list / purge:**
- `app/_components/blob-list.tsx` — async server component; calls `list()` from `@vercel/blob` directly (no API route needed), paginates through all results, renders the file list and `<PurgeButton>`
- `app/_components/purge-button.tsx` — client component; `DELETE /api/blobs` then `router.refresh()` to re-render the server component tree
- `app/api/blobs/route.ts` — DELETE handler; pages through all blobs and calls `del()` on all URLs

**Cross-component refresh pattern:** after upload (`upload-form.tsx`) and after purge (`purge-button.tsx`), `router.refresh()` is called to re-render server components without losing client state.

**File layout:**
- `proxy.ts` — request-level auth gate (Next.js 16 equivalent of `middleware.ts`)
- `app/page.tsx` — server component; column layout rendering `<UploadForm>` then `<BlobList>`
- `app/_components/upload-form.tsx` — upload UI; discriminated union state (`idle | uploading | done | error`); calls `router.refresh()` on success
- `app/_components/blob-list.tsx` — server component; lists all stored blobs
- `app/_components/purge-button.tsx` — client component; deletes all blobs
- `app/login/page.tsx` — passphrase entry form
- `app/api/upload/route.ts` — Vercel Blob token endpoint; only export is `POST`
- `app/api/auth/route.ts` — passphrase validation + cookie-setting endpoint; only export is `POST`
- `app/api/blobs/route.ts` — blob purge endpoint; only export is `DELETE`
- `app/layout.tsx` — root layout with Geist font; `<body className="min-h-full flex flex-col">` is load-bearing for the page height
- `app/globals.css` — Tailwind v4 global styles (`@import "tailwindcss"`)

Routes are only publicly accessible when a `page.tsx` or `route.ts` file exists. Other files colocated in `app/` are not exposed.

Special file conventions inside any route segment: `loading.tsx` (auto-Suspense), `error.tsx` (error boundary), `route.ts` (API handler), `template.tsx` (re-rendered layout).

## Next.js 16 Breaking Changes

Read `node_modules/next/dist/docs/` before writing code. Critical differences:

**`params` and `searchParams` are now Promises** — must be awaited:
```tsx
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
}
```

**`"use cache"` directive** — fetch requests are NOT cached by default. Opt in per-component or per-function with `"use cache"`.

**Turbopack is the default bundler.** Use `next dev --webpack` to opt out.

**`middleware.ts` renamed to `proxy.ts`** — export `proxy` (not `middleware`). Run `npx @next/codemod@latest middleware-to-proxy .` to migrate. Proxy runs on Node.js runtime by default (not Edge), so Node's `crypto` module is available.

**`next lint` command removed** — use `npm run lint` (ESLint CLI directly).

**TypeScript minimum: 5.1.** `next dev` / `next build` auto-generates type declarations; run `next typegen` explicitly if needed.

**Node.js minimum: 20.9.**
