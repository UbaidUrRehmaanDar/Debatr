# Open questions

These questions are intentionally unresolved. Do not make implementation choices for them until they are decided and moved into the specification and, where relevant, the decision log.

## AI and evidence

- Which exact Lawyer and Judge model IDs will be used? The provider is decided (OpenCode Zen); model IDs remain unconfirmed until a non-production evaluation verifies structured-JSON reliability, context capacity, prompt adherence, and acceptable privacy/retention terms.
- May the Lawyer access the web, and if so, through which service and citation-verification process?
- What source types qualify as acceptable evidence?
- What token, request, and cost limits apply per participant and per debate?

## Authentication

- Which email service sends verification and password-reset messages, and how is its credential managed?
- What is the administrator bootstrap method, invitation expiry, and session duration?
- What is the account-deletion and data-retention policy?

## Debate rules

- Which debate formats and round templates are supported at launch?
- Who or what grants a raise-hand request, and what is the timeout behaviour?
- Is `Inconclusive` a distinct final outcome or a subtype of `Draw` in stored data?

## Accounts and privacy

- How long are debates, Lawyer logs, and exports retained?
- Who can access imported debate files and optional Lawyer logs?

## Future scope

- Is an ELO system needed for the private release?
- Are attachments needed at launch, and which file types are allowed?
- Which future agents should be designed next: Moderator, Fact Checker, or Coach?
