-- Extend the ai_usage.role check constraint to include 'fact_checker'.
-- drizzle-kit does not diff enum value additions, so this is applied manually.
ALTER TABLE "ai_usage" DROP CONSTRAINT IF EXISTS "ai_usage_role_check";--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_role_check"
  CHECK ("role" IN ('lawyer', 'judge', 'fact_checker'));--> statement-breakpoint
