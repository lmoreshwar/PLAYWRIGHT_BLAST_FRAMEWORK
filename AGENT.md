# 🤖 AGENT.md — GitHub Copilot Rulebook for AI Native Playwright Framework

> **Framework**: AI Native Playwright Framework · **AI Runtime**: GitHub Copilot + playwright-cli · **Cloud**: Sauce Labs · **Target App**: loaded from `.env` (qa/uat/dev)

This is the always-on rulebook. It states the binding rules and links to on-demand guides for
reference material, tutorials, and command sets. Read a linked guide only when a task needs it.

## 📚 Reference material (all consolidated in README.md)

All human-facing reference material lives in one place: [`README.md`](./README.md). Read the relevant section when a task needs it.

| Need | Section |
|---|---|
| Full `playwright-cli` command set | [README → @playwright/cli Locator Workflow](./README.md#-playwrightcli-locator-workflow) |
| Wrapper API (Actions / WaitHelper / WorkflowActions) | [README → Wrapper APIs](./README.md#-wrapper-apis) |
| Locator strategy detail | [README → Locator Standard](./README.md#-locator-standard) |
| AI memory + reuse index detail | [README → AI Memory & Reuse Index](./README.md#-ai-memory--reuse-index) |
| Test execution commands & tags | [README → Command Cheat Sheet](./README.md#-command-cheat-sheet) |
| Debug & UI mode explained | [README → Debug & UI Mode Explained](./README.md#-debug--ui-mode-explained) |
| Sauce Labs execution | [README → Sauce Labs Execution](./README.md#-sauce-labs-execution) |
| Anti-hallucination + CLI enforcement | [README → Anti-Hallucination Rules](./README.md#-anti-hallucination-rules) |
| Workflow commands (new / modify / debug / self-healing) | Auto-loading skills in [`.github/skills/`](./.github/skills/) |

---

## 🔐 Environment & Secrets

```bash
npm install
npx playwright install
TEST_ENV=qa npm test     # uses .env.qa   (also uat / dev)
```

Read values in code:
```typescript
import { env, credentials } from '../config';
credentials('app')   // { username, password } from APP_USERNAME / APP_PASSWORD
credentials('app')   // FTR_APP_USERNAME / FTR_APP_PASSWORD
credentials('app')   // DPR_APP_USERNAME / DPR_APP_PASSWORD
env('ANY_KEY')       // any other .env value
```

> **SECURITY RULE — credentials live in `.env` ONLY.** Usernames/passwords must NEVER appear in
> `testData.json`, specs, pages, modules, or any committed source. They belong in the gitignored
> `.env.<env>` files, read at runtime via `credentials()` / `env()`. Only `.env.example`
> (placeholders) is committed. When the user gives a credential, put it in `.env.<env>` — never commit it.

---

## 🤖 Unattended / Command-Free Runs (B.L.A.S.T. → Copilot)

When a job is launched from the B.L.A.S.T. UI ("Run with GitHub Copilot"), NO human is at the
editor to click Allow/Skip. Follow these rules so the run completes end-to-end with zero manual
intervention, and only surfaces to the UI when it genuinely needs input.

- **Auto-approved command lane only.** `.vscode/settings.json` auto-approves the exact commands a
  job needs (`npx playwright test`, `npx tsc`, `npm run lint`, `npm run index`, `node`, log
  appends) and HARD-BLOCKS destructive ones (`rm -rf`, `Remove-Item -Recurse`, `git push`,
  `git reset --hard`, `shutdown`, …). Do NOT rely on a global auto-approve switch — the deny-list
  and the human gate for anything unexpected are intentional safety backstops. Stay inside the
  allow-listed commands; if a step needs something outside it, treat that as NEEDS-INPUT.
- **Never use the interactive shared browser in an unattended run.** `open_browser_page` / the
  shared-browser tools require a manual share click that CANNOT be auto-approved and will stall the
  job. Capture evidence headlessly instead: a terminal-run Playwright / `@playwright/cli` script
  (auto-approved lane), or reuse existing `.playwright-cli/*.yml` / trace / `error-context.md`
  snapshots. Evidence-first for locators still fully applies — only the capture mechanism changes.
- **Never fail on missing info — ask via the log, not a modal.** When blocked, APPEND
  `[copilot] NEEDS-INPUT <question>` to `.blast-runs/<jobId>.log`, then read `.blast-runs/<jobId>.inbox`
  for the user's `[user] ...` reply; resume and log `[copilot] RESUMED`. Questions must reach the
  UI, never a VS Code dialog.
- **Stream progress + status markers.** Heartbeat each milestone to `.blast-runs/<jobId>.log`; end
  with exactly one of `[copilot] DONE PASSED` / `[copilot] DONE FAILED <reason>` / `[copilot] ERROR
  <reason>`. Keep secrets out of the log.

---

## 🏗️ 3-Layer Architecture (STRICT)

```
TESTS (src/tests/*.spec.ts)      → intent + assertions + @Tags. Keep thin.
  ↓ calls
MODULES (src/modules/*Module.ts) → orchestrate page actions + Logger.step(). NO assertions.
  ↓ calls
PAGES (src/pages/*Page.ts)       → locators + locator helpers ONLY. NO business logic, NO assertions.
```

**Locator priority:** `getByRole()` > `getByLabel()` > `getByPlaceholder()` > `getByText()` > `getByTestId()` > CSS

**File naming:** `[Feature]Page.ts` · `[Feature]Module.ts` · `[feature].spec.ts`

**Spec organization (MANDATORY — group by page/module):** test cases for the SAME page/module + same
entry flow live in ONE spec file, each as its own `test()` in a shared `test.describe`. A new single case
that fits an existing page's spec is ADDED there — do not spawn a new file. KEEP SEPARATE only when: a
different module (never mix Checkout/Cart/Login in one spec), a long cross-screen end-to-end journey, or different
fixtures/roles/global-setup. Rule of thumb: "same page + same entry flow, differs only by a variation
(valid/invalid, primary/no-primary, save/submit)" → one spec, many tests; "different module or full journey"
→ own spec. If a spec grows to ~8–10 slow tests, split by sub-area.

---

## 🎯 Locator Standard (MANDATORY) — detail in [README → Locator Standard](./README.md#-locator-standard)

> Write ONE good locator. Add a fallback only when you can name a concrete reason it will break.
- **Tier 1 (DEFAULT, ~80%)**: a single strategy, no fallback. Use whenever a stable role+name, label, or testid exists.
- **Tier 2**: primary + at most ONE fallback, which MUST have a `// reason:` comment.
- **Tier 3 (EXCEPTION, ≤3 strategies)**: only for icon-only controls or the pre-approved known-flaky list; state why.
- **Hard limits**: max 3 strategies; no two fallbacks of the same handle type; no "just in case" fallbacks;
  collections (≥2 elements) use PLAIN Playwright locators (not `SmartLocator`); no format/regex assumptions on
  domain data (product codes, case IDs). A locator with 4–6 strategies is a code smell — refactor it down.

> **A single generated locator is CORRECT, not a bug.** Tier 1 (one strategy) is the default for ~80% of
> elements, so most Page locators will be a single line — do not "fix" that by adding fallbacks. `SmartLocator`
> fallback chains are the Tier-2/3 OPT-IN only, and runtime self-healing stays dormant until a Page actually
> feeds `SmartLocator.resolve()` a chain. To ACTIVATE it correctly (when + the 3-layer wiring pattern), use the
> [`pw-self-healing`](./.github/skills/pw-self-healing/SKILL.md) skill.

### 🛑 Evidence-First Locator Workflow (the standard for every requirement)
Never guess a locator from memory or "typical" behavior. For ANY new or changed locator:
1. Read the requirement and any provided snapshot(s)/screenshot(s).
2. Launch the screen with `@playwright/cli` (`playwright-cli open <url>` → navigate/authenticate).
3. Capture `playwright-cli snapshot`, read the real refs.
4. Save those refs as semantic locators in the Page Object — the single source of truth.
5. Use ONLY those saved Page Object locators in the Module and Spec.

If a locator is genuinely new and no evidence exists, capture it via `@playwright/cli` (if reachable)
or ask for a snapshot, then continue. Evidence priority: fresh CLI snapshot → existing
`.playwright-cli/*.yml` → `test-results/**/error-context.md` / trace ARIA → labeled user screenshot.
This gate applies to locators only — not to test data, assertions, renames, or timing logic.
Full command set: [README → @playwright/cli Locator Workflow](./README.md#-playwrightcli-locator-workflow).

### ⚡ Reuse-First Fast Path (do this before anything else)
- Open `.ai-memory/capabilities.json` FIRST — the **root manifest**: every domain, the global
  `testIndex` (each `TC id → an array of {domain, spec, title}` — arrays because TC ids are NOT
  globally unique, so match title-first — for duplicate detection across ALL domains),
  fixtures, and utils. If an asset/test is listed, it EXISTS → reuse it; do not re-scan the repo.
- Then open ONLY the relevant **domain shard** `.ai-memory/domains/<domain>.json` for that feature's
  locators, module methods, and tests. Load just the domain you are working on — never every shard
  (this is what keeps it fast and cheap at thousands of tests). Shards are **asset-anchored**: a spec
  joins the domain of the Page/Module it reuses, so open the shard that owns that Page/Module — never
  assume one shard per spec, and never hand-create per-scenario shards.
- Open a specific source file only to get an exact signature/return type — and only that file.
- Fall through to `.ai-memory/memory.json` and full-file reads only if the index lacks the capability.
- Full procedure + record schema: [README → AI Memory & Reuse Index](./README.md#-ai-memory--reuse-index).
  After creating/modifying any Page/Module/Spec, run `npm run index` to keep the manifest + shards authoritative.

### 🔁 Spec ↔ Sauce Registry Sync (MANDATORY on every spec add/rename/delete)
Any time you **create, rename, or delete** a `src/tests/*.spec.ts`, you MUST mirror it in the
Sauce registry in the SAME change — a spec with no `saucectl.yml` suite CANNOT run on Sauce:
1. **`saucectl.yml`** — add/rename/remove the matching `suites:` entry (`name: <spec-basename>-$TEST_ENV`
   and `testMatch: - <spec-basename>\.spec\.ts$`). Suite name = spec basename (drop `.spec.ts`) + `-$TEST_ENV`.
2. **`.ai-memory/capabilities.json`** — run `npm run index` so the spec map is authoritative.
3. **`README.md`** (project tree + suite examples) and **`docs/presentation.md`** if they reference the file.
Verify with `npm run test:sauce:uat -- --dry-run` (lists exact suite names). Run one suite with
`npm run test:sauce:uat -- --select-suite <spec-basename>-uat` — never `--select-suite <file>.spec.ts`.

---

## ✂️ Code Simplicity (MANDATORY — short, wrapper-driven, readable)

- **Use the wrappers, always.** Every click/fill/type/check/select/press → `Actions`. Every wait →
  `WaitHelper` / `WorkflowActions`. No raw `page.click()`, no inline `page.waitForTimeout()`, no
  hand-rolled retry loops in modules. (API: [README → Wrapper APIs](./README.md#-wrapper-apis).)
  Raw Playwright is allowed only for advanced cases (calendars, overlays, `evaluate()`, canvas) — kept
  at the lowest layer, never in specs, with a one-line reason comment.
- **One action = one line.** A module step should read like the manual steps the user gave you.
- **Keep methods short** (~5–15 lines, single responsibility). Split or simplify long, defensive methods.
- **One wait, then act.** A single wrapper wait for readiness (e.g. loader hidden) — no stacked speculative waits.
- **Never wait on network-idle in these apps.** The AI Native apps poll the backend continuously, so
  `networkidle` (`WaitHelper.waitForNetworkIdle` / `waitForLoadState('networkidle')`) never settles and
  silently burns its full timeout. Wait on the UI instead: loader hidden (`waitForActiveLoaderToClear`),
  target element visible, or URL match. `domcontentloaded` on `goto` is fine.
- **No speculative fallbacks.** No extra clicks, force-clicks, or "just in case" branches unless a captured run proves them needed.
- **Don't dismiss overlays that don't block.** Overlay-close calls (e.g. `closeAppGuideIfOpen`) belong ONLY
  where a captured run proves the overlay actually intercepts the next action. Do not scatter them before
  every step: when the target is already visible and clickable, the extra `waitForHidden` just makes the run
  sit idle (slow execution) for no benefit. Add such a guard at the single proven blocking point, or handle
  the overlay globally, and nowhere else.
- **Promote repeated/complex logic to a shared helper (MANDATORY).** Date pickers, loader waits,
  overlay dismissal, dropdown selection, login chains → extract into `Actions` / `WaitHelper` /
  `WorkflowActions` / a dedicated helper the first time. Never copy-paste a complex block into a second module.
- **Parameterize variants — never per-value twin methods.** A step that differs only by a choice
  (Yes/No, Save/Submit, tab name) takes a typed parameter with a default, and drives its locator from
  that parameter. One method covers every branch, e.g. `selectExistingTasCaseAndCreateDraft(choice: YesNo = 'No')`.

### 📎 File Uploads / Attachments (MANDATORY pattern)
When a test case says "upload an attachment / select a file / click Browse and choose a file":
- **Files live in ONE folder:** `src/testdata/attachments/`. The user drops the file there; reference it by
  name via `attachmentPath('<file-name>')` (from `../utils`) — never hardcode an absolute path.
- **Use the shared mechanic:** `Actions.uploadViaFileChooser(triggerLocator, attachmentPath(name))` clicks the
  visible "Browse"/upload control and handles the OS file chooser. Use this for hidden `<input type=file>`
  behind a button (a direct `setInputFiles` is silently ignored by these MFEs). `Actions.uploadFiles` (direct
  `setInputFiles`) is only for a directly-addressable input.
- **3-layer split:** the Browse-button + uploaded-file-row locators live in the Page (e.g. Cart:
  `getBrowseAttachmentButton()`, `getAttachmentByName()`); the upload+verify workflow lives in the Module
  (e.g. `CartModule.uploadAttachment(fileName)` returns `true` once the file is listed); the Spec asserts on it.
- **Verify by outcome:** confirm the uploaded file name appears in the attachment list — that render is the
  real upload-complete signal (not just that the input received a path).

---

## 🧹 Clean Code & Merge Gate (MANDATORY)

> **Definition of done:** `npm run lint` → 0 problems AND `npx tsc --noEmit` → 0 errors. No new SonarQube-class smells.

- **NEVER hardcode timeouts or magic numbers.** No raw ms literals (`30000`, `page.waitForTimeout(2000)`,
  `{ timeout: 15000 }`, `test.setTimeout(420000)`) anywhere. Use the single source of truth `TIMEOUTS` in
  `src/utils/constants.ts` (`SHORT`, `MEDIUM`, `LONG`, `EXPECT`, `ACTION`, `NAVIGATION`, `TEST`, `TEST_LONG`)
  via `import { TIMEOUTS } from '../utils';`. If no value fits, add a named constant — never inline a number.
  Applies to NEW, MODIFY, and DEBUG work (never "fix" a flake with a literal wait).
- **No hardcoded test data or credentials.** Data from `testData.json`; secrets from `.env` via
  `credentials()` / `env()`. Never inline usernames, passwords, VINs, URLs, or environment values.
- **Keep tests declarative** (intent + assertions); orchestration lives in modules; locators in pages.
- **Remove duplication** (same logic 2+ times) — extract to a shared helper / module method.
- **ESM imports only** — never `require()`. Import JSON via `import data from '...json'`.
- **No unused** vars/params/imports. Bindingless `} catch {` when the error is unused.
- **No `any`.** Type every param/return; use `Page` from `@playwright/test`.
- **Escape regex in template strings** (`\\s` inside `` `...` ``); prefer regex literals `/.../` for static patterns.
- **No dead code** — don't export from a barrel unless imported; delete zero-usage helpers.
- **`prefer-const`, `eqeqeq`, `no-var`, `no-duplicate-imports`** are hard errors. Keep cognitive complexity low.

---

## 🚫 Anti-Patterns (NEVER do)

❌ Business logic in Pages · ❌ Assertions in Modules · ❌ Duplicate locators across pages
❌ CSS when a semantic locator exists · ❌ Hardcoded credentials/data/timeouts
❌ Raw Playwright actions in specs · ❌ Writing code before discovering elements via `playwright-cli snapshot`

---

## 🔑 Key Utilities & Structure

| Utility | Usage |
|---|---|
| `credentials('app')` | Login secrets from `.env` |
| `env('KEY')` | Any `.env` value |
| `TIMEOUTS.*` | Centralized timeouts (`src/utils/constants.ts`) |
| `Logger.step(n, 'text')` | Step logging in modules |
| `SmartLocator.resolve()` | Fallback locator chains (single elements only) |
| `AiDebugReporter` | Auto-categorize failures |

```
src/
├── config/index.ts    ← config + env()/credentials() helpers
├── fixtures/index.ts  ← fixture DI + popup handlers
├── pages/             ← Layer 1: locators ONLY
├── modules/           ← Layer 2: workflows + logging
├── tests/             ← Layer 3: test cases + tags
├── testdata/          ← JSON data + types (no secrets)
└── utils/             ← Actions, WaitHelper, WorkflowActions, Logger, SmartLocator, constants
```

---

## 🚫 Anti-Hallucination & Plan Gate (MANDATORY)

Detail: [README → Anti-Hallucination Rules](./README.md#-anti-hallucination-rules)

1. Do not invent features, APIs, error codes, UI elements, or behavior; do not assume default behavior.
2. Mine existing repo knowledge (capabilities index → pages → modules → specs → memory → artifacts) before declaring anything missing.
3. If information is missing, say "Insufficient information to determine." Label any inference "Inference (low confidence)."
4. Every assertion must trace to provided input; output must be deterministic.
5. **Implementation Plan Gate:** provide an implementation plan and wait for explicit user approval before changing code.

**Workflow skills** (auto-load by intent; each enforces anti-hallucination + CLI evidence + plan approval):

| Workflow | Skill |
|---|---|
| New test automation | [`pw-new-automation`](./.github/skills/pw-new-automation/SKILL.md) |
| Modify existing test | [`pw-modify-test`](./.github/skills/pw-modify-test/SKILL.md) |
| Debug / fix failures | [`pw-debug-failure`](./.github/skills/pw-debug-failure/SKILL.md) |
| Self-healing (SmartLocator) | [`pw-self-healing`](./.github/skills/pw-self-healing/SKILL.md) |
| Visual testing (Sauce Visual, additive) | [`pw-visual-testing`](./.github/skills/pw-visual-testing/SKILL.md) |
