import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Condition multipliers for fallback calculation
const CONDITION_MULTIPLIERS: Record<string, number> = {
  NEW: 1.5,
  LIKE_NEW: 1.3,
  VERY_GOOD: 1.1,
  GOOD: 1.0,
  ACCEPTABLE: 0.7,
};

// Base points for fallback calculation
const BASE_POINTS = 100;

interface BookPointsInput {
  title: string;
  author: string;
  condition: string;
  similarBooksCount: number;
  pendingRequestsCount: number;
}

/**
 * Generate book points using Gemini AI based on condition, demand, and rarity.
 * Falls back to rule-based calculation if API fails.
 */
export async function generateBookPoints(
  input: BookPointsInput
): Promise<number> {
  const { title, author, condition, similarBooksCount, pendingRequestsCount } =
    input;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const prompt = `You are a book valuation expert for a book exchange platform. Calculate a fair point value for a book based on the following factors:

Book Details:
- Title: "${title}"
- Author: "${author}"
- Condition: ${condition}

Context:
- Similar books available in system: ${similarBooksCount} (lower = more rare = higher value)
- Pending requests for similar books: ${pendingRequestsCount} (higher = more demand = higher value)

Valuation Guidelines:
a. Condition: NEW and LIKE_NEW should get higher points. ACCEPTABLE should get lower points.
b. Demand: More pending requests indicate higher demand, which increases value.
c. Rarity: Fewer similar books in the system means higher rarity, which increases value.

The point value MUST be a round number between 50 and 500 points (like 100, 150, 200, 250, 300, etc.).

Respond with ONLY a JSON object in this exact format:
{"points": <number>, "reasoning": "<brief explanation>"}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const points = Number(parsed.points);

      if (!isNaN(points) && points >= 50 && points <= 500) {
        // Round to nearest 10 for cleaner values
        return Math.round(points / 10) * 10;
      }
    }

    // If parsing fails or points are out of range, fall back to rule-based
    console.warn('Gemini response parsing failed, using fallback calculation');
    return calculateFallbackPoints(input);
  } catch (error) {
    console.error('Gemini API error, using fallback calculation:', error);
    return calculateFallbackPoints(input);
  }
}

/**
 * Fallback rule-based point calculation
 */
function calculateFallbackPoints(input: BookPointsInput): number {
  const { condition, similarBooksCount, pendingRequestsCount } = input;

  // Condition multiplier
  const conditionMultiplier = CONDITION_MULTIPLIERS[condition] || 1.0;

  // Rarity multiplier based on similar books count
  let rarityMultiplier = 1.0;
  if (similarBooksCount === 0) rarityMultiplier = 1.5; // Only copy
  else if (similarBooksCount <= 2) rarityMultiplier = 1.3;
  else if (similarBooksCount <= 5) rarityMultiplier = 1.15;
  else if (similarBooksCount > 10) rarityMultiplier = 0.85;

  // Demand multiplier based on pending requests
  let demandMultiplier = 1.0;
  if (pendingRequestsCount >= 10) demandMultiplier = 1.5;
  else if (pendingRequestsCount >= 5) demandMultiplier = 1.3;
  else if (pendingRequestsCount >= 3) demandMultiplier = 1.15;
  else if (pendingRequestsCount >= 1) demandMultiplier = 1.05;

  const rawPoints =
    BASE_POINTS * conditionMultiplier * rarityMultiplier * demandMultiplier;
  // Round to nearest 10 for cleaner values
  const roundedPoints = Math.round(rawPoints / 10) * 10;
  return Math.max(50, Math.min(500, roundedPoints));
}

// ============================================
// AI BOOK RECOMMENDATIONS
// ============================================

interface UserBookData {
  ownedBooks: Array<{ title: string; author: string }>;
  requestedBooks: Array<{ title: string; author: string }>;
  historyBooks: Array<{ title: string; author: string }>;
}

interface AvailableBook {
  id: string;
  title: string;
  author: string;
  condition: string;
  location: string;
}

interface BookRecommendation {
  bookId: string;
  score: number;
  reason: string;
}

/**
 * Generate personalized book recommendations using Gemini AI.
 * Analyzes user's reading history, owned books, and requests to find matching books.
 */
export async function generateBookRecommendations(
  userData: UserBookData,
  availableBooks: AvailableBook[],
  limit: number = 6
): Promise<BookRecommendation[]> {
  // If user has no history, return empty (will show trending instead)
  const hasUserData =
    userData.ownedBooks.length > 0 ||
    userData.requestedBooks.length > 0 ||
    userData.historyBooks.length > 0;

  if (!hasUserData || availableBooks.length === 0) {
    return [];
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const prompt = `You are an expert book recommendation system. Analyze the user's reading profile and recommend books from the available list.

USER'S READING PROFILE:
${
  userData.ownedBooks.length > 0
    ? `Books they own/listed: ${userData.ownedBooks
        .map(b => `"${b.title}" by ${b.author}`)
        .join(', ')}`
    : ''
}
${
  userData.requestedBooks.length > 0
    ? `Books they requested: ${userData.requestedBooks
        .map(b => `"${b.title}" by ${b.author}`)
        .join(', ')}`
    : ''
}
${
  userData.historyBooks.length > 0
    ? `Books they've read (from history): ${userData.historyBooks
        .map(b => `"${b.title}" by ${b.author}`)
        .join(', ')}`
    : ''
}

AVAILABLE BOOKS TO RECOMMEND FROM:
${availableBooks
  .map((b, i) => `${i + 1}. ID: "${b.id}" - "${b.title}" by ${b.author}`)
  .join('\n')}

TASK:
1. Analyze the user's interests based on genres, authors, and themes from their profile
2. Select up to ${limit} books from the available list that best match their interests
3. For each recommendation, explain WHY it matches their profile

RESPOND WITH ONLY a JSON array in this exact format:
[
  {"bookId": "<exact book id>", "score": <1-100>, "reason": "<brief personalized reason>"},
  ...
]

Rules:
- Only include books from the AVAILABLE BOOKS list
- Use the exact book ID provided
- Score from 1-100 based on relevance
- Keep reasons concise (under 100 chars)
- Order by score descending`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as BookRecommendation[];

      // Validate and filter recommendations
      const validRecommendations = parsed
        .filter(rec => {
          const bookExists = availableBooks.some(b => b.id === rec.bookId);
          return bookExists && rec.score >= 1 && rec.score <= 100 && rec.reason;
        })
        .slice(0, limit);

      return validRecommendations;
    }

    console.warn('Gemini recommendation parsing failed');
    return [];
  } catch (error) {
    console.error('Gemini recommendation error:', error);
    return [];
  }
}

// ============================================
// AI BOOKBOT CHAT ASSISTANT
// ============================================

interface ChatContext {
  availableBooks: Array<{
    id: string;
    title: string;
    author: string;
    condition: string;
    location: string;
    pointValue: number | null;
  }>;
  userPoints?: number;
  userName?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Generate a response from BookBot AI assistant.
 * Helps users discover books, answer platform questions, and suggest exchanges.
 */
export async function generateBookBotResponse(
  userMessage: string,
  conversationHistory: ChatMessage[],
  context: ChatContext
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const systemPrompt = `You are BookBot, a friendly and helpful AI assistant for a book exchange platform called "BookExchange". Your personality is warm, knowledgeable about books, and enthusiastic about helping people discover new reads.

PLATFORM CONTEXT:
- Users can list books they own for exchange
- Each book has a unique digital ID and QR code for tracking its journey
- Users earn/spend points to exchange books
- Books have conditions: NEW, LIKE_NEW, VERY_GOOD, GOOD, ACCEPTABLE
- Users can view a book's reading history (cities visited, reader notes, tips)
- There are forums for book discussions

${context.userName ? `USER INFO: The user's name is ${context.userName}.` : ''}
${
  context.userPoints !== undefined
    ? `USER POINTS: They have ${context.userPoints} points to spend.`
    : ''
}

AVAILABLE BOOKS IN THE PLATFORM (${context.availableBooks.length} books):
${context.availableBooks
  .slice(0, 20)
  .map(
    b =>
      `- "${b.title}" by ${b.author} (${b.condition}, ${b.location}${
        b.pointValue ? `, ${b.pointValue} pts` : ''
      })`
  )
  .join('\n')}
${
  context.availableBooks.length > 20
    ? `... and ${context.availableBooks.length - 20} more books`
    : ''
}

YOUR CAPABILITIES:
1. Help users find books by genre, author, or topic
2. Recommend books based on their interests
3. Explain how the platform works (points, exchanges, QR codes, book history)
4. Answer questions about book conditions and values
5. Suggest similar books to ones they mention
6. Provide book summaries and reading recommendations
7. Help with exchange decisions

GUIDELINES:
- Keep responses concise but helpful (2-4 sentences usually)
- Be enthusiastic about books!
- If asked about a specific book that's available, mention it
- If they're looking for a genre/type, suggest relevant available books
- Use emoji occasionally to be friendly 📚
- If you don't know something, be honest
- Never make up book availability - only reference books from the list above`;

    // Build conversation for context
    const conversationText = conversationHistory
      .slice(-6) // Keep last 6 messages for context
      .map(msg => `${msg.role === 'user' ? 'User' : 'BookBot'}: ${msg.content}`)
      .join('\n');

    const prompt = `${systemPrompt}

CONVERSATION HISTORY:
${conversationText}

User: ${userMessage}

BookBot:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return text.trim();
  } catch (error) {
    console.error('BookBot error:', error);
    return "I'm having a bit of trouble right now 😅 Please try again in a moment, or browse the books section to explore what's available!";
  }
}

