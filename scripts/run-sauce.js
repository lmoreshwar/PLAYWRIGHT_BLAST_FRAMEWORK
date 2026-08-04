const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const testEnv = process.env.TEST_ENV || 'qa';
const envFile = testEnv === 'production' ? '.env' : `.env.${testEnv}`;
const envPath = path.resolve(process.cwd(), envFile);
const rootEnvPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, quiet: true });
}

if (fs.existsSync(rootEnvPath)) {
    dotenv.config({ path: rootEnvPath, override: false, quiet: true });
}

const requiredSauceKeys = ['SAUCE_USERNAME', 'SAUCE_ACCESS_KEY'];
const missingSauceKeys = requiredSauceKeys.filter((key) => !process.env[key]);

if (missingSauceKeys.length > 0) {
    console.error(`Missing Sauce Labs credentials: ${missingSauceKeys.join(', ')}`);
    console.error(`Expected them in ${envFile}, .env, or the current shell environment.`);
    process.exit(1);
}

// Provide a build tag for grouping all parallel jobs under one Sauce build.
// Used by saucectl.yml -> sauce.metadata.build ($BUILD_TAG).
if (!process.env.BUILD_TAG) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    process.env.BUILD_TAG = `local-${stamp}`;
}

// ===================================================================
// Auto-sync Sauce suites with the spec files in src/tests.
// Every *.spec.ts becomes its own suite (run one-by-one), so newly
// created tests run on Sauce automatically without editing saucectl.yml.
// ===================================================================
syncSauceSuites();

function syncSauceSuites() {
    const testsDir = path.resolve(process.cwd(), 'src', 'tests');
    const saucePath = path.resolve(process.cwd(), 'saucectl.yml');

    if (!fs.existsSync(testsDir) || !fs.existsSync(saucePath)) {
        return;
    }

    const specFiles = fs
        .readdirSync(testsDir)
        .filter((file) => file.endsWith('.spec.ts'))
        .sort();

    if (specFiles.length === 0) {
        return;
    }

    const suitesBlock = buildSuitesBlock(specFiles);
    const original = fs.readFileSync(saucePath, 'utf-8');
    const updated = replaceSuitesBlock(original, suitesBlock);

    if (updated !== null && updated !== original) {
        fs.writeFileSync(saucePath, updated, 'utf-8');
        console.log(`Synced saucectl.yml suites with ${specFiles.length} spec file(s).`);
    }
}

function buildSuitesBlock(specFiles) {
    const blocks = specFiles.map((file) => {
        const base = file.replace(/\.spec\.ts$/, '');
        const testMatch = `${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.spec\\.ts$`;
        return [
            `  - name: ${base}-$TEST_ENV`,
            '    platformName: Windows 11',
            '    screenResolution: 1440x900',
            '    testMatch:',
            `      - ${testMatch}`,
            '    params:',
            '      browserName: chrome',
            '      project: desktop-chrome',
            '      headless: false',
        ].join('\n');
    });

    return `suites:\n${blocks.join('\n\n')}\n`;
}

function replaceSuitesBlock(content, suitesBlock) {
    const lines = content.split('\n');
    const startIndex = lines.findIndex((line) => line.trimEnd() === 'suites:');
    if (startIndex === -1) {
        return null;
    }

    // The suites block ends at the next top-level key (a non-indented, non-empty
    // line that is not part of the suites list).
    let endIndex = lines.length;
    for (let i = startIndex + 1; i < lines.length; i += 1) {
        const line = lines[i];
        if (line.length > 0 && !/^\s/.test(line)) {
            endIndex = i;
            break;
        }
    }

    const before = lines.slice(0, startIndex).join('\n');
    const after = lines.slice(endIndex).join('\n');

    return `${before}\n${suitesBlock}\n${after}`;
}

const extraArgs = process.argv.slice(2);


const result = process.platform === 'win32'
    ? spawnSync(
          'cmd.exe',
          [
              '/d',
              '/s',
              '/c',
              ['npx', '--yes', 'saucectl@latest', 'run', '-c', 'saucectl.yml', ...extraArgs]
                  .map((arg) => (arg.includes(' ') ? `"${arg}"` : arg))
                  .join(' '),
          ],
          {
              encoding: 'utf-8',
              env: process.env,
              shell: false,
          },
      )
    : spawnSync('npx', ['--yes', 'saucectl@latest', 'run', '-c', 'saucectl.yml', ...extraArgs], {
          encoding: 'utf-8',
          env: process.env,
          shell: false,
      });

if (result.stdout) {
    process.stdout.write(result.stdout);
}

if (result.stderr) {
    process.stderr.write(result.stderr);
}

if (result.error) {
    console.error(result.error.message);
}

if (typeof result.status === 'number') {
    process.exit(result.status);
}

process.exit(1);
