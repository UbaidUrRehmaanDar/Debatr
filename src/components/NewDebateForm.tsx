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
const DURATION_OPTIONS = [
  { value: 180000, label: "3 min" },
  { value: 300000, label: "5 min" },
  { value: 600000, label: "10 min" },
  { value: 900000, label: "15 min" },
];
const CHARACTER_OPTIONS = [1000, 2000, 3000, 5000];

export default function NewDebateForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState("oxford");
  const [selectedRounds, setSelectedRounds] = useState(4);
  const [selectedDuration, setSelectedDuration] = useState(300000);
  const [selectedCharacters, setSelectedCharacters] = useState(2000);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [useTemplate, setUseTemplate] = useState(false);

  const { data: templates } = api.templates.list.useQuery();
  const createDebate = api.debates.create.useMutation({
    onSuccess: (debate) => router.push(`/debates/${debate.id}`),
    onError: (err) => {
      setError(err.message || "Failed to create debate");
      setIsSubmitting(false);
    },
  });

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSelectedRounds(template.maxRounds);
      setSelectedDuration(template.roundDurationMs);
      setSelectedCharacters(template.maxCharactersPerTurn);
      setUseTemplate(true);
    }
  };

  // Handle custom configuration changes
  const handleCustomChange = () => {
    setUseTemplate(false);
    setSelectedTemplate(null);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const topic = String(formData.get("topic") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const opponentEmail = String(formData.get("opponentEmail") ?? "").trim();

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
        roundDurationMs: selectedDuration,
        maxCharactersPerTurn: selectedCharacters,
      });
    } catch {
      // Errors handled via onError
    }
  }

  return (
    <form onSubmit={handleSubmit} className="new-debate-form">
      {/* Template Selection */}
      {templates && templates.length > 0 && (
        <div>
          <div className="section-header" style={{ marginBottom: 12 }}>
            <span className="section-title">Start from Template</span>
            <span className="section-line" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            <button
              type="button"
              className={`template-card${!useTemplate ? " active" : ""}`}
              onClick={handleCustomChange}
              style={{
                padding: "12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                background: !useTemplate ? "var(--muted)" : "var(--card)",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)" }}>
                Custom Debate
              </div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 4 }}>
                Configure all settings manually
              </div>
            </button>
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                className={`template-card${selectedTemplate === template.id ? " active" : ""}`}
                onClick={() => handleTemplateSelect(template.id)}
                style={{
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  background: selectedTemplate === template.id ? "var(--muted)" : "var(--card)",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)" }}>
                  {template.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 4 }}>
                  {template.maxRounds} rounds · {Math.round(template.roundDurationMs / 60000)} min/turn
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

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
            defaultValue={selectedTemplate ? templates?.find(t => t.id === selectedTemplate)?.topic : ""}
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
            defaultValue={selectedTemplate ? templates?.find(t => t.id === selectedTemplate)?.description : ""}
            rows={3}
          />
        </div>
      </div>

      {/* Configuration */}
      <div>
        <div className="section-header" style={{ marginBottom: 12 }}>
          <span className="section-title">Configuration</span>
          <span className="section-line" />
        </div>
        
        {/* Format */}
        <div style={{ marginBottom: 20 }}>
          <label className="form-label" style={{ marginBottom: 8 }}>Format</label>
          <div className="format-grid">
            {FORMATS.map((fmt) => (
              <button
                key={fmt.id}
                type="button"
                className={`format-card${selectedFormat === fmt.id ? " active" : ""}`}
                onClick={() => { setSelectedFormat(fmt.id); handleCustomChange(); }}
              >
                <div className="format-card-title">{fmt.label}</div>
                <div className="format-card-sub">{fmt.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Rounds */}
        <div style={{ marginBottom: 20 }}>
          <label className="form-label" style={{ marginBottom: 8 }}>
            Rounds: <span style={{ fontWeight: 500, color: "var(--foreground)" }}>{selectedRounds}</span>
          </label>
          <div className="rounds-row">
            {ROUND_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                className={`round-btn${selectedRounds === n ? " active" : ""}`}
                onClick={() => { setSelectedRounds(n); handleCustomChange(); }}
              >
                {n}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 8 }}>
            Each participant gets one turn per round.
          </p>
        </div>

        {/* Time per turn */}
        <div style={{ marginBottom: 20 }}>
          <label className="form-label" style={{ marginBottom: 8 }}>
            Time per turn: <span style={{ fontWeight: 500, color: "var(--foreground)" }}>
              {DURATION_OPTIONS.find(d => d.value === selectedDuration)?.label}
            </span>
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`round-btn${selectedDuration === option.value ? " active" : ""}`}
                onClick={() => { setSelectedDuration(option.value); handleCustomChange(); }}
                style={{ minWidth: 80 }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Characters per turn */}
        <div>
          <label className="form-label" style={{ marginBottom: 8 }}>
            Characters per turn: <span style={{ fontWeight: 500, color: "var(--foreground)" }}>{selectedCharacters}</span>
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CHARACTER_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                className={`round-btn${selectedCharacters === n ? " active" : ""}`}
                onClick={() => { setSelectedCharacters(n); handleCustomChange(); }}
                style={{ minWidth: 80 }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
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
