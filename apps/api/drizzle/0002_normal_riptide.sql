CREATE TABLE "evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"debate_id" uuid NOT NULL,
	"pinned_by_id" text NOT NULL,
	"side" text DEFAULT 'neutral' NOT NULL,
	"claim" text NOT NULL,
	"source" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_debate_id_debates_id_fk" FOREIGN KEY ("debate_id") REFERENCES "public"."debates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_pinned_by_id_users_id_fk" FOREIGN KEY ("pinned_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;