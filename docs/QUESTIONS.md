# Open questions

These questions are intentionally unresolved. Do not make implementation choices for them until they are decided and moved into the specification and, where relevant, the decision log.

## AI and evidence

- Which provider and exact models will be used initially?
- May the Lawyer access the web, and if so, through which service and citation-verification process?
- What source types qualify as acceptable evidence?
- What token, request, and cost limits apply per participant and per debate?

## Debate rules

- What are the initial default time limit, round count, and character limit?
- Which debate formats and round templates are supported at launch?
- Who or what grants a raise-hand request, and what is the timeout behaviour?
- Is `Inconclusive` a distinct final outcome or a subtype of `Draw` in stored data?

## Accounts and privacy

- Which authentication method(s) will be available?
- How long are debates, Lawyer logs, and exports retained?
- Who can access imported debate files and optional Lawyer logs?

## Future scope

- Is an ELO system needed for the private release?
- Are attachments needed at launch, and which file types are allowed?
- Which future agents should be designed next: Moderator, Fact Checker, or Coach?
