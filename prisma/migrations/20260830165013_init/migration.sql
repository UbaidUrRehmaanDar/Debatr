-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "used_by_id" TEXT,
    "used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debates" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'waiting_for_participants',
    "max_rounds" INTEGER NOT NULL,
    "round_duration_ms" INTEGER NOT NULL,
    "max_characters_per_turn" INTEGER NOT NULL,
    "current_round" INTEGER NOT NULL DEFAULT 0,
    "current_turn_id" TEXT,
    "judge_report_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "debates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debate_participants" (
    "id" TEXT NOT NULL,
    "debate_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "debate_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turns" (
    "id" TEXT NOT NULL,
    "debate_id" TEXT NOT NULL,
    "round_index" INTEGER NOT NULL,
    "turn_index" INTEGER NOT NULL,
    "side" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "turns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "debate_id" TEXT NOT NULL,
    "turn_id" TEXT,
    "sender_id" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lawyer_conversations" (
    "id" TEXT NOT NULL,
    "debate_id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lawyer_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lawyer_requests" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "participant_request" TEXT NOT NULL,
    "context" JSONB NOT NULL,
    "ai_response" JSONB NOT NULL,
    "tokens_used" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lawyer_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "judge_reports" (
    "id" TEXT NOT NULL,
    "debate_id" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "verdict" TEXT NOT NULL,
    "scores" JSONB NOT NULL,
    "strengths" JSONB NOT NULL,
    "weaknesses" JSONB NOT NULL,
    "feedback" JSONB NOT NULL,
    "fallacies" JSONB NOT NULL,
    "conduct_findings" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "tokens_used" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "judge_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_usage" (
    "id" TEXT NOT NULL,
    "debate_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "tokens_used" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "request_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_events" (
    "id" TEXT NOT NULL,
    "debate_id" TEXT,
    "message_id" TEXT,
    "user_id" TEXT,
    "category" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "explanation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raise_hand_requests" (
    "id" TEXT NOT NULL,
    "debate_id" TEXT NOT NULL,
    "requester_id" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "decided_by_id" TEXT,
    "decided_at" TIMESTAMP(3),
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "raise_hand_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence" (
    "id" TEXT NOT NULL,
    "debate_id" TEXT NOT NULL,
    "pinned_by_id" TEXT NOT NULL,
    "side" TEXT NOT NULL DEFAULT 'neutral',
    "claim" TEXT NOT NULL,
    "source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fact_checks" (
    "id" TEXT NOT NULL,
    "debate_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "checked_by_id" TEXT,
    "verdict" TEXT NOT NULL,
    "claims" JSONB NOT NULL,
    "model" TEXT NOT NULL,
    "tokens_used" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fact_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exports" (
    "id" TEXT NOT NULL,
    "debate_id" TEXT,
    "source_debate_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "include_lawyer_logs" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debate_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'other',
    "max_rounds" INTEGER NOT NULL DEFAULT 4,
    "round_duration_ms" INTEGER NOT NULL DEFAULT 300000,
    "max_characters_per_turn" INTEGER NOT NULL DEFAULT 2000,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "debate_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "debate_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_code_key" ON "invitations"("code");

-- CreateIndex
CREATE INDEX "invitations_created_by_id_idx" ON "invitations"("created_by_id");

-- CreateIndex
CREATE INDEX "invitations_email_idx" ON "invitations"("email");

-- CreateIndex
CREATE INDEX "invitations_expires_at_idx" ON "invitations"("expires_at");

-- CreateIndex
CREATE INDEX "debates_status_idx" ON "debates"("status");

-- CreateIndex
CREATE INDEX "debates_created_at_idx" ON "debates"("created_at");

-- CreateIndex
CREATE INDEX "debate_participants_debate_id_idx" ON "debate_participants"("debate_id");

-- CreateIndex
CREATE INDEX "debate_participants_user_id_idx" ON "debate_participants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "debate_participants_debate_id_user_id_key" ON "debate_participants"("debate_id", "user_id");

-- CreateIndex
CREATE INDEX "turns_debate_id_status_idx" ON "turns"("debate_id", "status");

-- CreateIndex
CREATE INDEX "turns_debate_id_idx" ON "turns"("debate_id");

-- CreateIndex
CREATE INDEX "messages_debate_id_created_at_idx" ON "messages"("debate_id", "created_at");

-- CreateIndex
CREATE INDEX "messages_debate_id_idx" ON "messages"("debate_id");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE UNIQUE INDEX "lawyer_conversations_debate_id_participant_id_key" ON "lawyer_conversations"("debate_id", "participant_id");

-- CreateIndex
CREATE INDEX "lawyer_requests_conversation_id_idx" ON "lawyer_requests"("conversation_id");

-- CreateIndex
CREATE UNIQUE INDEX "judge_reports_debate_id_key" ON "judge_reports"("debate_id");

-- CreateIndex
CREATE INDEX "ai_usage_debate_id_idx" ON "ai_usage"("debate_id");

-- CreateIndex
CREATE INDEX "ai_usage_created_at_idx" ON "ai_usage"("created_at");

-- CreateIndex
CREATE INDEX "ai_usage_role_idx" ON "ai_usage"("role");

-- CreateIndex
CREATE INDEX "moderation_events_debate_id_idx" ON "moderation_events"("debate_id");

-- CreateIndex
CREATE INDEX "raise_hand_requests_debate_id_status_idx" ON "raise_hand_requests"("debate_id", "status");

-- CreateIndex
CREATE INDEX "evidence_debate_id_idx" ON "evidence"("debate_id");

-- CreateIndex
CREATE INDEX "fact_checks_debate_id_message_id_idx" ON "fact_checks"("debate_id", "message_id");

-- CreateIndex
CREATE INDEX "exports_debate_id_idx" ON "exports"("debate_id");

-- CreateIndex
CREATE INDEX "exports_created_by_id_idx" ON "exports"("created_by_id");

-- CreateIndex
CREATE INDEX "exports_created_at_idx" ON "exports"("created_at");

-- CreateIndex
CREATE INDEX "debate_templates_category_idx" ON "debate_templates"("category");

-- CreateIndex
CREATE INDEX "bookmarks_user_id_idx" ON "bookmarks"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_user_id_debate_id_key" ON "bookmarks"("user_id", "debate_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_used_by_id_fkey" FOREIGN KEY ("used_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debate_participants" ADD CONSTRAINT "debate_participants_debate_id_fkey" FOREIGN KEY ("debate_id") REFERENCES "debates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debate_participants" ADD CONSTRAINT "debate_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turns" ADD CONSTRAINT "turns_debate_id_fkey" FOREIGN KEY ("debate_id") REFERENCES "debates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_debate_id_fkey" FOREIGN KEY ("debate_id") REFERENCES "debates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_turn_id_fkey" FOREIGN KEY ("turn_id") REFERENCES "turns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lawyer_conversations" ADD CONSTRAINT "lawyer_conversations_debate_id_fkey" FOREIGN KEY ("debate_id") REFERENCES "debates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lawyer_conversations" ADD CONSTRAINT "lawyer_conversations_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lawyer_requests" ADD CONSTRAINT "lawyer_requests_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "lawyer_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judge_reports" ADD CONSTRAINT "judge_reports_debate_id_fkey" FOREIGN KEY ("debate_id") REFERENCES "debates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_debate_id_fkey" FOREIGN KEY ("debate_id") REFERENCES "debates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_events" ADD CONSTRAINT "moderation_events_debate_id_fkey" FOREIGN KEY ("debate_id") REFERENCES "debates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_events" ADD CONSTRAINT "moderation_events_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_events" ADD CONSTRAINT "moderation_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raise_hand_requests" ADD CONSTRAINT "raise_hand_requests_debate_id_fkey" FOREIGN KEY ("debate_id") REFERENCES "debates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raise_hand_requests" ADD CONSTRAINT "raise_hand_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raise_hand_requests" ADD CONSTRAINT "raise_hand_requests_decided_by_id_fkey" FOREIGN KEY ("decided_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_debate_id_fkey" FOREIGN KEY ("debate_id") REFERENCES "debates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_pinned_by_id_fkey" FOREIGN KEY ("pinned_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fact_checks" ADD CONSTRAINT "fact_checks_debate_id_fkey" FOREIGN KEY ("debate_id") REFERENCES "debates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fact_checks" ADD CONSTRAINT "fact_checks_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fact_checks" ADD CONSTRAINT "fact_checks_checked_by_id_fkey" FOREIGN KEY ("checked_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exports" ADD CONSTRAINT "exports_debate_id_fkey" FOREIGN KEY ("debate_id") REFERENCES "debates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exports" ADD CONSTRAINT "exports_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_debate_id_fkey" FOREIGN KEY ("debate_id") REFERENCES "debates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
