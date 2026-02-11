import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

import { testRouter } from './testing';
import { bookRouter } from './book';
import { exchangeRouter } from './exchange';
import { forumRouter } from './forum';
import { chatRouter } from './chat';
import { bookHistoryRouter } from './bookHistory';
import { bookBotRouter } from './bookBot';
import { readingInsightsRouter } from './readingInsights';

export const appRouter = router({
  test: testRouter,
  book: bookRouter,
  exchange: exchangeRouter,
  forum: forumRouter,
  chat: chatRouter,
  bookHistory: bookHistoryRouter,
  bookBot: bookBotRouter,
  readingInsights: readingInsightsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
