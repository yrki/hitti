#!/usr/bin/env python3
"""Genererer test-results/index.html for ./test.sh."""

from __future__ import annotations

import argparse
import html
import json
import os
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable

BANNER = r"""  _  _ _ _   _   _
 | || (_) |_| |_(_)
 | __ | |  _|  _| |
 |_||_|_|\__|\__|_|
"""


@dataclass
class TestCase:
    name: str
    outcome: str  # "passed" | "failed" | "skipped"
    duration_ms: float | None = None
    error: str | None = None


@dataclass
class CoverageFile:
    path: str
    line_rate: float  # 0..1
    covered: int = 0
    total: int = 0


@dataclass
class SuiteSummary:
    status: str = "skipped"
    passed: int = 0
    failed: int = 0
    total: int = 0
    skip_reason: str = ""
    tests: list[TestCase] = field(default_factory=list)
    coverage: list[CoverageFile] = field(default_factory=list)
    overall_line_rate: float | None = None


# ---------- Parsers ----------

def parse_trx(report_dir: Path) -> list[TestCase]:
    trx_files = list(report_dir.glob("backend/**/*.trx"))
    trx = trx_files[0] if trx_files else report_dir / "backend" / "backend.trx"
    if not trx.exists():
        return []

    ns = {"t": "http://microsoft.com/schemas/VisualStudio/TeamTest/2010"}
    tree = ET.parse(trx)
    root = tree.getroot()

    cases: dict[str, TestCase] = {}
    for definition in root.iter("{http://microsoft.com/schemas/VisualStudio/TeamTest/2010}UnitTest"):
        test_id = definition.attrib.get("id", "")
        method = definition.find("t:TestMethod", ns)
        if method is None:
            continue
        class_name = method.attrib.get("className", "").split(".")[-1]
        method_name = method.attrib.get("name", definition.attrib.get("name", "?"))
        cases[test_id] = TestCase(name=f"{class_name}.{method_name}", outcome="skipped")

    for result in root.iter("{http://microsoft.com/schemas/VisualStudio/TeamTest/2010}UnitTestResult"):
        test_id = result.attrib.get("testId", "")
        case = cases.get(test_id)
        if case is None:
            case = TestCase(name=result.attrib.get("testName", "?"), outcome="skipped")
            cases[test_id] = case
        outcome = result.attrib.get("outcome", "").lower()
        case.outcome = {"passed": "passed", "failed": "failed"}.get(outcome, "skipped")
        duration = result.attrib.get("duration")
        if duration:
            # Format: HH:MM:SS.fffffff
            try:
                h, m, s = duration.split(":")
                case.duration_ms = (int(h) * 3600 + int(m) * 60 + float(s)) * 1000
            except ValueError:
                pass
        message_el = result.find(".//t:Message", ns)
        if message_el is not None and case.outcome == "failed":
            case.error = (message_el.text or "").strip()

    return sorted(cases.values(), key=lambda c: c.name)


