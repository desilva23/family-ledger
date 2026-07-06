# Family Ledger

A simple expense/income tracker built with Next.js + Tailwind.

## Local development
```
npm install
npm run dev
```

## Environment variables
Set these in Vercel (Project Settings → Environment Variables) to change the login credentials from the defaults (`mom` / `family2026`):
- NEXT_PUBLIC_LEDGER_USERNAME
- NEXT_PUBLIC_LEDGER_PASSWORD

Note: since this is a purely frontend check (no backend/database), these values get compiled into the JavaScript the browser downloads. They are not stored in your git repo, but they are not truly secret either — this is a simple gate, not real authentication.

## Data storage
All entries are stored in the browser's localStorage — nothing is sent to a server. Data will not sync across devices/browsers and will be lost if the browser's site data is cleared.
