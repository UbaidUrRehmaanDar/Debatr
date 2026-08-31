# Frontend UI and experience

## Purpose

The SvelteKit web application gives authorised users a focused interface for private debates, private Lawyer coaching, and transparent Judge reports. It presents server-authoritative state clearly; it does not simulate authority in the browser.

## Experience principles

- Keep the active speaker, current round, time remaining, and turn restrictions unmistakable.
- Separate public debate content from private Lawyer coaching visually and technically.
- Make the Judge report readable, constructive, and traceable to the actual debate.
- Avoid social-feed mechanics, engagement bait, public rankings, and features outside the initial private scope.
- Design for accessibility and plain language rather than assuming perfect English fluency.

## Core screens

| Screen | Purpose |
| --- | --- |
| Sign in / invited access | authenticate an approved user |
| Private debate list | show the user’s current and completed debates |
| Create / invite debate | select topic and permitted configuration, then invite a participant |
| Debate room | public transcript, active turn, timer, raise-hand status, and private Lawyer panel |
| Judge report | show outcome, confidence, weighted rubric, explanations, feedback, and conduct findings |
| Export / import | download a portable record or review a validated prior-debate reference |
| Profile/settings | limited account and session controls as eventually specified |

## Debate-room layout rules

The public transcript occupies the primary area. The Lawyer panel is explicitly marked private, shown only to the assigned participant, and must never appear in a shared layout, screen-visible notification, or opponent-facing event. The composer is disabled with a clear explanation when the user does not own the active turn.

The interface must show a server-derived timer/deadline and reconnect/status state. If the connection is lost, it must stop implying that a message was accepted until the server confirms it.

## Empty, loading, and error states

Every server-driven view needs clear states for loading, unauthorised access, missing debate, waiting for an invitee, paused debate, judging in progress, Lawyer unavailability, reconnecting, and export/import validation failure. Never hide an error by displaying stale state as current.
