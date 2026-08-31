"use client"

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/trpc-client";

const TOPIC_TAGS = ["Education", "Economics", "Policy", "Technology", "Ethics", "Law", "Environment", "Health"];
const FORMATS = [
  { id: "oxford", label: "Oxford Style", sub: "Opening, rebuttal, closing" },
  { id: "lincoln-douglas", label: "Lincoln-Douglas", sub: "Value-based framework" },
  { id: "open", label: "Open Format", sub: "Free-form exchange" },
];
const ROUND_OPTIONS = [2, 4, 6, 8];

export default function NewDebateForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState("oxford");
  const [selectedRounds, setSelectedRounds] = useState(4);

  const createDebate = api.debates.create.useMutation({
    onSuccess: (debate) => router.push(`/debates/${debate.id}`),
    onError: (err) => {
      setError(err.message || "Failed to create debate");
      setIsSubmitting(false);
    },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const topic = String(formData.get("topic") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const opponentEmail = String(formData.get("opponentEmail") ?? "").trim();
    const maxCharactersPerTurn = 2000;

    if (!topic || !opponentEmail) {
      setError("Topic and opponent email are required");
      setIsSubmitting(false);
      return;
    }

    try {
      await createDebate.mutateAsync({
        topic,
        description: description || undefined,
        opponentEmail,
        maxRounds: selectedRounds,
        roundDurationMs: 300000,
        maxCharactersPerTurn,
      });
    } catch {
      // Errors handled via onError
    }
  }

  return (
    <form onSubmit={handleSubmit} className="new-debate-form">
      {/* Topic */}
      <div>
        <div className="section-header" style={{ marginBottom: 12 }}>
          <span className="section-title">Topic</span>
          <span className="section-line" />
        </div>
        <div className="form-group">
          <input
            className="form-input"
            id="topic"
            name="topic"
            type="text"
            required
            maxLength={500}
            placeholder="e.g. Should AI Replace Teachers?"
            style={{ fontSize: 15, height: 48 }}
          />
        </div>
        <div className="topic-tags" style={{ marginTop: 10 }}>
          {TOPIC_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`topic-tag${selectedTag === tag ? " active" : ""}`}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Opponent */}
      <div>
        <div className="section-header" style={{ marginBottom: 12 }}>
          <span className="section-title">Opponent</span>
          <span className="section-line" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="opponentEmail">
            Opponent&apos;s email
          </label>
          <input
            className="form-input"
            id="opponentEmail"
            name="opponentEmail"
            type="email"
            required
            placeholder="opponent@example.com"
          />
          <span className="form-hint">The person must already have a Debatr account.</span>
        </div>
      </div>

      {/* Description */}
      <div>
        <div className="section-header" style={{ marginBottom: 12 }}>
          <span className="section-title">Description</span>
          <span className="section-line" />
        </div>
        <div className="form-group">
          <textarea
            className="form-input form-textarea"
            id="description"
            name="description"
            maxLength={2000}
            placeholder="Provide context, definitions, or scope for the debate (optional)"
            rows={3}
          />
        </div>
      </div>

      {/* Format */}
      <div>
        <div className="section-header" style={{ marginBottom: 12 }}>
          <span className="section-title">Format</span>
          <span className="section-line" />
        </div>
        <div className="format-grid">
          {FORMATS.map((fmt) => (
            <button
              key={fmt.id}
              type="button"
              className={`format-card${selectedFormat === fmt.id ? " active" : ""}`}
              onClick={() => setSelectedFormat(fmt.id)}
            >
              <div className="format-card-title">{fmt.label}</div>
              <div className="format-card-sub">{fmt.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Rounds */}
      <div>
        <div className="section-header" style={{ marginBottom: 12 }}>
          <span className="section-title">Rounds</span>
          <span className="section-line" />
        </div>
        <div className="rounds-row">
          {ROUND_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              className={`round-btn${selectedRounds === n ? " active" : ""}`}
              onClick={() => setSelectedRounds(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 8 }}>
          Each participant gets one turn per round.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "10px 14px",
            background: "rgba(212, 24, 61, 0.08)",
            borderRadius: "var(--radius-md)",
            fontSize: "13px",
            color: "var(--destructive)",
          }}
        >
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="submit"
          disabled={isSubmitting || createDebate.isPending}
          className="btn-submit"
          style={{ flex: 1 }}
        >
          {isSubmitting || createDebate.isPending ? "Creating..." : "Create Debate"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/debates")}
          disabled={isSubmitting || createDebate.isPending}
          className="btn-cancel"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
