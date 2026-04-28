# Simple Vercel File Upload

A password-protected web app to upload any file to Vercel Blob Storage and get a shareable public URL back 😎

![Simple Vercel File Upload](/public/screenshot.png?raw=true "Simple Vercel File Upload")

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local`:
   ```
   BLOB_READ_WRITE_TOKEN=        # Vercel Dashboard → Storage → Blob
   PASSPHRASE=                   # Site passphrase
   VERCEL_BLOB_CALLBACK_URL=http://localhost:3000  # local dev only
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

## Usage

Open [http://localhost:3000](http://localhost:3000) and enter the passphrase. From there you can:

- **Upload** any file (any type, any size) and get a shareable public URL
- **Browse** all stored files — each is a clickable link
- **Purge** all stored files with the purge button

## Security

- The passphrase is stored server-side only in `PASSPHRASE` — it is never sent to the client or exposed in any response.
- On successful login, a SHA-256 hash of the passphrase is stored in an `httpOnly` cookie (inaccessible to JavaScript). The cookie is also `secure` in production and `SameSite=Lax`.
- Every request (pages and API routes) is gated by `proxy.ts`, which recomputes `SHA-256(PASSPHRASE)` and compares it to the cookie value. Changing `PASSPHRASE` immediately invalidates all existing sessions.
- Unauthenticated page requests are redirected to `/login`; unauthenticated API requests receive a `401`.

## Commands

```bash
npm run dev    # Development server (Turbopack)
npm run build  # Production build
npm run start  # Serve production build
npm run lint   # Lint
```