def parse_cobertura(report_dir: Path) -> tuple[list[CoverageFile], float | None]:
    cov_files = list(report_dir.glob("backend/**/coverage.cobertura.xml"))
    if not cov_files:
        return [], None
    tree = ET.parse(cov_files[0])
    root = tree.getroot()

    overall_rate = None
    line_rate_attr = root.attrib.get("line-rate")
    if line_rate_attr:
        try:
            overall_rate = float(line_rate_attr)
        except ValueError:
            pass

    files: list[CoverageFile] = []
    for cls in root.iter("class"):
        filename = cls.attrib.get("filename", "?")
        # Hopp over auto-genererte filer (migrasjoner, source generators, model snapshot)
        norm = filename.replace("\\", "/")
        if (
            "/Migrations/" in norm
            or "/obj/" in norm
            or norm.startswith("obj/")
            or norm.endswith("Designer.cs")
            or norm.endswith("ModelSnapshot.cs")
            or ".generated.cs" in norm
        ):
            continue
        try:
            line_rate = float(cls.attrib.get("line-rate", "0"))
        except ValueError:
            line_rate = 0.0
        lines = cls.find("lines")
        covered = total = 0
        if lines is not None:
            for ln in lines.findall("line"):
                total += 1
                try:
                    hits = int(ln.attrib.get("hits", "0"))
                except ValueError:
                    hits = 0
                if hits > 0:
                    covered += 1
        files.append(CoverageFile(path=filename, line_rate=line_rate, covered=covered, total=total))

    # Aggreger duplikater (samme filename kan dukke opp i flere class-noder)
    aggregated: dict[str, CoverageFile] = {}
    for f in files:
        existing = aggregated.get(f.path)
        if existing is None:
            aggregated[f.path] = f
        else:
            existing.covered += f.covered
            existing.total += f.total
            if existing.total:
                existing.line_rate = existing.covered / existing.total

    sorted_files = sorted(aggregated.values(), key=lambda f: (f.line_rate, f.path))

    # Beregn overall rate fra filtrerte filer (ekskluderer generert kode)
    total_covered = sum(f.covered for f in sorted_files)
    total_lines = sum(f.total for f in sorted_files)
    if total_lines > 0:
        overall_rate = total_covered / total_lines

    return sorted_files, overall_rate


def parse_vitest_json(json_path: Path) -> list[TestCase]:
    if not json_path.exists():
        return []
    try:
        data = json.loads(json_path.read_text())
    except json.JSONDecodeError:
        return []

    cases: list[TestCase] = []
    for tr in data.get("testResults", []):
        suite = Path(tr.get("name", "")).name
        for assertion in tr.get("assertionResults", []):
            outcome = assertion.get("status", "skipped")
            mapped = {"passed": "passed", "failed": "failed"}.get(outcome, "skipped")
            full = " > ".join(assertion.get("ancestorTitles", []) + [assertion.get("title", "?")])
            cases.append(
                TestCase(
                    name=f"{suite} :: {full}",
                    outcome=mapped,
                    duration_ms=assertion.get("duration"),
                )
            )
    return cases


# ---------- Rendering ----------

OUTCOME_ICON = {"passed": "✓", "failed": "✗", "skipped": "—"}
OUTCOME_CLASS = {"passed": "ok", "failed": "fail", "skipped": "skip"}


def badge(status: str) -> str:
    label = status.upper()
    cls = {"passed": "passed", "failed": "failed", "skipped": "skipped"}.get(status, "skipped")
    return f'<span class="badge {cls}">{label}</span>'


def render_tests(tests: Iterable[TestCase], empty_message: str) -> str:
    rows = []
    for t in tests:
        dur = f"{t.duration_ms:.0f} ms" if t.duration_ms is not None else "—"
        err = ""
        if t.error:
            err = f'<details><summary>Feilmelding</summary><pre>{html.escape(t.error)}</pre></details>'
        rows.append(
            f'<tr class="row-{OUTCOME_CLASS[t.outcome]}">'
            f'<td class="icon">{OUTCOME_ICON[t.outcome]}</td>'
            f'<td>{html.escape(t.name)}{err}</td>'
            f'<td class="dur">{dur}</td>'
            f"</tr>"
        )
    if not rows:
        return f'<p class="muted">{empty_message}</p>'
    return (
        '<table class="testlist"><thead><tr><th></th><th>Test</th><th>Tid</th></tr></thead>'
        f'<tbody>{"".join(rows)}</tbody></table>'
    )


