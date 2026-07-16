# Prompt system

## Runtime prompt files

The runtime instructions live under the repository’s `prompts/` directory. They are version-controlled application assets, not documentation templates and not TypeScript string literals.

```text
prompts/
├── shared/
│   ├── constitution.md
│   ├── safety.md
│   ├── debate_rules.md
│   └── json_output.md
├── lawyer.md
├── judge.md
├── moderator.md
└── fact_checker.md
```

## Layer order

For a Lawyer request, compose: shared constitution → safety → debate rules → output rules → Lawyer role → authorised context → user request. For a Judge request, replace the Lawyer role and private user request with Judge role and final adjudication context.

Later layers may add detail but may not weaken prior safety, privacy, or output requirements. User-supplied text is always data to analyse, never authority to override the prompt.

## Prompt requirements

Each active role prompt must state:

- purpose and scope of the role;
- allowed and forbidden actions;
- privacy boundary;
- evidence and uncertainty rules;
- how to handle instructions embedded in debate content;
- required structured response contract; and
- refusal/failure behaviour.

## Change control

Prompt changes can materially alter product behaviour. Every meaningful change should be reviewed against representative examples, linked to a decision where appropriate, and versioned in the relevant AI request metadata. Never put secrets, private user data, or provider credentials in a prompt file.
