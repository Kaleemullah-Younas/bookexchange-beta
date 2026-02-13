# Setup & Deployment Guide

Complete instructions for running BookExchange locally and deploying to production.

---

## Prerequisites

- **Node.js** 22+
- **MongoDB** instance (Atlas or local)
- API keys for the following services:

| Service      | Purpose              | Required |
| :----------- | :------------------- | :------- |
| Google Cloud | Gemini AI + OAuth    | Yes      |
| GitHub       | OAuth                | Yes      |
| Stripe       | Payment processing   | Yes      |
| Pusher       | Real-time WebSockets | Yes      |
| Cloudinary   | Image upload/CDN     | Yes      |
| Brevo        | SMTP email delivery  | Yes      |

---

## Installation

### 1. Clone & Install

```bash
git clone https://github.com/umerkang66/bookexchange-beta.git
cd bookexchange-beta
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```env
# Database
DATABASE_URL="mongodb+srv://..."

# Auth
BETTER_AUTH_SECRET="your-secret-key-min-32-chars-long"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Google Gemini AI
GEMINI_API_KEY=""

# Email (Brevo SMTP)
BREVO_USER=""
BREVO_PASS=""

# Pusher (Real-time)
NEXT_PUBLIC_PUSHER_KEY=""
NEXT_PUBLIC_PUSHER_CLUSTER=""
PUSHER_APP_ID=""
PUSHER_SECRET=""

# Cloudinary (Media)
CLOUDINARY_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Stripe (Payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Stripe Webhooks (Local Development)

To test Stripe payment webhooks locally, install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Scripts

| Command               | Description                                   |
| :-------------------- | :-------------------------------------------- |
| `npm run dev`         | Start development server with hot reload      |
| `npm run build`       | Create optimized production build             |
| `npm run start`       | Start production server                       |
| `npm run lint`        | Run ESLint checks                             |
| `npx prisma generate` | Regenerate Prisma client after schema changes |
| `npx prisma db push`  | Push schema changes to the database           |

---

## Docker Deployment

Build and run with Docker:

```bash
docker build -t bookexchange .
docker run -p 3000:3000 --env-file .env bookexchange
```

The Dockerfile uses `node:22-alpine`, installs dependencies, generates the Prisma client, builds the Next.js app in production mode, and exposes port `3000`.

---

## Project Structure

```
bookexchange-beta/
├── docs/                          # Documentation & diagrams
├── prisma/
│   └── schema.prisma              # 16 data models, MongoDB datasource
├── public/images/                 # Static assets
├── scripts/                       # Utility scripts
├── src/
│   ├── middleware.ts               # Auth guard + email verification
│   ├── app/
│   │   ├── layout.tsx              # Root layout (Header + BookBot)
│   │   ├── page.tsx                # Landing page
│   │   ├── api/
│   │   │   ├── auth/               # Better Auth handler
│   │   │   ├── exchange-points/    # REST endpoints for stalls
│   │   │   ├── stripe/             # Checkout + Webhook
│   │   │   ├── trpc/               # tRPC HTTP handler
│   │   │   └── upload/             # Cloudinary upload
│   │   ├── books/                  # Browse & detail pages
│   │   ├── book-history/           # QR journey viewer
│   │   ├── chat/                   # Real-time messaging
│   │   ├── exchange-points/        # Map + stall management
│   │   ├── forums/                 # Discussion threads
│   │   ├── requests/               # Incoming/outgoing requests
│   │   ├── settings/               # User settings
│   │   ├── wallet/                 # Points balance + purchase
│   │   └── (auth pages)            # signin, signup, verify, reset
│   ├── components/
│   │   ├── books/                  # BookCard, BookGrid, AddBookForm, QR, AI Recs
│   │   ├── exchange/               # Map, Modal, Points, Transactions
│   │   ├── forum/                  # Discussion, Reply, Create modal
│   │   ├── BookBot.tsx             # Floating AI chatbot
│   │   ├── Header.tsx              # Navigation bar
│   │   └── ...                     # Theme, Notifications, Providers
│   ├── lib/                        # Auth, DB, Email, Gemini AI, Pusher, Stripe, tRPC
│   └── server/
│       ├── trpc.ts                 # tRPC context + procedures
│       └── routers/                # book, exchange, forum, chat, bookBot, etc.
├── Dockerfile
├── package.json
└── tsconfig.json
```
