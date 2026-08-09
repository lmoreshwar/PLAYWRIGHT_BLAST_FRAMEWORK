// @ts-check
/**
 * generate-capabilities.mjs — Sharded Reuse Index Generator
 *
 * Scans src/pages, src/modules, src/tests, and src/fixtures to produce a COMMITTED,
 * sharded reuse index:
 *   - `.ai-memory/capabilities.json` — the root manifest: counts, fixtures/utils, a list of
 *     domains (with where each domain's Pages/Modules/specs live), and a global `testIndex`
 *     (TC id → array of {domain, spec, title}) for cross-domain dedup. TC ids are NOT globally
 *     unique, so testIndex values are ARRAYS and consumers match title-first.
 *   - `.ai-memory/domains/<domain>.json` — one shard per domain holding that domain's exact
 *     locators, method signatures, and tests. Agents read the manifest first, then load ONLY
 *     the relevant shard — so the index scales to thousands of tests without huge reads.
 *
 * SHARDS ARE ASSET-ANCHORED (minimal, no junk files): a spec joins the domain of the Page/Module
 * it reuses (voted by imports + fixtures; name-prefix fallback). E.g. a product-detail spec folds
 * into the `Inventory` shard instead of spawning a phantom single-scenario domain. Never create
 * per-scenario shards by hand.
 *
 * WHY: The AI agent (and humans) read a small manifest + one domain shard to know exactly which
 * Page Objects, locator methods, Module workflows, fixtures, and spec coverage already exist —
 * instead of re-reading every source file (slow) or re-deriving locators that already exist
 * (wrong). This is the "reuse-first fast path" and the FIRST driver for every skill.
 *
 * This file is auto-maintained: run `npm run index` after adding/changing any Page, Module, or
 * Spec (also runs on `playwright test` via globalSetup and in CI). A `sourceHash` skip-guard
 * no-ops the rebuild when nothing changed. Output is deterministic (sorted) so diffs stay clean.
 *
 * Zero runtime dependencies — pure Node fs + regex (no parser, no install).
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');
const OUT_DIR = join(ROOT, '.ai-memory');
const OUT_FILE = join(OUT_DIR, 'capabilities.json');
const SHARD_DIR = join(OUT_DIR, 'domains');

/**
 * Recursively list *.ts files under a directory (skips .d.ts).
 * @param {string} dir
 * @returns {string[]}
 */
function listTsFiles(dir) {
    if (!existsSync(dir)) return [];
    /** @type {string[]} */
    const out = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            out.push(...listTsFiles(full));
        } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
            out.push(full);
        }
    }
    return out.sort();
}

/**
 * Workspace-relative POSIX path for stable, link-friendly output.
 * @param {string} p
 * @returns {string}
 */
function rel(p) {
    return relative(ROOT, p).split('\\').join('/');
}

/**
 * Extract the first exported/declared class name from a TS source string.
 * @param {string} src
 * @returns {string | null}
 */
function extractClassName(src) {
    const m = src.match(/export\s+class\s+([A-Za-z0-9_]+)/) || src.match(/\bclass\s+([A-Za-z0-9_]+)/);
    return m ? m[1] : null;
}

// Control-flow / keyword tokens that must never be captured as class members.
const RESERVED_MEMBERS = new Set([
    'if', 'for', 'while', 'switch', 'catch', 'return', 'constructor',
    'function', 'await', 'do', 'else', 'new', 'typeof', 'super',
]);

/**
 * Extract PUBLIC member names from a class source.
 * Captures three shapes so the reuse map is complete:
 *   1. Arrow-function properties  — `usernameInput = (): Locator => …` (Page locators).
 *   2. Async methods              — `async login(…) {` (Module workflows).
 *   3. Sync methods               — `getCount(…): number {`.
 * Skips `private`/`protected` members, the constructor, and control-flow keywords.
 * De-dupes and sorts for deterministic output.
 * @param {string} src
 * @returns {string[]}
 */
