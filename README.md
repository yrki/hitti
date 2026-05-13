# Hitti — Aktivitetsstyring for foreninger

Hitti er en multi-tenant SaaS-plattform som hjelper foreninger og frivillige organisasjoner med å administrere aktiviteter og holde kontakten med medlemmene sine. En admin oppretter aktiviteter, inviterer medlemmer via e-post eller SMS, og følger opp hvem som deltar — alt fra ett enkelt grensesnitt. Medlemmene trenger ikke brukerkonto: de svarer på invitasjoner via en personlig lenke i meldingen de mottar.

## Tech stack

| Lag | Teknologi |
|---|---|
| Backend | .NET 10, C#, ASP.NET Core Web API |
| Frontend | React 19, TypeScript, Vite |
| Database | PostgreSQL 17 |
| Notifikasjoner | Azure Communication Services (e-post + SMS) |
| Autentisering | JWT (kun admin-brukere logger inn) |
| Containerisering | Docker / docker-compose |

## Repo-struktur

```
hitti/
├── backend/              # .NET 10 Web API
│   ├── Features/         # Funksjonsmoduler (Activities, Auth, Members, Organizations)
│   └── Infrastructure/   # Database, auth, bakgrunnskø, notifikasjoner
├── frontend/             # React + Vite SPA
│   └── src/
├── docs/                 # Prosjektdokumentasjon
│   ├── architecture/     # Systemarkitektur og teknologivalg
│   └── features/         # Funksjonsbeskrivelser (BDD-stil)
├── docker-compose.yml    # Kjører postgres, backend og frontend
├── seed.sql              # Testdata (20 medlemmer + 20 aktiviteter)
└── start.sh              # Bygger og starter alt med ett kommando
```

## Kom i gang lokalt

### Forutsetninger

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installert og kjørende
- [.NET 10 SDK](https://dotnet.microsoft.com/download) (for `start.sh`)

### Start applikasjonen

```bash
# Bygg backend-container og start alle tjenester
./start.sh
```

Tjenester etter oppstart:

| Tjeneste | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5137 |
| Swagger UI | http://localhost:5137/swagger |
| PostgreSQL | localhost:5433 |

### Last inn testdata

```bash
# Kobler til databasen og kjører seed-scriptet
docker exec -i hitti-db psql -U admin -d hitti < seed.sql
```

Seed-scriptet oppretter 20 medlemmer og 20 aktiviteter knyttet til organisasjonen med
`OrganizationId = 3e998d35-6902-41a9-8a03-594cdd8c07b9`.

### Kjør backend lokalt (uten Docker)

```bash
cd backend
dotnet run
```

Backend leser da fra `appsettings.json` og kobler til PostgreSQL på `localhost:5433`
(forutsetter at `docker-compose up postgres -d` kjører).

### Konfigurasjon

Kopier `appsettings.Development.json.example` (eller rediger `appsettings.json`) og sett:

- `AzureCommunication__ConnectionString` — nøkkel fra Azure Communication Services
- `App__DevRedirectEmail` — hvis satt, omdirigeres alle notifikasjoner til denne adressen (praktisk under utvikling)

## Videre lesning

- [Systemarkitektur](docs/architecture/overview.md) — multi-tenant modell, komponentoversikt og teknologivalg
- [Invitasjons- og RSVP-flyt](docs/features/invitations.md) — hvordan invitasjoner sendes og besvares
- [Autentisering](docs/features/auth.md) — JWT-oppsett, registrering, glemt passord