// ============================================
// AI READING INSIGHTS FROM BOOK HISTORY
// ============================================

interface BookHistoryData {
  title: string;
  author: string;
  city: string;
  country?: string | null;
  startDate: Date;
  endDate?: Date | null;
  durationDays?: number | null;
  rating?: number | null;
  note?: string | null;
}

interface ReadingInsights {
  summary: string;
  favoriteGenres: string[];
  readingPace: string;
  totalBooksRead: number;
  averageRating: number | null;
  longestBook: string | null;
  mostActiveMonth: string | null;
  geographicDiversity: string;
  recommendations: string[];
  funFacts: string[];
  readingStreak: string;
  personalityType: string;
}

/**
 * Generate AI-powered reading insights from user's book history.
 * Analyzes patterns, preferences, and provides personalized insights.
 */
export async function generateReadingInsights(
  historyEntries: BookHistoryData[],
  userName?: string
): Promise<ReadingInsights> {
  // Default insights for users with no history
  if (historyEntries.length === 0) {
    return {
      summary:
        'Start your reading journey! Add books to your history to unlock personalized insights.',
      favoriteGenres: [],
      readingPace: 'No reading data yet',
      totalBooksRead: 0,
      averageRating: null,
      longestBook: null,
      mostActiveMonth: null,
      geographicDiversity: 'Start reading to explore!',
      recommendations: [
        'List your first book to get started',
        "Scan a book's QR code to add your reading experience",
        'Rate books to help us understand your preferences',
      ],
      funFacts: [],
      readingStreak: 'Start your streak today!',
      personalityType: 'Curious Explorer 🔍',
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    // Calculate basic stats
    const totalBooks = historyEntries.length;
    const ratings = historyEntries.filter(e => e.rating).map(e => e.rating!);
    const avgRating =
      ratings.length > 0
        ? Math.round(
            (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10
          ) / 10
        : null;
    const cities = [...new Set(historyEntries.map(e => e.city))];
    const countries = [
      ...new Set(historyEntries.filter(e => e.country).map(e => e.country!)),
    ];
    const durations = historyEntries
      .filter(e => e.durationDays)
      .map(e => e.durationDays!);
    const avgDuration =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : null;

    const prompt = `You are a reading analyst AI. Analyze this user's book reading history and provide insightful, personalized analysis.

${userName ? `USER: ${userName}` : ''}

READING HISTORY (${totalBooks} books):
${historyEntries
  .map(
    (e, i) => `${i + 1}. "${e.title}" by ${e.author}
   - Location: ${e.city}${e.country ? `, ${e.country}` : ''}
   - Period: ${e.startDate.toLocaleDateString()}${
      e.endDate ? ` to ${e.endDate.toLocaleDateString()}` : ' (ongoing)'
    }
   ${e.durationDays ? `- Duration: ${e.durationDays} days` : ''}
   ${e.rating ? `- Rating: ${e.rating}/5` : ''}
   ${e.note ? `- Note: "${e.note}"` : ''}`
  )
  .join('\n\n')}

STATISTICS:
- Total books: ${totalBooks}
- Average rating: ${avgRating || 'N/A'}
- Cities: ${cities.join(', ')}
- Countries: ${countries.length > 0 ? countries.join(', ') : 'N/A'}
- Average reading time: ${avgDuration ? `${avgDuration} days` : 'N/A'}

TASK: Provide a comprehensive reading analysis. Respond with ONLY a JSON object:

{
  "summary": "<2-3 sentence personalized summary of their reading journey>",
  "favoriteGenres": ["<inferred genre 1>", "<inferred genre 2>", "<inferred genre 3>"],
  "readingPace": "<description like 'Steady reader - about 2 weeks per book' or 'Speed reader'>",
  "longestBook": "<title of likely longest book based on duration, or null>",
  "mostActiveMonth": "<month name when they read most, or null if unclear>",
  "geographicDiversity": "<comment about reading locations, e.g., 'Globetrotter - reads across 3 countries!'>",
  "recommendations": ["<actionable suggestion 1>", "<actionable suggestion 2>", "<actionable suggestion 3>"],
  "funFacts": ["<interesting insight about their reading>", "<another fun observation>"],
  "readingStreak": "<motivational message about their consistency>",
  "personalityType": "<creative reader personality type with emoji, e.g., 'Night Owl Reader 🦉' or 'Genre Explorer 🗺️'>"
}

Be creative, encouraging, and insightful. Make the user feel good about their reading journey!`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      return {
        summary: parsed.summary || "You're on an amazing reading journey!",
        favoriteGenres: parsed.favoriteGenres || [],
        readingPace:
          parsed.readingPace || `${avgDuration || 14} days per book on average`,
        totalBooksRead: totalBooks,
        averageRating: avgRating,
        longestBook: parsed.longestBook || null,
        mostActiveMonth: parsed.mostActiveMonth || null,
        geographicDiversity:
          parsed.geographicDiversity ||
          `Read in ${cities.length} ${cities.length === 1 ? 'city' : 'cities'}`,
        recommendations: parsed.recommendations || [],
        funFacts: parsed.funFacts || [],
        readingStreak: parsed.readingStreak || 'Keep the momentum going!',
        personalityType: parsed.personalityType || 'Avid Reader 📚',
      };
    }

    // Fallback if parsing fails
    return generateFallbackInsights(
      historyEntries,
      avgRating,
      avgDuration,
      cities,
      countries
    );
  } catch (error) {
    console.error('Reading insights error:', error);
    return generateFallbackInsights(
      historyEntries,
      historyEntries.filter(e => e.rating).length > 0
        ? Math.round(
            (historyEntries
              .filter(e => e.rating)
              .map(e => e.rating!)
              .reduce((a, b) => a + b, 0) /
              historyEntries.filter(e => e.rating).length) *
              10
          ) / 10
        : null,
      null,
      [...new Set(historyEntries.map(e => e.city))],
      [...new Set(historyEntries.filter(e => e.country).map(e => e.country!))]
    );
  }
}

/**
 * Fallback insights when AI fails
 */
function generateFallbackInsights(
  entries: BookHistoryData[],
  avgRating: number | null,
  avgDuration: number | null,
  cities: string[],
  countries: string[]
): ReadingInsights {
  const total = entries.length;

  return {
    summary: `You've read ${total} ${
      total === 1 ? 'book' : 'books'
    } and explored ${cities.length} ${
      cities.length === 1 ? 'city' : 'cities'
    }. Keep up the great reading!`,
    favoriteGenres: [],
    readingPace: avgDuration
      ? `About ${avgDuration} days per book`
      : 'Varies by book',
    totalBooksRead: total,
    averageRating: avgRating,
    longestBook: null,
    mostActiveMonth: null,
    geographicDiversity:
      countries.length > 1
        ? `International reader - ${countries.length} countries!`
        : cities.length > 1
        ? `Local explorer - ${cities.length} cities`
        : 'Home base reader',
    recommendations: [
      'Try a new genre to expand your horizons',
      'Set a reading goal for this month',
      'Share your favorite book with a friend',
    ],
    funFacts: [
      `You've left your mark in ${cities.length} ${
        cities.length === 1 ? 'city' : 'cities'
      }`,
      avgRating
        ? `Your average rating is ${avgRating}/5 stars`
        : 'Rate more books to track your preferences',
    ],
    readingStreak:
      total >= 10
        ? 'Impressive dedication! 🌟'
        : total >= 5
        ? 'Building momentum! 📈'
        : 'Great start! Keep going! 🚀',
    personalityType:
      total >= 10
        ? 'Bookworm Champion 🏆'
        : total >= 5
        ? 'Rising Reader ⭐'
        : 'Eager Explorer 🌱',
  };
}

// ============================================
// READING TIME ESTIMATOR
// ============================================

interface ReadingTimeInput {
  title: string;
  author: string;
  description?: string | null;
}

interface ReadingTimeEstimate {
  estimatedMinutes: number;
  estimatedHours: number;
  estimatedDays: number;
  paceDescription: string;
  pageEstimate: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  funFact: string;
}

/**
 * Estimate reading time for a book using AI.
 * Analyzes book title, author, and description to provide accurate estimates.
 */
export async function estimateReadingTime(
  input: ReadingTimeInput
): Promise<ReadingTimeEstimate> {
  const { title, author, description } = input;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const prompt = `You are a literary expert who can estimate book reading times based on title, author, and description.

BOOK INFORMATION:
- Title: "${title}"
- Author: "${author}"
${description ? `- Description: "${description}"` : ''}

TASK: Estimate the reading time for this book. Consider:
1. The author's typical writing style and book lengths
2. The genre/category implied by the title
3. The complexity suggested by the description
4. Average reading speed of 250 words per minute

Respond with ONLY a JSON object in this exact format:
{
  "estimatedMinutes": <total minutes to read>,
  "pageEstimate": <estimated number of pages>,
  "difficulty": "<easy|moderate|challenging>",
  "funFact": "<interesting fact about reading this book or similar books by this author>"
}

Guidelines:
- Average novel: 300 pages, ~5-6 hours (300-360 minutes)
- Short novel: 150-200 pages, ~3-4 hours
- Long novel: 400-600 pages, ~8-12 hours
- Non-fiction: Usually longer due to dense content
- Children's/YA: Usually faster reads
- Literary fiction: Often moderate pace due to prose style
- Thrillers: Fast-paced, often quick reads despite length`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      const minutes = Number(parsed.estimatedMinutes) || 300;
      const hours = Math.round((minutes / 60) * 10) / 10;
      const days = Math.round((minutes / 60 / 2) * 10) / 10; // Assuming 2 hours reading per day

      return {
        estimatedMinutes: minutes,
        estimatedHours: hours,
        estimatedDays: days,
        paceDescription: getPaceDescription(minutes),
        pageEstimate: parsed.pageEstimate || Math.round(minutes / 1.5),
        difficulty: parsed.difficulty || 'moderate',
        funFact: parsed.funFact || `This book by ${author} is a great choice!`,
      };
    }

    // Fallback estimate
    return generateFallbackReadingTime(title);
  } catch (error) {
    console.error('Reading time estimation error:', error);
    return generateFallbackReadingTime(title);
  }
}

/**
 * Get pace description based on reading time
 */
function getPaceDescription(minutes: number): string {
  if (minutes < 120) return 'Quick read - perfect for a lazy afternoon';
  if (minutes < 240) return 'Light read - finish it over a weekend';
  if (minutes < 360) return 'Standard length - a week of casual reading';
  if (minutes < 600) return 'Substantial read - great for dedicated readers';
  return 'Epic journey - settle in for a long adventure';
}

/**
 * Fallback reading time estimation
 */
function generateFallbackReadingTime(title: string): ReadingTimeEstimate {
  // Rough estimate based on title length as a proxy
  const baseMinutes = 300; // 5 hours default
  const titleWords = title.split(' ').length;
  const adjustedMinutes = baseMinutes + (titleWords > 5 ? 60 : 0);

  return {
    estimatedMinutes: adjustedMinutes,
    estimatedHours: Math.round((adjustedMinutes / 60) * 10) / 10,
    estimatedDays: Math.round((adjustedMinutes / 120) * 10) / 10,
    paceDescription: getPaceDescription(adjustedMinutes),
    pageEstimate: Math.round(adjustedMinutes / 1.5),
    difficulty: 'moderate',
    funFact: 'Reading expands your mind and vocabulary with every page!',
  };
}
