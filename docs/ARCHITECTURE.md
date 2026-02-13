# Architecture

BookExchange follows a **layered architecture** with clear separation between client, server, and external services.

<div align="center">
  <img src="image/Architecture.png" alt="BookExchange System Architecture" width="800"/>
  <br/>
  <em>High-level system architecture diagram</em>
</div>

---

## System Diagram

```mermaid
graph TB
    subgraph Client["Client Layer"]
        direction TB
        UI["Next.js 16 App Router<br/>React 19 · TypeScript · Tailwind v4"]
        ANIM["Framer Motion · GSAP<br/>Lucide Icons · Leaflet Maps"]
        STATE["TanStack React Query<br/>tRPC Client · Pusher JS"]
        UI --> ANIM
        UI --> STATE
    end

    subgraph Server["Server Layer"]
        direction TB
        API["Next.js API Routes"]
        TRPC["tRPC Routers"]
        MW["Middleware<br/>Auth Guard · Email Verification"]
        API --> TRPC
        API --> MW
        subgraph Routers["Router Modules"]
            R1["book"]
            R2["exchange"]
            R3["forum"]
            R4["chat"]
            R5["bookBot"]
            R6["bookHistory"]
            R7["readingInsights"]
        end
        TRPC --> Routers
    end

    subgraph External["External Services"]
        direction TB
        DB[("MongoDB<br/>Prisma ORM")]
        AI["Google Gemini AI"]
        STRIPE["Stripe Payments"]
        PUSH["Pusher WebSockets"]
        CLOUD["Cloudinary CDN"]
        EMAIL["Brevo SMTP"]
        OAUTH["Google & GitHub OAuth"]
    end

    subgraph Data["Data Models"]
        direction LR
        M1["User"] --- M2["Book"] --- M3["BookRequest"]
        M4["PointTransaction"] --- M5["Conversation"] --- M6["Message"]
        M7["ForumDiscussion"] --- M8["ForumReply"] --- M9["ExchangePoint"]
        M10["BookHistoryEntry"]
    end

    Client -->|tRPC| Server
    Client -->|WebSocket| PUSH
    Server --> DB
    Server --> AI
    Server --> STRIPE
    Server --> PUSH
    Server --> CLOUD
    Server --> EMAIL
    MW --> OAUTH
    DB --> Data
```

---

## Layer Breakdown

| Layer             | Stack                                 | Role                                               |
| :---------------- | :------------------------------------ | :------------------------------------------------- |
| **Frontend**      | Next.js 16, React 19, Tailwind v4     | SSR/CSR hybrid rendering, responsive UI            |
| **Animations**    | Framer Motion, GSAP                   | Page transitions, micro-interactions               |
| **Data Fetching** | tRPC + TanStack Query                 | End-to-end typesafe API with caching               |
| **Auth**          | Better Auth (Email + Google + GitHub) | Session management, email verification             |
| **Database**      | MongoDB + Prisma ORM                  | Document store, 16 models, indexed queries         |
| **AI**            | Google Gemini                         | Book valuation, recommendations, chatbot, insights |
| **Payments**      | Stripe Checkout + Webhooks            | Purchase points via card                           |
| **Real-time**     | Pusher (WebSockets)                   | Live chat, notifications                           |
| **Media**         | Cloudinary                            | Image upload and CDN delivery                      |
| **Email**         | Brevo SMTP via Nodemailer             | Verification and password reset emails             |
| **Maps**          | Leaflet + React-Leaflet               | Exchange stall geolocation                         |

---

## Data Flow

1. **Client → Server**: All API calls go through tRPC with end-to-end type safety. TanStack Query handles caching, invalidation, and optimistic updates.
2. **Server → Database**: Prisma ORM provides type-safe MongoDB queries with 16 indexed models.
3. **Real-time**: Pusher WebSockets push live chat messages and notifications directly to connected clients.
4. **AI Pipeline**: Server-side calls to Google Gemini for book valuation, recommendations, chatbot responses, reading insights, and time estimation.
5. **Auth Flow**: Better Auth manages sessions with email/password, Google OAuth, and GitHub OAuth. Middleware enforces route protection and email verification.
6. **Payments**: Stripe Checkout Sessions handle point purchases, with webhooks for asynchronous payment confirmation.
