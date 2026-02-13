<div align="center">

# 📚 BookExchange

**A full-stack, AI-powered book exchange platform built for readers.**

Trade books using a point-based economy with AI valuation, real-time chat, community forums, and interactive map-based exchange stalls.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Prisma-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

</div>

---

## Overview

BookExchange replaces traditional buy/sell with a **point-based exchange system**. Every user starts with **1,000 points**. List a book to earn points, request a book to spend them. Point values are dynamically calculated by **Google Gemini AI** based on condition, demand, and rarity.

<div align="center">
  <img src="docs/image/Architecture.png" alt="BookExchange System Architecture" width="700"/>
</div>

---

## Key Features

| Feature                | Description                                                    |
| :--------------------- | :------------------------------------------------------------- |
| **AI Book Valuation**  | Dynamic pricing via Gemini based on condition, supply & demand |
| **BookBot**            | Floating AI chatbot for discovery and platform Q&A             |
| **Points Economy**     | Earn by listing, spend by requesting, buy via Stripe           |
| **Real-Time Chat**     | Pusher-powered direct messaging scoped to books                |
| **Community Forums**   | Category-based discussions with reactions & moderation         |
| **Exchange Map**       | Interactive Leaflet map of physical book stalls                |
| **QR Book Journey**    | Track a book's path across readers and cities                  |
| **AI Recommendations** | Personalized suggestions based on your library                 |
| **Reading Insights**   | AI-generated reading personality analysis                      |
| **OAuth + Email Auth** | Google, GitHub, and email/password via Better Auth             |

---

## Tech Stack

| Category       | Technologies                         |
| :------------- | :----------------------------------- |
| **Framework**  | Next.js 16, React 19, TypeScript 5   |
| **Styling**    | Tailwind CSS v4, Framer Motion, GSAP |
| **API**        | tRPC v11, Zod v4                     |
| **Database**   | MongoDB, Prisma v6                   |
| **Auth**       | Better Auth, Google & GitHub OAuth   |
| **AI**         | Google Gemini (Generative AI SDK)    |
| **Payments**   | Stripe Checkout + Webhooks           |
| **Real-time**  | Pusher WebSockets                    |
| **Media**      | Cloudinary CDN                       |
| **Email**      | Nodemailer + Brevo SMTP              |
| **Maps**       | Leaflet, React-Leaflet               |
| **Deployment** | Docker, Next.js Standalone           |

---

## Quick Start

```bash
# Clone & install
git clone https://github.com/umerkang66/bookexchange-beta.git
cd bookexchange-beta
npm install

# Configure environment
cp .env.example .env    # Fill in all API keys

# Generate Prisma client & run
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> See [docs/SETUP.md](docs/SETUP.md) for detailed environment variables and deployment instructions.

---

## Documentation

Detailed documentation is organized in the [`docs/`](docs/) directory:

| Document                             | Description                                                              |
| :----------------------------------- | :----------------------------------------------------------------------- |
| [Architecture](docs/ARCHITECTURE.md) | System architecture, layer breakdown, data flow, and diagrams            |
| [Features](docs/FEATURES.md)         | Comprehensive feature documentation with details                         |
| [Database Schema](docs/DATABASE.md)  | All 16 Prisma models, enums, indexes, and ER diagram                     |
| [Setup & Deployment](docs/SETUP.md)  | Installation, environment config, scripts, Docker, and project structure |

### Architecture Diagram

See the full architecture diagram: [`docs/image/Architecture.png`](docs/image/Architecture.png)
