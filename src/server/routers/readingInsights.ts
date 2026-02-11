import { router, protectedProcedure } from '../trpc';
import { prisma } from '@/lib/db';
import { generateReadingInsights } from '@/lib/gemini';

export const readingInsightsRouter = router({
  // Get AI-generated reading insights for the current user
  getInsights: protectedProcedure.query(async ({ ctx }) => {
    // Get all book history entries for the user
    const historyEntries = await prisma.bookHistoryEntry.findMany({
      where: { readerId: ctx.session.user.id },
      orderBy: { startDate: 'desc' },
    });

    // Get book details for each entry
    const entriesWithBooks = await Promise.all(
      historyEntries.map(async entry => {
        const book = await prisma.book.findUnique({
          where: { digitalId: entry.bookDigitalId },
          select: {
            title: true,
            author: true,
          },
        });

        return {
          title: book?.title || 'Unknown Book',
          author: book?.author || 'Unknown Author',
          city: entry.city,
          country: entry.country,
          startDate: entry.startDate,
          endDate: entry.endDate,
          durationDays: entry.durationDays,
          rating: entry.rating,
          note: entry.note,
        };
      })
    );

    // Get user name for personalization
    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { name: true },
    });

    // Generate AI insights
    const insights = await generateReadingInsights(
      entriesWithBooks,
      user?.name || undefined
    );

    return {
      insights,
      historyCount: historyEntries.length,
      lastUpdated: new Date().toISOString(),
    };
  }),

  // Get quick stats without AI (for dashboard widgets)
  getQuickStats: protectedProcedure.query(async ({ ctx }) => {
    // Get all book history entries for the user
    const historyEntries = await prisma.bookHistoryEntry.findMany({
      where: { readerId: ctx.session.user.id },
      select: {
        city: true,
        country: true,
        rating: true,
        durationDays: true,
        startDate: true,
      },
    });

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

    // Calculate reading by month
    const monthCounts: Record<string, number> = {};
    historyEntries.forEach(entry => {
      const month = new Date(entry.startDate).toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });

    const mostActiveMonth =
      Object.entries(monthCounts).length > 0
        ? Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0][0]
        : null;

    return {
      totalBooks,
      avgRating,
      citiesCount: cities.length,
      countriesCount: countries.length,
      avgDuration,
      mostActiveMonth,
    };
  }),
});
