# SessionScribe

Capture conference talks with live transcription, photos, and AI-generated notes — built for KubeCon and beyond.

## Features

- **Dashboard** — track conferences, stats, and upcoming talks
- **Talk cards** — card-grid layout for sessions
- **Live transcription** — OpenAI Realtime API with chunked Whisper fallback
- **Photo capture** — upload speaker/slide photos via Appwrite
- **AI outputs** — summary, personal notes, and tweet drafts from transcripts
- **Search talks** — filter by title, speaker, or track
- **Export** — download talk as Markdown
- **Dark mode** — easier in dim session rooms

## Quick start

```bash
npm install
cp .env.example .env.local
# Fill in env vars (see below)
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without env vars, the app runs in **demo mode** with seeded KubeCon Mumbai test data.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes (prod) | Neon Postgres connection string |
| `OPENAI_API_KEY` | Yes (AI) | Transcription + content generation |
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | Yes (photos) | Appwrite API endpoint |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | Yes (photos) | Appwrite project ID |
| `APPWRITE_API_KEY` | Yes (photos) | Server API key with `files.read` + `files.write` |
| `APPWRITE_BUCKET_ID` | Yes (photos) | Storage bucket for session photos |

### Appwrite setup

1. Create a project at [cloud.appwrite.io](https://cloud.appwrite.io)
2. Create a **Storage bucket** with image MIME types allowed
3. Set bucket read permission to `any` (or scoped as needed)
4. Create an API key with files read/write scopes
5. Add your Vercel domain + `localhost` as a Web platform (CORS)

### Neon setup

1. Create a database at [neon.tech](https://neon.tech)
2. Copy the connection string to `DATABASE_URL`
3. Run `npm run db:push` then `npm run db:seed`

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add all env vars from `.env.example`
4. Deploy

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run db:push` — push schema to Neon
- `npm run db:seed` — seed KubeCon Mumbai test data

## Stack

- Next.js 16 · React 19 · Tailwind CSS 4
- Neon Postgres · Drizzle ORM
- Appwrite Storage
- OpenAI (Realtime + Whisper + GPT-4o-mini)
