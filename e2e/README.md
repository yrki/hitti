# Hitti E2E-tester

End-to-end-tester for Hitti, skrevet med [Playwright](https://playwright.dev/)
og TypeScript. Dette prosjektet er bevisst isolert fra `backend.Tests` og
`frontend/` — det er en helt egen pakke som kjører mot en kjørende stack.

## Forutsetninger

1. **Stacken må kjøre lokalt.** Vi spinner _ikke_ opp servere automatisk via
   `webServer` i Playwright-konfigen. Du må selv starte alt:
   ```bash
   # fra repo-roten
   docker-compose up -d
   ```
   Dette starter Postgres på `localhost:5433`, backend på `localhost:5137` og
   frontend på `localhost:3000`.

2. **Seed-data må være lastet.** Testene antar at `seed.sql` har blitt kjørt
   mot databasen, slik at organisasjonen
   `3e998d35-6902-41a9-8a03-594cdd8c07b9` og medlemmene finnes. RSVP-testene
   henter invitasjons-token direkte fra Postgres på `localhost:5433`.

3. **Node 20+** (vi bruker Node 24 lokalt).

## Installasjon

```bash
cd e2e
npm install
npx playwright install
```

Eller via skript:
```bash
npm install
npm run install-browsers
```

## Kjøre testene

```bash
# alle tester (headless)
npm test

# interaktiv UI-modus — fin for debugging
npm run test:ui

# bare liste opp tester uten å kjøre dem
npm run test:list

# kjør én enkelt fil
npx playwright test tests/auth.spec.ts

# kjør med synlig browser
npx playwright test --headed
```

HTML-rapport havner i `playwright-report/`. Åpne den med:
```bash
npx playwright show-report
```

## Tilpasse baseURL

Standard er `http://localhost:3000`. Override via env-var:
```bash
E2E_BASE_URL=https://staging.example.com npm test
```

For RSVP-testene som leser direkte fra Postgres kan du også sette:
```bash
E2E_DB_HOST=localhost
E2E_DB_PORT=5433
E2E_DB_USER=admin
E2E_DB_PASSWORD=superhemmeligpassord!
E2E_DB_NAME=hitti
```

## Struktur

```
e2e/
├── tests/
│   ├── auth.spec.ts              # Registrering, login, logout
│   ├── activities.spec.ts        # CRUD på aktiviteter
│   ├── invitations-rsvp.spec.ts  # Invitasjoner + RSVP-flyten
│   └── helpers/
│       ├── auth.ts               # Registrering/innlogging-helpers
│       ├── db.ts                 # Postgres-tilkobling
│       └── data.ts               # Unike testdata
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

## Designvalg

- **Hver test lager sine egne testdata** (timestamp/UUID i navn/e-post) for å
  unngå konflikter med seed-data og parallellkjøringer.
- **Page Object pattern** er bevisst _ikke_ tatt i bruk — vi har under en
  håndfull helpers og introduserer det først hvis det vokser.
- **RSVP-tokens hentes fra Postgres** rett etter at invitasjonen er sendt.
  Det er den enkleste måten å få et gyldig token uten å lese ekte e-post.
- **Strict TypeScript-mode** er på, og tester bruker `test.describe` /
  `test.beforeEach` for sammenhengende state.
