ALTER TABLE "exports" ALTER COLUMN "debate_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "exports" ADD COLUMN "source_debate_id" text;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_used_by_unique" UNIQUE("used_by");