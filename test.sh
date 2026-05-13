#!/usr/bin/env bash
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

REPORT_DIR="$SCRIPT_DIR/test-results"
mkdir -p "$REPORT_DIR"

BACKEND_LOG="$REPORT_DIR/backend.log"
FRONTEND_LOG="$REPORT_DIR/frontend.log"
PLAYWRIGHT_LOG="$REPORT_DIR/playwright.log"
SUMMARY_HTML="$REPORT_DIR/index.html"

# ANSI color codes
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
  if dotnet test --nologo 2>&1 | tee "$BACKEND_LOG"; then
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
}

run_frontend() {
  echo -e "\n${BLUE}=== Frontend (Vitest) ===${NC}"
  pushd "$SCRIPT_DIR/frontend" > /dev/null

  if [[ ! -d node_modules ]]; then
    echo "Installerer frontend-avhengigheter ..."
    npm install --no-audit --no-fund 2>&1 | tail -3
  fi

  if npm test 2>&1 | tee "$FRONTEND_LOG"; then
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

run_playwright() {
  echo -e "\n${BLUE}=== Playwright E2E ===${NC}"
  local base_url="${E2E_BASE_URL:-http://localhost:3000}"

  if ! curl -sS -m 3 -o /dev/null "$base_url"; then
    playwright_skip_reason="Frontend ($base_url) er ikke tilgjengelig. Kjør \`docker-compose up\` først."
    echo -e "${YELLOW}Hopper over: $playwright_skip_reason${NC}"
    echo "$playwright_skip_reason" > "$PLAYWRIGHT_LOG"
    return
  fi

  pushd "$SCRIPT_DIR/e2e" > /dev/null

  if [[ ! -d node_modules ]]; then
    echo "Installerer Playwright-avhengigheter ..."
    npm install --no-audit --no-fund 2>&1 | tail -3
    npx playwright install chromium 2>&1 | tail -3
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

  local total_passed=$((backend_passed + frontend_passed + playwright_passed))
  local total_failed=$((backend_failed + frontend_failed + playwright_failed))
  local total_total=$((backend_total + frontend_total + playwright_total))

  local backend_badge frontend_badge playwright_badge
  backend_badge=$(badge "$backend_status")
  frontend_badge=$(badge "$frontend_status")
  playwright_badge=$(badge "$playwright_status")

  local playwright_html_link=""
  if [[ -d "$SCRIPT_DIR/e2e/playwright-report" ]]; then
    playwright_html_link='<p><a href="../e2e/playwright-report/index.html">Åpne Playwright HTML-rapport →</a></p>'
  fi

  local playwright_skip_block=""
  if [[ -n "$playwright_skip_reason" ]]; then
    playwright_skip_block="<p class=\"skip\">$playwright_skip_reason</p>"
  fi

  cat > "$SUMMARY_HTML" <<HTML
<!DOCTYPE html>
<html lang="no">
<head>
<meta charset="utf-8">
<title>Hitti — Testrapport</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 960px; margin: 40px auto; padding: 0 20px; color: #1f2937; }
  h1 { margin-bottom: 4px; }
  .timestamp { color: #6b7280; font-size: 14px; margin-bottom: 32px; }
  .totals { display: flex; gap: 16px; margin-bottom: 32px; }
  .totals .card { flex: 1; background: #f3f4f6; padding: 16px 20px; border-radius: 12px; }
  .totals .card .num { font-size: 28px; font-weight: 700; }
  .totals .card .lbl { color: #6b7280; font-size: 13px; }
  .suite { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px 24px; margin-bottom: 16px; }
  .suite h2 { margin: 0 0 8px; font-size: 18px; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; margin-left: 8px; }
  .badge.passed { background: #d1fae5; color: #047857; }
  .badge.failed { background: #fee2e2; color: #b91c1c; }
  .badge.skipped { background: #fef3c7; color: #92400e; }
  .counts { color: #4b5563; font-size: 14px; margin: 8px 0; }
  details { margin-top: 8px; }
  summary { cursor: pointer; color: #2563eb; font-size: 14px; }
  pre { background: #0f172a; color: #e2e8f0; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 12px; line-height: 1.5; max-height: 400px; }
  .skip { color: #92400e; font-style: italic; margin: 8px 0; }
  a { color: #2563eb; }
</style>
</head>
<body>
  <h1>Hitti — Testrapport</h1>
  <p class="timestamp">Generert $timestamp</p>

  <div class="totals">
    <div class="card"><div class="num">$total_total</div><div class="lbl">Tester totalt</div></div>
    <div class="card"><div class="num" style="color:#047857;">$total_passed</div><div class="lbl">Bestått</div></div>
    <div class="card"><div class="num" style="color:#b91c1c;">$total_failed</div><div class="lbl">Feilet</div></div>
  </div>

  <div class="suite">
    <h2>Backend (.NET xUnit) $backend_badge</h2>
    <div class="counts">$backend_passed bestått / $backend_failed feilet / $backend_total totalt</div>
    <details><summary>Vis loggen</summary><pre>$(escape_html "$BACKEND_LOG")</pre></details>
  </div>

  <div class="suite">
    <h2>Frontend (Vitest) $frontend_badge</h2>
    <div class="counts">$frontend_passed bestått / $frontend_failed feilet / $frontend_total totalt</div>
    <details><summary>Vis loggen</summary><pre>$(escape_html "$FRONTEND_LOG")</pre></details>
  </div>

  <div class="suite">
    <h2>Playwright E2E $playwright_badge</h2>
    $playwright_skip_block
    <div class="counts">$playwright_passed bestått / $playwright_failed feilet / $playwright_total totalt</div>
    $playwright_html_link
    <details><summary>Vis loggen</summary><pre>$(escape_html "$PLAYWRIGHT_LOG")</pre></details>
  </div>
</body>
</html>
HTML

  echo -e "\n${BLUE}=== Sammendrag ===${NC}"
  echo "  Backend:    $backend_passed/$backend_total ($backend_status)"
  echo "  Frontend:   $frontend_passed/$frontend_total ($frontend_status)"
  echo "  Playwright: $playwright_passed/$playwright_total ($playwright_status)"
  echo "  Rapport:    $SUMMARY_HTML"
}

badge() {
  local status="$1"
  case "$status" in
    passed) echo "<span class=\"badge passed\">PASSED</span>" ;;
    failed) echo "<span class=\"badge failed\">FAILED</span>" ;;
    skipped) echo "<span class=\"badge skipped\">SKIPPED</span>" ;;
  esac
}

escape_html() {
  local file="$1"
  if [[ -f "$file" ]]; then
    sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g' "$file"
  else
    echo "(ingen logg)"
  fi
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
