# Copilot Instructions — Hitti

This is a monorepo with two projects:

- **frontend/** — React + TypeScript (Vite)
- **backend/** — C# .NET WebAPI

## General Principles

- Write clean, readable, and maintainable code.
- Follow SOLID principles and separation of concerns.
- Prefer composition over inheritance.
- All code must have unit tests. No feature or fix is complete without corresponding tests.
- Use descriptive naming — avoid abbreviations and single-letter variables outside loops.
- Keep functions and methods small and focused on a single responsibility.
- Handle errors explicitly — never swallow exceptions silently.
- Use strict/nullable types — avoid `any` (TypeScript) and enable nullable reference types (C#).
- Never use magic strings for fixed sets of values (statuses, roles, channels, etc.) — always define enums.

See project-specific instructions in:
- [Frontend instructions](.github/instructions/frontend.instructions.md)
- [Backend instructions](.github/instructions/backend.instructions.md)
