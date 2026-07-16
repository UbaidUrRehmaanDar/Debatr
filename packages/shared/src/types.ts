export const APP_NAME = "Debatr" as const;

export type DebateVisibility = "public" | "private" | "invite-only";

export type DebateStatus = "pending" | "active" | "completed" | "cancelled";

export interface DebateParticipant {
  userId: string;
  side: "affirmative" | "negative";
}

export interface Debate {
  id: string;
  topic: string;
  visibility: DebateVisibility;
  status: DebateStatus;
  createdAt: string;
  participants: DebateParticipant[];
}

export interface DebateMessage {
  id: string;
  debateId: string;
  authorId: string;
  content: string;
  createdAt: string;
}
