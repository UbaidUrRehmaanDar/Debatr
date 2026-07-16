# Contribution standards

## Documentation-first workflow

When behaviour is unclear, stop and add it to `docs/QUESTIONS.md`. Once decided, update the appropriate specification and decision log before or alongside implementation. Do not fill gaps with hidden assumptions.

## Change expectations

- Keep changes scoped and explain the user-facing effect.
- Preserve private-data boundaries and server authority.
- Add/update tests when changing state, permissions, schemas, exports, or AI handling.
- Update documentation whenever behaviour, configuration, or architecture changes.
- Keep runtime prompts and schemas aligned with the documentation.
- Use accessible, respectful language in user-facing copy.

## Code conventions

Use TypeScript with strict typing, a shared validation approach, clear domain names, and small modules with one responsibility. Prefer explicit state transitions and exhaustive handling of enums over implicit strings or client-side shortcuts.

## Review checklist

1. Is the action authorised on the server?
2. Does the change preserve turn/lifecycle invariants?
3. Could it leak private Lawyer data or secrets?
4. Are input and AI output schemas updated and tested?
5. Does the documentation reflect the new behaviour?
6. Are errors safe, understandable, and non-sensitive?

## Git policy

Do not commit secrets, local environment files, generated user exports, or production data. Make small, meaningful commits once the repository’s branch/commit workflow is established. The current workspace has unrelated deleted tracked files; preserve them unless their owner explicitly asks for a restoration or removal.
