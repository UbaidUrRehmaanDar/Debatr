import { pgTable, text, timestamp, uuid, integer, boolean, jsonb, real } from 'drizzle-orm/pg-core';

// Users table with Better Auth integration
// Note: Better Auth generates its own string IDs, so the id column is `text`
// (not uuid) to stay compatible with the Drizzle adapter.
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  name: text('name'),
  role: text('role', { enum: ['user', 'admin'] }).notNull().default('user'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Better Auth: sessions
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Better Auth: accounts (credentials / social links)
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Better Auth: verifications (email verification, password reset)
export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Invitations table for invitation-only registration
export const invitations = pgTable('invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  email: text('email').notNull(), // Target email for the invitation
  createdBy: text('created_by').references(() => users.id).notNull(),
  usedBy: text('used_by').references(() => users.id),
  usedAt: timestamp('used_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Debates table
export const debates = pgTable('debates', {
  id: uuid('id').primaryKey().defaultRandom(),
  topic: text('topic').notNull(),
  description: text('description'),
  status: text('status', { 
    enum: ['draft', 'waiting_for_participants', 'active', 'paused', 'judging', 'completed', 'cancelled'] 
  }).notNull().default('draft'),
  
  // Participants stored as JSONB for flexibility
  participants: jsonb('participants').notNull().$type<{
    affirmative: { userId: string; displayName: string; joinedAt: string };
    negative: { userId: string; displayName: string; joinedAt: string };
  }>(),
  
  // Settings snapshotted at creation
  maxRounds: integer('max_rounds').notNull(),
  roundDurationMs: integer('round_duration_ms').notNull(),
  maxCharactersPerTurn: integer('max_characters_per_turn').notNull(),
  
  currentRound: integer('current_round').notNull().default(0),
  currentTurnId: uuid('current_turn_id'),
  judgeReportId: uuid('judge_report_id'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

// Debate turns
export const turns = pgTable('turns', {
  id: uuid('id').primaryKey().defaultRandom(),
  debateId: uuid('debate_id').references(() => debates.id, { onDelete: 'cascade' }).notNull(),
  roundIndex: integer('round_index').notNull(),
  turnIndex: integer('turn_index').notNull(),
  side: text('side', { enum: ['affirmative', 'negative'] }).notNull(),
  participantId: text('participant_id').notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }),
  status: text('status', { enum: ['pending', 'active', 'completed', 'timeout'] }).notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Public debate messages
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  debateId: uuid('debate_id').references(() => debates.id, { onDelete: 'cascade' }).notNull(),
  turnId: uuid('turn_id').references(() => turns.id, { onDelete: 'cascade' }),
  senderId: text('sender_id').notNull(),
  side: text('side', { enum: ['affirmative', 'negative', 'system'] }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Private Lawyer conversations (one per participant per debate)
export const lawyerConversations = pgTable('lawyer_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  debateId: uuid('debate_id').references(() => debates.id, { onDelete: 'cascade' }).notNull(),
  participantId: text('participant_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Individual Lawyer requests and responses
export const lawyerRequests = pgTable('lawyer_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => lawyerConversations.id, { onDelete: 'cascade' }).notNull(),
  participantRequest: text('participant_request').notNull(),
  context: jsonb('context').notNull(), // Debate context provided to AI
  aiResponse: jsonb('ai_response').notNull(), // Structured AI response
  tokensUsed: integer('tokens_used'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Judge reports (one per completed debate)
export const judgeReports = pgTable('judge_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  debateId: uuid('debate_id').references(() => debates.id, { onDelete: 'cascade' }).notNull(),
  outcome: text('outcome', { enum: ['affirmative', 'negative', 'draw', 'inconclusive'] }).notNull(),
  confidence: real('confidence').notNull(),
  verdict: text('verdict').notNull(),
  scores: jsonb('scores').notNull(), // Structured scores for both sides
  strengths: jsonb('strengths').notNull(),
  weaknesses: jsonb('weaknesses').notNull(),
  feedback: jsonb('feedback').notNull(),
  fallacies: jsonb('fallacies').notNull(),
  conductFindings: jsonb('conduct_findings').notNull(),
  summary: text('summary').notNull(),
  tokensUsed: integer('tokens_used'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// AI usage tracking per debate
export const aiUsage = pgTable('ai_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  debateId: uuid('debate_id').references(() => debates.id, { onDelete: 'cascade' }).notNull(),
  role: text('role', { enum: ['lawyer', 'judge'] }).notNull(),
  tokensUsed: integer('tokens_used').notNull(),
  model: text('model').notNull(),
  requestId: text('request_id'), // Provider's request ID if available
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Moderation events
export const moderationEvents = pgTable('moderation_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  debateId: uuid('debate_id').references(() => debates.id, { onDelete: 'cascade' }),
  messageId: uuid('message_id').references(() => messages.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id),
  category: text('category', { enum: ['harassment', 'threat', 'hate', 'spam', 'disruption', 'other'] }).notNull(),
  action: text('action', { enum: ['none', 'warning', 'official_warning', 'penalty', 'terminate'] }).notNull(),
  explanation: text('explanation'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Exports/Imports tracking
export const exports = pgTable('exports', {
  id: uuid('id').primaryKey().defaultRandom(),
  debateId: uuid('debate_id').references(() => debates.id, { onDelete: 'cascade' }).notNull(),
  createdBy: text('created_by').references(() => users.id).notNull(),
  includeLawyerLogs: boolean('include_lawyer_logs').notNull().default(false),
  data: jsonb('data').notNull(), // Full export data
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