function extractPublicMembers(src) {
    /** @type {Set<string>} */
    const members = new Set();

    // 1) Arrow-function class properties (locators, handlers): name = (…) => / name = async (…) =>
    const arrowRe = /(^|\n)([ \t]*(?:public\s+|private\s+|protected\s+|readonly\s+|static\s+)*)([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*(?::[^=]+)?=>/g;
    let m;
    while ((m = arrowRe.exec(src)) !== null) {
        const modifiers = m[2] || '';
        if (/\b(private|protected)\b/.test(modifiers)) continue;
        members.add(m[3]);
    }

    // 2/3) Method declarations (async or sync): [vis] [static] [async] name(…)[: type] {
    const methodRe = /(^|\n)[ \t]*(public\s+|private\s+|protected\s+)?(?:static\s+)?(?:async\s+)?([A-Za-z_$][A-Za-z0-9_$]*)\s*\([^)]*\)\s*(?::[^{;]+)?\{/g;
    while ((m = methodRe.exec(src)) !== null) {
        const visibility = (m[2] || '').trim();
        const name = m[3];
        if (visibility === 'private' || visibility === 'protected') continue;
        if (RESERVED_MEMBERS.has(name)) continue;
        members.add(name);
    }

    return [...members].sort();
}

/**
 * Build a {file, class, methods} record for a Page/Module file.
 * @param {string} file
 * @returns {{ file: string, class: string | null, methods: string[] }}
 */
function describeClassFile(file) {
    const src = readFileSync(file, 'utf-8');
    return {
        file: rel(file),
        class: extractClassName(src),
        methods: extractPublicMembers(src),
    };
}

/**
 * Extract @Tags (e.g. @P0 @Smoke) found anywhere in a spec.
 * @param {string} src
 * @returns {string[]}
 */
function extractTags(src) {
    const tags = new Set();
    const re = /@([A-Za-z][A-Za-z0-9]*)/g;
    let m;
    while ((m = re.exec(src)) !== null) tags.add('@' + m[1]);
    return [...tags].sort();
}

/**
 * Extract test.describe(...) titles from a spec.
 * @param {string} src
 * @returns {string[]}
 */
function extractDescribes(src) {
    const titles = [];
    const re = /test\.describe\(\s*['"`]([^'"`]+)['"`]/g;
    let m;
    while ((m = re.exec(src)) !== null) titles.push(m[1]);
    return titles;
}

/**
 * Extract imported Module/Page class names a spec reuses.
 * @param {string} src
 * @returns {string[]}
 */
function extractReuses(src) {
    const reuses = new Set();
    const re = /import\s*\{([^}]+)\}\s*from\s*['"][^'"]*\/(modules|pages)\/[^'"]*['"]/g;
    let m;
    while ((m = re.exec(src)) !== null) {
        for (const name of m[1].split(',')) {
            const clean = name.trim();
            if (clean && /^[A-Za-z]/.test(clean)) reuses.add(clean);
        }
    }
    return [...reuses].sort();
}

/**
 * Normalize a raw test-case id (TC1, tc-12, TC_007) to canonical `TC_0NN`.
 * @param {string} raw
 * @returns {string}
 */
function normalizeTcId(raw) {
    const m = String(raw).match(/TC[_-]?0*(\d+)/i);
    return m ? 'TC_' + m[1].padStart(3, '0') : '';
}

/**
 * Extract each test's {id, title} from a spec (test / test.only / test.skip / test.fixme).
 * @param {string} src
 * @returns {{ id: string, title: string }[]}
 */
function extractTests(src) {
    /** @type {{ id: string, title: string }[]} */
    const out = [];
    const re = /\btest\s*(?:\.(?:only|skip|fixme))?\s*\(\s*['"`]([^'"`]+)['"`]/g;
    let m;
    while ((m = re.exec(src)) !== null) {
        const title = m[1].trim();
        out.push({ id: normalizeTcId(title), title });
    }
    return out;
}

/**
 * Canonical domain key for a source file (groups page/module/spec of one feature).
 * `LoginPage.ts`→Login, `InventoryModule.ts`→Inventory, `login.spec.ts`→Login,
 * `InventoryAccess.spec.ts`→InventoryAccess.
 * @param {string} file
 * @param {'page'|'module'|'spec'} kind
 * @returns {string}
 */
function domainKey(file, kind) {
    let base = basename(file).replace(/\.ts$/, '').replace(/\.spec$/, '');
    if (kind === 'page') base = base.replace(/Page$/, '');
    if (kind === 'module') base = base.replace(/Module$/, '');
    return base.charAt(0).toUpperCase() + base.slice(1);
}

/**
 * Deterministic content hash of every src *.ts file (path + content). Lets a run
 * skip a rewrite when nothing changed, and lets consumers detect a stale index.
 * @returns {string}
 */
function hashSources() {
    const h = createHash('sha1');
    for (const f of listTsFiles(SRC)) {
        h.update(rel(f));
        h.update('\0');
        h.update(readFileSync(f, 'utf-8'));
        h.update('\0');
    }
    return 'sha1:' + h.digest('hex');
}

/**
 * Build a {file, describe, tags, reuses, tests} record for a spec file.
 * @param {string} file
 * @returns {{ file: string, describes: string[], tags: string[], reuses: string[], tests: { id: string, title: string }[] }}
 */
function describeSpecFile(file) {
    const src = readFileSync(file, 'utf-8');
    return {
        file: rel(file),
        describes: extractDescribes(src),
        tags: extractTags(src),
        reuses: extractReuses(src),
        tests: extractTests(src),
    };
}

/** Extract fixture names declared in src/fixtures/index.ts (TestFixtures type). */
function extractFixtures() {
    const file = join(SRC, 'fixtures', 'index.ts');
    if (!existsSync(file)) return [];
    const src = readFileSync(file, 'utf-8');
    const typeBlock = src.match(/TestFixtures\s*=\s*\{([\s\S]*?)\};/);
    if (!typeBlock) return [];
    const fixtures = new Set();
    const re = /^\s*([A-Za-z0-9_]+)\s*:/gm;
    let m;
    while ((m = re.exec(typeBlock[1])) !== null) fixtures.add(m[1]);
    return [...fixtures].sort();
}

/** Extract available util class names from src/utils. */
function extractUtils() {
    return listTsFiles(join(SRC, 'utils'))
        .map((f) => basename(f, '.ts'))
        .filter((n) => n !== 'index')
        .sort();
}

function main() {
    const pages = listTsFiles(join(SRC, 'pages'))
        .filter((f) => !f.endsWith('index.ts'))
        .map((f) => ({ ...describeClassFile(f), _domain: domainKey(f, 'page') }));

    const modules = listTsFiles(join(SRC, 'modules'))
        .filter((f) => !f.endsWith('index.ts'))
        .map((f) => ({ ...describeClassFile(f), _domain: domainKey(f, 'module') }));

    // Map every Page/Module class → its domain so a spec JOINS the domain of the Page/Module
    // it reuses. Keeps shards minimal & asset-anchored: InventoryAccess/product-detail specs
    // fold into Inventory instead of spawning phantom single-scenario domains.
    /** @type {Record<string, string>} */
    const classToDomain = {};
    for (const p of pages) if (p.class) classToDomain[p.class] = p._domain;
    for (const mo of modules) if (mo.class) classToDomain[mo.class] = mo._domain;

    // Fixture name → domain (specs consume fixtures, not direct imports): inventoryPage→Inventory.
    /** @type {Record<string, string>} */
    const fixtureToDomain = {};
    for (const fx of extractFixtures()) {
        const m = fx.match(/^(.*?)(Page|Module)$/);
        if (m && m[1]) fixtureToDomain[fx] = m[1].charAt(0).toUpperCase() + m[1].slice(1);
    }
    // Domains anchored by a REAL page or module — the only valid fold targets.
    const anchorDomains = new Set([...pages, ...modules].map((x) => x._domain));

    const specDomain = (/** @type {{ reuses?: string[] }} */ spec, /** @type {string} */ file, /** @type {string} */ src) => {
        /** @type {Record<string, number>} */
        const votes = {};
        for (const cls of spec.reuses || []) {
            const d = classToDomain[cls];
            if (d) votes[d] = (votes[d] || 0) + 1;
        }
        for (const [fx, d] of Object.entries(fixtureToDomain)) {
            if (new RegExp(`\\b${fx}\\b`).test(src)) votes[d] = (votes[d] || 0) + 1;
        }
        const ranked = Object.keys(votes).sort((a, b) => votes[b] - votes[a]);
        if (ranked[0]) return ranked[0];
        // No import/fixture signal → fold into an anchor domain whose key prefixes this spec's
        // basename domain (InventoryAccess → Inventory), preferring the longest match.
        const base = domainKey(file, 'spec');
        const lower = base.toLowerCase();
        let fold = '';
        for (const a of anchorDomains) {
            const al = a.toLowerCase();
            if (lower.startsWith(al) && al.length > fold.length) fold = a;
        }
        return fold || base;
    };

    const specs = listTsFiles(join(SRC, 'tests')).map((f) => {
        const s = describeSpecFile(f);
        return { ...s, _domain: specDomain(s, f, readFileSync(f, 'utf-8')) };
    });

    // Group page/module/spec of one feature into a single domain shard (case-insensitive key).
    /** @type {Map<string, { domain: string, pages: any[], modules: any[], specs: any[] }>} */
    const domains = new Map();
    const bucket = (/** @type {string} */ name) => {
        const key = name.toLowerCase();
        let d = domains.get(key);
        if (!d) { d = { domain: name, pages: [], modules: [], specs: [] }; domains.set(key, d); }
        return d;
    };
    pages.forEach((p) => { const { _domain, ...rest } = p; bucket(_domain).pages.push(rest); });
    modules.forEach((mo) => { const { _domain, ...rest } = mo; bucket(_domain).modules.push(rest); });
    specs.forEach((s) => { const { _domain, ...rest } = s; bucket(_domain).specs.push(rest); });

    const sourceHash = hashSources();

    // Skip-guard: if nothing in src/ changed and the shards already exist, do not rewrite
    // (keeps diffs clean and makes `npm run index` a near no-op on unchanged trees).
    if (existsSync(OUT_FILE)) {
        try {
            const prev = JSON.parse(readFileSync(OUT_FILE, 'utf-8'));
            const shardsOk = [...domains.keys()].every((k) => existsSync(join(SHARD_DIR, `${k}.json`)));
            if (prev.sourceHash === sourceHash && shardsOk) {
                console.log(`= ${rel(OUT_FILE)} unchanged (sourceHash match) — skipped rebuild.`);
                return;
            }
        } catch { /* fall through to full rebuild */ }
    }

    // Build the global test index (TC id → [{domain,spec,title}]) for cross-domain dedup.
    // Value is an ARRAY because TC ids are NOT globally unique (login.spec TC_001 and
    // product-detail.spec TC_001 coexist) — an id-keyed scalar would silently drop entries
    // and cause false "new case" verdicts. Consumers match title-first, then id+overlap.
    /** @type {Record<string, Array<{ domain: string, spec: string, title: string }>>} */
    const testIndex = {};
    let totalTests = 0;
    const domainSummaries = [];
    const sortedKeys = [...domains.keys()].sort();

    for (const key of sortedKeys) {
        const d = domains.get(key);
        if (!d) continue;
        const shardRel = `.ai-memory/domains/${key}.json`;
        let locatorCount = 0;
        let methodCount = 0;
        let testCount = 0;
        d.pages.forEach((p) => { locatorCount += (p.methods || []).length; });
        d.modules.forEach((mo) => { methodCount += (mo.methods || []).length; });
        d.specs.forEach((s) => {
            testCount += (s.tests || []).length;
            (s.tests || []).forEach((/** @type {{ id: string, title: string }} */ t) => {
                if (!t.id) return;
                (testIndex[t.id] = testIndex[t.id] || []).push({ domain: d.domain, spec: s.file, title: t.title });
            });
        });
        totalTests += testCount;
        domainSummaries.push({
            domain: d.domain,
            shard: shardRel,
            pages: d.pages.map((p) => p.file),
            modules: d.modules.map((mo) => mo.file),
            specs: d.specs.map((s) => s.file),
            counts: { locators: locatorCount, methods: methodCount, tests: testCount },
        });

        const shard = {
            $schema: 'reuse-capability-shard/v1',
            domain: d.domain,
            generatedAt: new Date().toISOString(),
            sourceHash,
            pages: d.pages,
            modules: d.modules,
            specs: d.specs,
        };
        if (!existsSync(SHARD_DIR)) mkdirSync(SHARD_DIR, { recursive: true });
        writeFileSync(join(SHARD_DIR, `${key}.json`), JSON.stringify(shard, null, 2) + '\n', 'utf-8');
    }

    // Remove stale shards for domains that no longer exist.
    if (existsSync(SHARD_DIR)) {
        for (const f of readdirSync(SHARD_DIR)) {
            if (f.endsWith('.json') && !sortedKeys.includes(f.replace(/\.json$/, ''))) {
                rmSync(join(SHARD_DIR, f));
            }
        }
    }

    const manifest = {
        $schema: 'reuse-capability-index/v2-sharded',
        purpose:
            'Root manifest — READ THIS FIRST for EVERY skill (new, modify, debug, delete). ' +
            'It lists all domains and a global testIndex (TC id → domain/spec) so duplicates are ' +
            'caught across ALL domains without loading every shard. For a domain\u2019s locators/methods/tests, ' +
            'load its shard from `shardDir` (load ONLY the domain you are working on — keeps it fast at scale).',
        generatedAt: new Date().toISOString(),
        regenerateWith: 'npm run index',
        sourceHash,
        shardDir: '.ai-memory/domains',
        counts: {
            pages: pages.length,
            modules: modules.length,
            specs: specs.length,
            tests: totalTests,
            domains: sortedKeys.length,
        },
        fixtures: extractFixtures(),
        utils: extractUtils(),
        domains: domainSummaries,
        testIndex,
    };

    if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');

    console.log(`✅ Wrote ${rel(OUT_FILE)} + ${sortedKeys.length} domain shard(s)`);
    console.log(`   pages=${pages.length} modules=${modules.length} specs=${specs.length} tests=${totalTests} domains=${sortedKeys.length}`);
}

main();
