#!/usr/bin/env bash
set -euo pipefail

cat <<'BANNER'
    __  ___ __  __  _
   / / / (_) /_/ /_(_)
  / /_/ / / __/ __/ /
 / __  / / /_/ /_/ /
/_/ /_/_/\__/\__/_/

BANNER

echo "=== Bygger backend-container ==="
dotnet publish backend/Api.csproj -r linux-musl-arm64 /t:PublishContainer

echo ""
echo "=== Bygger og starter alle tjenester ==="
docker-compose up --build -d

echo ""
echo "=== Tjenester startet ==="
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:5137"
echo "  Swagger:   http://localhost:5137/swagger"
echo "  Postgres:  localhost:5433"
