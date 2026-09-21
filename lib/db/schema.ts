import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const decks = sqliteTable('decks', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  sourceText: text('source_text').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const cards = sqliteTable('cards', {
  id: text('id').primaryKey(),
  deckId: text('deck_id')
    .notNull()
    .references(() => decks.id, { onDelete: 'cascade' }),
  front: text('front').notNull(),
  back: text('back').notNull(),
  // Spaced repetition fields (SM-2)
  easeFactor: real('ease_factor').notNull().default(2.5),
  interval: integer('interval').notNull().default(0),
  repetitions: integer('repetitions').notNull().default(0),
  nextReviewAt: integer('next_review_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey(),
  cardId: text('card_id')
    .notNull()
    .references(() => cards.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(), // 0=forgot, 1=hard, 2=good, 3=easy
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Deck = typeof decks.$inferSelect;
export type NewDeck = typeof decks.$inferInsert;
export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;