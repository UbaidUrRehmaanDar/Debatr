# Debatr documentation

This directory is the project’s source of truth. It records confirmed decisions, separates them from open questions, and guides implementation.

## Start here

- [Project overview](PROJECT.md) — purpose, scope, and principles.
- [Product specification](SPEC.md) — the behaviour the product must provide.
- [Architecture](ARCHITECTURE.md) — technical boundaries and system design.
- [Decision log](DECISIONS.md) — confirmed choices and their rationale.
- [Open questions](QUESTIONS.md) — decisions that must not be guessed.
- [Roadmap](ROADMAP.md) — the order in which the project will be built.

## Detailed areas

- [AI subsystem](ai/README.md)
- [Debate engine](debates/FLOW.md)
- [Backend](backend/API.md)
- [Frontend](frontend/UI.md)
- [Development](development/SETUP.md)

## Documentation rules

1. Do not invent product behaviour when it is unspecified.
2. Record a confirmed product decision in `SPEC.md`; record its rationale in `DECISIONS.md` when it affects architecture or future work.
3. Put unresolved matters in `QUESTIONS.md`.
4. Keep runtime AI instructions in `prompts/`; documentation describes them but is not loaded by the application.
