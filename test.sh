#!/usr/bin/env bash
set -uo pipefail

cat <<'BANNER'
  _  _ _ _   _   _
 | || (_) |_| |_(_)
 | __ | |  _|  _| |
 |_||_|_|\__|\__|_|

BANNER

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

REPORT_DIR="$SCRIPT_DIR/test-results"
BACKEND_DIR="$REPORT_DIR/backend"
COVERAGE_DIR="$REPORT_DIR/coverage"
rm -rf "$REPORT_DIR"
mkdir -p "$BACKEND_DIR" "$COVERAGE_DIR"

BACKEND_LOG="$REPORT_DIR/backend.log"
FRONTEND_LOG="$REPORT_DIR/frontend.log"
FRONTEND_JSON="$REPORT_DIR/frontend.json"
PLAYWRIGHT_LOG="$REPORT_DIR/playwright.log"
SUMMARY_HTML="$REPORT_DIR/index.html"

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
BLUE="\033[0;34m"
NC="\033[0m"

backend_status="skipped"
backend_passed=0
backend_failed=0
backend_total=0

frontend_status="skipped"
frontend_passed=0
frontend_failed=0
frontend_total=0

playwright_status="skipped"
playwright_passed=0
playwright_failed=0
playwright_total=0
playwright_skip_reason=""

run_backend() {
  echo -e "${BLUE}=== Backend (.NET xUnit) ===${NC}"
  if dotnet test --nologo \
      --logger "trx;LogFileName=backend.trx" \
      --collect:"XPlat Code Coverage" \
      --results-directory "$BACKEND_DIR" 2>&1 | tee "$BACKEND_LOG"; then
    backend_status="passed"
  else
    backend_status="failed"
  fi

  local summary
  summary=$(grep -E "Passed!|Failed!" "$BACKEND_LOG" | tail -1 || true)
  if [[ -n "$summary" ]]; then
    backend_passed=$(echo "$summary" | grep -oE "Passed:[ ]*[0-9]+" | grep -oE "[0-9]+" || echo 0)
    backend_failed=$(echo "$summary" | grep -oE "Failed:[ ]*[0-9]+" | grep -oE "[0-9]+" || echo 0)
    backend_total=$(echo "$summary" | grep -oE "Total:[ ]*[0-9]+" | grep -oE "[0-9]+" || echo 0)
  fi

  local cov_xml
  cov_xml=$(find "$BACKEND_DIR" -name "coverage.cobertura.xml" -print -quit 2>/dev/null || true)
  if [[ -n "$cov_xml" ]]; then
    echo "Genererer HTML-coverage-rapport ..."
    dotnet reportgenerator \
      -reports:"$cov_xml" \
      -targetdir:"$COVERAGE_DIR" \
      -reporttypes:"HtmlInline_AzurePipelines;TextSummary" \
      -assemblyfilters:"+Api" \
      -filefilters:"-**/Migrations/**;-**/obj/**;-**/*Designer.cs;-**/*ModelSnapshot.cs;-**/*.generated.cs" \
      > /dev/null 2>&1 || echo "(reportgenerator feilet, hopper over coverage-HTML)"
  fi
}

