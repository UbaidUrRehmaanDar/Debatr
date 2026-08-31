# Pages and routes

## Route policy

Routes are private by default once authentication is selected. Route guards improve the experience, but the backend independently authorises every data request and WebSocket subscription.

## Proposed initial routes

| Route | Screen | Access |
| --- | --- | --- |
| `/` | redirect to the user’s private debate list or sign-in | public redirect |
| `/sign-in` | authentication entry | unauthenticated users |
| `/debates` | active/completed private debates | authenticated user |
| `/debates/new` | create and invite | authorised creator |
| `/debates/[debateId]` | active or paused debate room | participant only |
| `/debates/[debateId]/report` | completed Judge report | participant only |
| `/imports/new` | validate and preview an exported JSON file | authenticated user |
| `/settings` | account/session preferences | authenticated user |

## Route data requirements

The debate-room route loads an authoritative debate snapshot, participant side, current turn, permitted actions, transcript, and any participant-private Lawyer history authorised for display. It must not receive the opponent’s Lawyer data.

The Judge-report route loads the completed report and rule/rubric version used for that debate. If judging is incomplete, redirect to the debate status or display the explicit judging state rather than fabricating a result.

## Not included at launch

No public debate pages, public profiles, search, leaderboards, rankings, public spectators, or social discovery routes are part of the initial private release.