def render_coverage(files: list[CoverageFile], overall: float | None) -> str:
    if not files:
        return '<p class="muted">Ingen dekningsdata.</p>'

    head_pct = f"{overall * 100:.1f} %" if overall is not None else "n/a"
    rows = []
    for f in files:
        pct = f.line_rate * 100
        bar_class = "lo" if pct < 50 else ("mid" if pct < 80 else "hi")
        short = f.path.replace(str(Path(f.path).anchor), "")
        # Vis bare prosjekt-relativ del om mulig
        idx = short.find("hitti/backend/")
        if idx != -1:
            short = short[idx + len("hitti/backend/"):]
        rows.append(
            f"<tr>"
            f"<td><code>{html.escape(short)}</code></td>"
            f'<td class="dur">{f.covered}/{f.total}</td>'
            f'<td class="cov"><div class="bar bar-{bar_class}" style="width:{pct:.0f}%"></div>'
            f'<span class="pct">{pct:.0f}%</span></td>'
            "</tr>"
        )
    return (
        f'<p>Total linje-dekning: <strong>{head_pct}</strong></p>'
        '<table class="coverage"><thead><tr><th>Fil</th><th>Linjer</th><th>Dekning</th></tr></thead>'
        f'<tbody>{"".join(rows)}</tbody></table>'
    )


CSS = """
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 1080px; margin: 32px auto; padding: 0 24px; color: #1f2937; }
.banner { font-family: ui-monospace, "SF Mono", Menlo, monospace; white-space: pre; color: #2563eb; font-size: 14px; line-height: 1.2; margin: 0 0 8px; }
h1 { margin: 4px 0; }
.timestamp { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
.totals { display: flex; gap: 12px; margin-bottom: 24px; }
.totals .card { flex: 1; background: #f3f4f6; padding: 14px 18px; border-radius: 10px; }
.totals .card .num { font-size: 24px; font-weight: 700; }
.totals .card .lbl { color: #6b7280; font-size: 12px; }
.suite { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px 22px; margin-bottom: 18px; }
.suite h2 { margin: 0 0 6px; font-size: 18px; }
.badge { display: inline-block; padding: 2px 9px; border-radius: 999px; font-size: 11px; font-weight: 600; margin-left: 6px; vertical-align: middle; }
.badge.passed { background: #d1fae5; color: #047857; }
.badge.failed { background: #fee2e2; color: #b91c1c; }
.badge.skipped { background: #fef3c7; color: #92400e; }
.counts { color: #4b5563; font-size: 14px; margin: 6px 0 10px; }
.skip { color: #92400e; font-style: italic; margin: 6px 0; }
.muted { color: #6b7280; font-style: italic; margin: 8px 0; }
details { margin-top: 8px; }
summary { cursor: pointer; color: #2563eb; font-size: 13px; }
table { border-collapse: collapse; width: 100%; font-size: 13px; margin-top: 8px; }
table th, table td { padding: 6px 8px; border-bottom: 1px solid #f3f4f6; text-align: left; }
table th { color: #6b7280; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
.testlist td.icon { width: 24px; font-weight: 700; }
.testlist td.dur { color: #6b7280; white-space: nowrap; }
.row-ok td.icon { color: #047857; }
.row-fail td.icon { color: #b91c1c; }
.row-skip td.icon { color: #92400e; }
.coverage td.cov { width: 35%; position: relative; }
.coverage .bar { display: inline-block; height: 10px; border-radius: 999px; vertical-align: middle; }
.coverage .bar-lo { background: #fca5a5; }
.coverage .bar-mid { background: #fcd34d; }
.coverage .bar-hi { background: #6ee7b7; }
.coverage .pct { margin-left: 8px; font-size: 12px; color: #4b5563; }
pre { background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 8px; overflow-x: auto; font-size: 12px; line-height: 1.5; max-height: 360px; }
a { color: #2563eb; }
"""


