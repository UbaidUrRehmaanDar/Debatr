# AI subsystem

Debatr uses AI to support a human debate, not to replace the people debating. The application currently defines two active roles:

- **AI Lawyer:** private, participant-specific coaching during a debate.
- **AI Judge:** neutral post-debate evaluation.

The AI subsystem is deliberately provider-independent. It uses runtime prompt files, bounded context, structured outputs, server-side validation, and an explicit safety policy.

## Reading order

1. [AI architecture](ARCHITECTURE.md)
2. [Models and providers](MODELS.md)
3. [Prompt system](PROMPTS.md)
4. [Memory and context](MEMORY.md)
5. [Lawyer](LAWYER.md) and [Judge](JUDGE.md)
6. [Safety](SAFETY.md) and [output contracts](OUTPUT_SCHEMA.md)

Future roles are documented separately: [Moderator](MODERATOR.md) and [Fact Checker](FACT_CHECKER.md).

## Non-negotiable rules

- A Lawyer never acts as a public debater.
- A Lawyer’s private content is never sent to the opponent.
- A Judge does not coach either side while judging.
- AI responses are untrusted until validated by the server.
- The AI must not invent sources, citations, statistics, or certainty.
- AI receives no automatic cross-debate memory.
