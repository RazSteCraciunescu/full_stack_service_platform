# ADR 0001: Use one domain with multiple isolated implementations

- Status: Accepted
- Date: 2026-08-30

## Context

The learning scope includes several frontend frameworks, backend languages, MySQL, local tooling and Azure examples. Combining every technology into a single runtime would create unnecessary services and imply an architecture that would be difficult to justify.

A collection of unrelated tutorial folders would be easier to assemble, but it would not demonstrate consistent domain modeling or API thinking.

## Decision

Use one service-request domain and one REST vocabulary across the repository.

The Node.js API and checked-in public client form the default runnable application. React, Vue, AngularJS and the fundamentals client are alternative consumers. Python, PHP and Laravel are isolated backend exercises with narrower responsibilities. MySQL and Azure remain explicit optional paths.

## Consequences

### Positive

- Models, validation rules and status values can be compared across languages.
- The repository tells one understandable product story.
- The first run has no database or cloud dependency.
- Legacy and modern technologies are clearly separated.
- Each optional folder can be studied without starting every service.

### Negative

- Some behavior is intentionally duplicated.
- The optional implementations do not share live state.
- A change to the contract may require updates in several folders.
- The repository is broader than a normal single-application codebase.

## Guardrails

- Keep `api/openapi.json` as the contract reference.
- Mark optional and legacy examples clearly.
- Do not claim the language-specific services are one distributed production system.
- Add a technology only when it demonstrates a distinct concept.
