// Provider-agnostic "tool use" for the AI Lawyer/Judge.
//
// The OpenCode Zen chat endpoint is used in JSON mode, so we implement tool
// calling as a two-step protocol that works with any JSON-capable model:
//   1. We ask the model to emit a list of `toolCalls` (a tool name + args) as
//      part of its request, OR to skip tools and answer directly.
//   2. We execute the requested tools server-side (deterministic, no external
//      network calls) and feed the results back, then ask for the final answer.
//
// This avoids depending on a provider-specific function-calling schema while
// still letting the assistant look up evidence and compute scores.

export interface ToolContext {
  // Pinned evidence rows available to the debate.
  evidence: Array<{ side: string; claim: string; source?: string | null }>;
  // Public transcript (id, side, content).
  messages: Array<{ id: string; side: string; content: string }>;
}

export interface ToolCall {
  tool: string;
  args: Record<string, any>;
}

export interface ToolResult {
  tool: string;
  ok: boolean;
  result?: any;
  error?: string;
}

// Simple heuristic argument-scoring tool: rewards evidence-style claims
// (contains a number, source keyword, or citation marker) and penalizes
// very short or empty arguments. Deterministic and explainable.
export function scoreArgument(content: string): { score: number; reasons: string[] } {
  const text = (content ?? '').trim();
  const reasons: string[] = [];
  let score = 0.5;

  if (text.length >= 120) {
    score += 0.1;
    reasons.push('Developed point (>=120 chars).');
  }
  if (/\b(because|therefore|since|thus|according to|studies show|data shows)\b/i.test(text)) {
    score += 0.15;
    reasons.push('Uses reasoning connectors.');
  }
  if (/\b\d+(\.\d+)?(%|x| times| billion| million)?\b/.test(text)) {
    score += 0.1;
    reasons.push('Cites a quantity/statistic.');
  }
  if (/(https?:\/\/|source:|\[[0-9]+\]|\(.*\d{4}.*\))/.test(text)) {
    score += 0.1;
    reasons.push('Includes a citation or source marker.');
  }
  if (text.split(/\s+/).length < 8) {
    score -= 0.2;
    reasons.push('Very short / under-developed.');
  }

  score = Math.max(0, Math.min(1, Number(score.toFixed(2))));
  return { score, reasons };
}

// Lookup pinned evidence rows, optionally filtered by side or a keyword.
export function lookupEvidence(ctx: ToolContext, args: { side?: string; query?: string }): any[] {
  let rows = ctx.evidence;
  if (args.side) rows = rows.filter((e) => e.side === args.side);
  if (args.query) {
    const q = args.query.toLowerCase();
    rows = rows.filter(
      (e) => e.claim.toLowerCase().includes(q) || (e.source ?? '').toLowerCase().includes(q),
    );
  }
  return rows.map((e) => ({ side: e.side, claim: e.claim, source: e.source ?? null }));
}

// Count claims in the transcript that match a query (rough relevance check).
export function searchTranscript(ctx: ToolContext, args: { query?: string }): any[] {
  const q = (args.query ?? '').toLowerCase();
  if (!q) return [];
  return ctx.messages
    .filter((m) => m.content.toLowerCase().includes(q))
    .map((m) => ({ id: m.id, side: m.side, excerpt: m.content.slice(0, 200) }));
}

// Execute a single tool call against the provided context.
export function executeToolCall(call: ToolCall, ctx: ToolContext): ToolResult {
  try {
    switch (call.tool) {
      case 'score_argument': {
        const content = typeof call.args?.content === 'string' ? call.args.content : '';
        return { tool: call.tool, ok: true, result: scoreArgument(content) };
      }
      case 'lookup_evidence': {
        return { tool: call.tool, ok: true, result: lookupEvidence(ctx, call.args ?? {}) };
      }
      case 'search_transcript': {
        return { tool: call.tool, ok: true, result: searchTranscript(ctx, call.args ?? {}) };
      }
      default:
        return { tool: call.tool, ok: false, error: `Unknown tool: ${call.tool}` };
    }
  } catch (err) {
    return { tool: call.tool, ok: false, error: err instanceof Error ? err.message : 'tool error' };
  }
}

export const TOOL_DESCRIPTIONS = [
  'score_argument(args: { content: string }) -> heuristic quality score 0..1 with reasons',
  'lookup_evidence(args: { side?: "affirmative"|"negative"|"neutral", query?: string }) -> pinned evidence rows',
  'search_transcript(args: { query: string }) -> transcript messages mentioning the query',
].join('\n');