run_frontend() {
  echo -e "\n${BLUE}=== Frontend (Vitest) ===${NC}"
  pushd "$SCRIPT_DIR/frontend" > /dev/null

  if [[ ! -d node_modules ]]; then
    echo "Installerer frontend-avhengigheter ..."
    npm install --no-audit --no-fund 2>&1 | tail -3
  fi

  if npx vitest run --reporter=default --reporter=json --outputFile="$FRONTEND_JSON" 2>&1 | tee "$FRONTEND_LOG"; then
    frontend_status="passed"
  else
    frontend_status="failed"
  fi

  local summary
  summary=$(grep -E "Tests[ ]+[0-9]+" "$FRONTEND_LOG" | tail -1 || true)
  if [[ -n "$summary" ]]; then
    frontend_passed=$(echo "$summary" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+" || echo 0)
    frontend_failed=$(echo "$summary" | grep -oE "[0-9]+ failed" | grep -oE "[0-9]+" || echo 0)
    frontend_total=$((frontend_passed + frontend_failed))
  fi

  popd > /dev/null
}

ensure_playwright_installed() {
  if [[ ! -d node_modules/@playwright/test ]]; then
    echo "Installerer Playwright npm-pakker ..."
    if ! npm install --no-audit --no-fund 2>&1 | tail -3; then
      playwright_skip_reason="Klarte ikke å kjøre \`npm install\` i e2e/. Sjekk Node-installasjonen."
      echo -e "${YELLOW}$playwright_skip_reason${NC}"
      echo "$playwright_skip_reason" > "$PLAYWRIGHT_LOG"
      return 1
    fi
  fi

  local cache_dir
  if [[ -n "${PLAYWRIGHT_BROWSERS_PATH:-}" ]]; then
    cache_dir="$PLAYWRIGHT_BROWSERS_PATH"
  elif [[ "$(uname)" == "Darwin" ]]; then
    cache_dir="$HOME/Library/Caches/ms-playwright"
  else
    cache_dir="$HOME/.cache/ms-playwright"
  fi

  if ! compgen -G "$cache_dir/chromium-*" > /dev/null; then
    echo "Installerer Chromium-nettleser for Playwright ..."
    if ! npx playwright install chromium 2>&1 | tail -5; then
      playwright_skip_reason="Klarte ikke å installere Chromium for Playwright."
      echo -e "${YELLOW}$playwright_skip_reason${NC}"
      echo "$playwright_skip_reason" > "$PLAYWRIGHT_LOG"
      return 1
    fi
  fi
}

run_playwright() {
  echo -e "\n${BLUE}=== Playwright E2E ===${NC}"
  local base_url="${E2E_BASE_URL:-http://localhost:3000}"

  if ! curl -sS -m 3 -o /dev/null "$base_url"; then
    playwright_skip_reason="Frontend ($base_url) er ikke tilgjengelig. Kjør \`./start.sh\` først."
    echo -e "${YELLOW}Hopper over: $playwright_skip_reason${NC}"
    echo "$playwright_skip_reason" > "$PLAYWRIGHT_LOG"
    return
  fi

  pushd "$SCRIPT_DIR/e2e" > /dev/null

  if ! ensure_playwright_installed; then
    popd > /dev/null
    return
  fi

  if npx playwright test --reporter=list,html 2>&1 | tee "$PLAYWRIGHT_LOG"; then
    playwright_status="passed"
  else
    playwright_status="failed"
  fi

  local summary
  summary=$(grep -E "[0-9]+ passed|[0-9]+ failed" "$PLAYWRIGHT_LOG" | tail -1 || true)
  if [[ -n "$summary" ]]; then
    playwright_passed=$(echo "$summary" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+" || echo 0)
    playwright_failed=$(echo "$summary" | grep -oE "[0-9]+ failed" | grep -oE "[0-9]+" || echo 0)
    playwright_total=$((playwright_passed + playwright_failed))
  fi

  popd > /dev/null
}

generate_report() {
  local timestamp
  timestamp=$(date "+%Y-%m-%d %H:%M:%S")

  python3 "$SCRIPT_DIR/scripts/build-report.py" \
    --report-dir "$REPORT_DIR" \
    --output "$SUMMARY_HTML" \
    --timestamp "$timestamp" \
    --backend-status "$backend_status" \
    --backend-passed "$backend_passed" \
    --backend-failed "$backend_failed" \
    --backend-total "$backend_total" \
    --frontend-status "$frontend_status" \
    --frontend-passed "$frontend_passed" \
    --frontend-failed "$frontend_failed" \
    --frontend-total "$frontend_total" \
    --playwright-status "$playwright_status" \
    --playwright-passed "$playwright_passed" \
    --playwright-failed "$playwright_failed" \
    --playwright-total "$playwright_total" \
    --playwright-skip-reason "$playwright_skip_reason"

  echo -e "\n${BLUE}=== Sammendrag ===${NC}"
  echo "  Backend:    $backend_passed/$backend_total ($backend_status)"
  echo "  Frontend:   $frontend_passed/$frontend_total ($frontend_status)"
  echo "  Playwright: $playwright_passed/$playwright_total ($playwright_status)"
  echo "  Rapport:    $SUMMARY_HTML"
}

open_report() {
  if command -v open > /dev/null; then
    open "$SUMMARY_HTML"
  elif command -v xdg-open > /dev/null; then
    xdg-open "$SUMMARY_HTML"
  else
    echo "Åpne rapporten manuelt: $SUMMARY_HTML"
  fi
}

run_backend
run_frontend
run_playwright
generate_report
open_report
