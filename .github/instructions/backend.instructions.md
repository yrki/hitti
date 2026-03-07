---
applyTo: "backend/**"
---

# Backend Instructions — C# .NET WebAPI

## Architecture

- **Vertical feature slices** — organize code by feature, not by technical layer.
- Each feature lives in `Features/<Feature>/` and encapsulates its own endpoints, services, models, validators, and tests.
- A feature folder structure looks like:
  ```
  Features/<Feature>/
  ├── <Feature>Controller.cs   # API endpoints
  ├── <Feature>Service.cs      # Business logic
  ├── I<Feature>Service.cs     # Service interface
  ├── <Feature>Repository.cs   # Data access (if needed)
  ├── Models/                  # DTOs, request/response models
  ├── Validators/              # Input validation (FluentValidation)
  └── Tests/                   # Unit tests for this feature
  ```
- Cross-cutting concerns go in `Shared/` or `Infrastructure/` (middleware, extensions, base classes).
- Features must not reference other features' internal types directly. Use shared contracts or events.

## .NET & C# Conventions

- Target the latest LTS version of .NET.
- Enable nullable reference types (`<Nullable>enable</Nullable>`) in all projects.
- Use file-scoped namespaces.
- Use primary constructors where appropriate.
- Prefer records for immutable DTOs and value objects.
- Use `required` keyword for mandatory properties on models.
- Use pattern matching and switch expressions where they improve readability.

## API Design

- Follow RESTful conventions: proper HTTP verbs, status codes, and resource-based URLs.
- Use `[ApiController]` attribute and attribute routing.
- Return `ActionResult<T>` from controller actions for clear response typing.
- Use `TypedResults` (Minimal API) or `IActionResult` patterns consistently.
- Version APIs when breaking changes are introduced.
- Validate all input at the API boundary — use FluentValidation or data annotations.
- Return `ProblemDetails` (RFC 9457) for error responses.

## Dependency Injection

- Register services in DI with appropriate lifetimes (`Scoped`, `Transient`, `Singleton`).
- Prefer interface-based injection for testability.
- Use `IOptions<T>` pattern for configuration.
- Register feature services in per-feature extension methods: `AddMembersFeature()`.

## Data Access

- Use Entity Framework Core with code-first migrations.
- Keep DbContext configuration clean — use `IEntityTypeConfiguration<T>`.
- Use async/await for all database operations.
- Never expose `IQueryable` outside the repository/data layer.
- Use projections (`.Select()`) to avoid over-fetching.

## Error Handling

- Use middleware for global exception handling.
- Throw specific exception types — avoid generic `Exception`.
- Use Result/OneOf pattern for expected failure cases instead of exceptions.
- Log errors with structured logging (Serilog / Microsoft.Extensions.Logging).
- Never return stack traces or internal details in production error responses.

## Unit Testing

- Every service, validator, and controller must have unit tests.
- Use **xUnit** as the test framework, **Moq** or **NSubstitute** for mocking, and **FluentAssertions** for assertions.
- Test files mirror the source structure: `Features/<Feature>/Tests/<Feature>ServiceTests.cs`.
- Follow the **Arrange-Act-Assert** pattern in every test.
- Test one behavior per test method — use descriptive method names: `Should_ReturnNotFound_When_MemberDoesNotExist`.
- Mock external dependencies (repositories, HTTP clients, etc.) — never hit real databases or APIs.
- Test validation rules independently.
- Test both success and failure paths.
- Use `AutoFixture` or test builders for complex object creation.

## Security

- Validate and sanitize all user input.
- Use authentication/authorization middleware — never check auth manually in controllers.
- Store secrets in User Secrets (dev) or environment variables (prod) — never in source code.
- Use parameterized queries — never concatenate SQL strings.
- Apply CORS policies explicitly.

## Code Style

- Use `var` only when the type is obvious from the right-hand side.
- Use meaningful names — no Hungarian notation.
- Prefer LINQ over manual loops when it improves readability.
- Keep methods short — extract private methods for complex logic.
- Use `readonly` on fields that are not reassigned.
- Mark classes as `sealed` unless inheritance is explicitly intended.
