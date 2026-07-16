import { z } from "zod";

export const debateVisibilitySchema = z.enum([
  "public",
  "private",
  "invite-only",
]);

export const createDebateSchema = z.object({
  topic: z.string().min(3).max(280),
  visibility: debateVisibilitySchema.default("public"),
});

export const debateMessageSchema = z.object({
  debateId: z.string().min(1),
  content: z.string().min(1).max(5000),
});

export type CreateDebateInput = z.infer<typeof createDebateSchema>;
export type DebateMessageInput = z.infer<typeof debateMessageSchema>;
