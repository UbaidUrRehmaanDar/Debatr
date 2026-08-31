# AI memory and context

## Memory policy

Debatr has **no permanent AI memory** for a user. A new debate starts without automatically loading the user’s preferences, previous Lawyer chats, or earlier debate transcripts.

The application saves debate data normally. “No AI memory” means a later AI request is not silently given that saved data.

## Explicit prior-debate reference

A user may choose to import a previously exported debate JSON file as reference material. The server validates the file, records its provenance, and adds only the approved portions to the new debate context. Importing reference does not merge old and new debates or grant an opponent access to private Lawyer logs.

## Context strategy

Sending every historic message on every request is too costly; lossy free-form summaries can remove crucial distinctions. Debatr therefore uses a hybrid context:

1. stable instructions and output contract;
2. debate metadata: topic, format, side, rules, round, and limits;
3. structured pinned facts: positions, definitions, agreed points, disputed claims, and verified/claimed evidence;
4. the most recent relevant public messages; and
5. the participant’s current private request, for Lawyer calls.

The Judge receives the entire final transcript where it fits safely within the configured model context. If it does not fit, the system must use an explicitly documented, reviewable reduction strategy; it must never claim to have reviewed material that was omitted.

## Pinned facts

Pinned facts are structured application data, not model memory. They are created or confirmed through a future defined workflow, are attributable to a side or both participants, and must distinguish:

- a claim from a verified fact;
- agreement from disagreement;
- supplied evidence from an unverified citation.

## Data minimisation

Include only material relevant to the active role. Remove secrets, internal identifiers, and irrelevant account data. Never include opponent-private Lawyer messages in a Lawyer context.
