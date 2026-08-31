# Debatr project overview

## Purpose

Debatr is a private, AI-assisted structured debate platform. Two people debate a defined motion. Each participant may privately consult an AI Lawyer, while a neutral AI Judge evaluates the completed debate.

AI supports human reasoning; it does not replace the debaters or speak publicly on their behalf.

## Current scope

- Private project for a maximum of ten users for approximately the next year.
- Optimised for clarity, safety, low cost, and maintainability rather than scale.
- Two human participants per debate.
- Turn-based, judge-controlled text debates.
- Session-only AI memory.
- Export and later import of debate records as JSON.

## Goals

- Make disagreements more thoughtful, structured, and educational.
- Help participants formulate, test, and improve their own arguments.
- Reward logic, evidence, rebuttal, structure, and responsiveness—not grammar or English fluency.
- Produce transparent feedback after every debate.
- Keep AI behaviour bounded, private where appropriate, and auditable.

## Non-goals for the current release

- Public social network, public leaderboards, or open matchmaking.
- High-scale infrastructure, microservices, queues, sharding, or multi-region deployment.
- Voice debates, team debates, tournaments, or a mobile app.
- Long-term personal AI memory.
- Letting users select AI models.

## Product principles

1. **Human-first:** participants make the claims and decisions.
2. **Fairness:** both sides have equivalent access to coaching and the same rules.
3. **Transparency:** judge reports explain scoring and deductions.
4. **Evidence integrity:** AI must not fabricate sources, citations, statistics, or certainty.
5. **Privacy:** Lawyer conversations are private to the relevant participant and the service.
6. **Explicit decisions:** unknown behaviour belongs in `QUESTIONS.md`, never in an assumption.
