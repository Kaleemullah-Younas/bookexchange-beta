# Features

A comprehensive overview of all BookExchange platform capabilities.

---

## Book Exchange & Points Economy

- List books with condition grading (New → Acceptable), images, and location
- AI-driven book valuation using Gemini — factors in condition, supply, and demand
- Request books from other users by spending points
- Accept / decline / cancel requests with automatic point transfers
- Transaction history with full audit trail
- Purchase additional points through Stripe Checkout

### Points System

| Action                     | Points                        |
| :------------------------- | :---------------------------- |
| New user sign-up           | +1,000 (welcome bonus)        |
| List a book                | +Earned (AI-calculated value) |
| Request a book             | −Spent (AI-calculated value)  |
| Request declined/cancelled | Refunded                      |
| Stripe purchase            | +Custom amount                |

---

## AI-Powered Intelligence (Google Gemini)

All AI features are powered by the Google Gemini Generative AI SDK.

### Book Valuation

Dynamic point pricing based on condition, rarity (copies in system), and demand (pending requests). Automatically recalculated when supply/demand changes.

### Personalized Recommendations

Analyzes your owned books, sent requests, and reading history to suggest relevant matches from available books.

### BookBot

A floating AI chatbot accessible on every page. Helps users discover books, answers platform questions, and suggests exchanges based on preferences.

### Reading Insights

Generates a personality-type reading analysis — favorite genres, reading pace, personality traits, and fun facts derived from your book history.

### Reading Time Estimation

Predicts reading duration based on book title, author, and description metadata.

---

## Community Forums

- **7 categories**: Reader Discussions, Chapter Debates, Interpretations, Reading Guidance, Book Reviews, Recommendations, General
- Threaded replies with nested comments
- Reaction system: Like, Helpful, Insightful, Agree, Disagree
- Abuse reporting with moderation workflow (Pending → Reviewed → Action Taken / Dismissed)
- Anonymous posting support
- Profanity filtering via `bad-words`
- Pinned and locked discussion support
- View counts per discussion

---

## Real-Time Chat

- Direct messaging between users scoped to specific books
- Pusher-powered live message delivery
- Unread message counts and notifications
- Conversation history with pagination
- Each conversation is uniquely tied to a book + two participants

---

## Exchange Points (Physical Stalls)

- Register physical exchange locations on an interactive Leaflet map
- Stall profiles with name, description, images, contact info, and GPS coordinates
- Browse nearby exchange stalls geographically
- Status system: Active / Inactive / Verified
- Contact methods: Email, Phone, or Chat

---

## Book History & QR Journey

- Every book is assigned a **unique digital ID** at creation
- Track a book's journey across readers and cities over time
- Readers log:
  - Reading duration (start/end dates)
  - City and country
  - Optional notes, tips for next readers, and 1–5 star ratings
- History is **preserved even if users are deleted** (reader info is denormalized)
- Anonymous entries supported

---

## Authentication & User Management

- Email/password sign-up with email verification (Brevo SMTP)
- Google and GitHub OAuth integration via Better Auth
- Password reset via email
- Middleware-enforced route protection (auth guard + email verification check)
- Theme toggle: Light / Dark / System (via `next-themes`)
