# 📚 BookExchange

A modern book exchange platform that connects readers and gives pre-loved books a second life. Built with AI-powered features for an enhanced user experience.

## 👥 Collaborators

- **Muhammad Umer**
- **Saad Tariq**

## 🛠️ Technologies Used

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS v4** - Utility-first CSS framework
- **Lucide React** - Icon library

### Backend

- **tRPC** - End-to-end typesafe APIs
- **Prisma** - Database ORM
- **MongoDB** - NoSQL database
- **Better Auth** - Authentication library

### AI & APIs

- **Google Gemini AI** - Powers all AI features (book valuation, recommendations, chat assistant, reading insights, time estimation)
- **Stripe** - Payment processing for purchasing points
- **Pusher** - Real-time notifications and chat
- **Cloudinary** - File/image uploads

### Other Tools

- **QRCode.react** - QR code generation for book tracking
- **Leaflet** - Interactive maps for exchange points
- **Zod** - Schema validation

## ✨ Features

### 📖 Book Exchange System

- List books with multiple images and detailed condition ratings
- Unique digital ID for every book ensuring authenticity
- Location-based book discovery
- Points-based exchange system

### 🤖 AI-Powered Features

#### 1. AI Book Valuation

Automatically calculates fair point values for books based on:

- Book condition
- Rarity in the system
- Demand from other users

#### 2. AI Book Recommendations

Personalized book suggestions based on:

- Books you own
- Books you've requested
- Your reading history

#### 3. AI BookBot Chat Assistant

Interactive chatbot that helps users:

- Discover new books
- Navigate the platform
- Get book recommendations
- Answer questions about exchanges

#### 4. AI Reading Insights

Analyzes your reading history to provide:

- Personalized reading summary
- Favorite genres detection
- Reading pace analysis
- Geographic diversity stats
- Reader personality type
- Fun facts about your reading journey

#### 5. AI Reading Time Estimator

For every book, estimates:

- Total reading time (hours/minutes)
- Page count
- Difficulty level
- Days to complete (at 2 hrs/day)
- Personalized pace description

### 📱 QR Code Book History

- Every book gets a unique QR code
- Scan to see the book's journey
- Track cities and countries visited
- Read notes and tips from previous readers
- Add your own reading experience

### 💰 Points & Wallet System

- Earn points by listing books
- Spend points to request books
- Purchase additional points via Stripe
- Transaction history tracking

### 🗺️ Exchange Points

- Physical locations for book exchanges
- Interactive map with Leaflet
- Create and manage exchange points

### 💬 Forums & Community

- Discussion forums for book lovers
- Category-based organization
- Reply and engage with other readers

### 🔔 Real-time Features

- Live notifications via Pusher
- Chat functionality
- Instant updates on exchange requests

### 🎨 User Experience

- Dark/Light theme support
- Responsive design for all devices
- Modern, clean UI with gold accent theme
- Smooth animations and transitions

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (`.env`)
4. Run database migrations:
   ```bash
   npx prisma db push
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## 📄 License

This project was built for TechVerse Hackathon 2026.