def render_log_block(label: str, log_path: Path) -> str:
    if not log_path.exists():
        return ""
    content = log_path.read_text(errors="replace")
    return f'<details><summary>{label}</summary><pre>{html.escape(content)}</pre></details>'


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--report-dir", required=True)
    p.add_argument("--output", required=True)
    p.add_argument("--timestamp", required=True)
    p.add_argument("--backend-status", default="skipped")
    p.add_argument("--backend-passed", type=int, default=0)
    p.add_argument("--backend-failed", type=int, default=0)
    p.add_argument("--backend-total", type=int, default=0)
    p.add_argument("--frontend-status", default="skipped")
    p.add_argument("--frontend-passed", type=int, default=0)
    p.add_argument("--frontend-failed", type=int, default=0)
    p.add_argument("--frontend-total", type=int, default=0)
    p.add_argument("--playwright-status", default="skipped")
    p.add_argument("--playwright-passed", type=int, default=0)
    p.add_argument("--playwright-failed", type=int, default=0)
    p.add_argument("--playwright-total", type=int, default=0)
    p.add_argument("--playwright-skip-reason", default="")
    args = p.parse_args()

    report_dir = Path(args.report_dir)
    output = Path(args.output)

    backend_tests = parse_trx(report_dir)
    coverage_files, overall_cov = parse_cobertura(report_dir)
    frontend_tests = parse_vitest_json(report_dir / "frontend.json")

    coverage_html_link = ""
    coverage_index = report_dir / "coverage" / "index.html"
    if coverage_index.exists():
        coverage_html_link = (
            '<p><a href="coverage/index.html">Åpne full HTML-dekningsrapport →</a></p>'
        )

    playwright_html_link = ""
    e2e_report = Path(report_dir).parent / "e2e" / "playwright-report" / "index.html"
    if e2e_report.exists():
        playwright_html_link = (
            f'<p><a href="../e2e/playwright-report/index.html">Åpne Playwright HTML-rapport →</a></p>'
        )

    skip_block = (
        f'<p class="skip">{html.escape(args.playwright_skip_reason)}</p>'
        if args.playwright_skip_reason
        else ""
    )

    total_passed = args.backend_passed + args.frontend_passed + args.playwright_passed
    total_failed = args.backend_failed + args.frontend_failed + args.playwright_failed
    total_total = args.backend_total + args.frontend_total + args.playwright_total

    html_out = f"""<!DOCTYPE html>
<html lang="no">
<head>
<meta charset="utf-8">
<title>Hitti — Testrapport</title>
<style>{CSS}</style>
</head>
<body>
  <pre class="banner">{html.escape(BANNER)}</pre>
  <h1>Testrapport</h1>
  <p class="timestamp">Generert {html.escape(args.timestamp)}</p>

  <div class="totals">
    <div class="card"><div class="num">{total_total}</div><div class="lbl">Tester totalt</div></div>
    <div class="card"><div class="num" style="color:#047857;">{total_passed}</div><div class="lbl">Bestått</div></div>
    <div class="card"><div class="num" style="color:#b91c1c;">{total_failed}</div><div class="lbl">Feilet</div></div>
  </div>

  <div class="suite">
    <h2>Backend (.NET xUnit) {badge(args.backend_status)}</h2>
    <div class="counts">{args.backend_passed} bestått / {args.backend_failed} feilet / {args.backend_total} totalt</div>
    <h3>Tester</h3>
    {render_tests(backend_tests, "Ingen TRX-resultater funnet.")}
    <h3 style="margin-top:18px;">Kode­dekning (linjer)</h3>
    {coverage_html_link}
    {render_coverage(coverage_files, overall_cov)}
    {render_log_block("Vis raw-loggen", report_dir / "backend.log")}
  </div>

  <div class="suite">
    <h2>Frontend (Vitest) {badge(args.frontend_status)}</h2>
    <div class="counts">{args.frontend_passed} bestått / {args.frontend_failed} feilet / {args.frontend_total} totalt</div>
    {render_tests(frontend_tests, "Ingen Vitest-resultater funnet.")}
    {render_log_block("Vis raw-loggen", report_dir / "frontend.log")}
  </div>

  <div class="suite">
    <h2>Playwright E2E {badge(args.playwright_status)}</h2>
    {skip_block}
    <div class="counts">{args.playwright_passed} bestått / {args.playwright_failed} feilet / {args.playwright_total} totalt</div>
    {playwright_html_link}
    {render_log_block("Vis raw-loggen", report_dir / "playwright.log")}
  </div>
</body>
</html>
"""

    output.write_text(html_out)


if __name__ == "__main__":
    main()
