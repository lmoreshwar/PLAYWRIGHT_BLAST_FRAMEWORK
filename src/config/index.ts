import * as dotenv from 'dotenv';
import * as path from 'path';

// ─── Load environment files ───────────────────────────────────────────────────
const testEnv = process.env.TEST_ENV || 'qa';
const envFile = testEnv === 'production' ? '.env' : `.env.${testEnv}`;

dotenv.config({ path: path.resolve(process.cwd(), envFile) });
dotenv.config(); // fallback to root .env

// Normalise BASE_URL: strip trailing slash(es) so `${env('BASE_URL')}/path`
// never produces a double slash (`//`) regardless of how the value/secret is set.
if (process.env.BASE_URL) {
    process.env.BASE_URL = process.env.BASE_URL.replace(/\/+$/, '');
}

// ─── Framework Config (rarely changes) ───────────────────────────────────────
export interface AppConfig {
    baseUrl: string;
    defaultTimeout: number;
    navigationTimeout: number;
    logLevel: string;
    retryCount: number;
    testEnv: string;
}

export const config: AppConfig = {
    baseUrl: process.env.BASE_URL || '',
    defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT || '30000', 10),
    navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT || '90000', 10),
    logLevel: process.env.LOG_LEVEL || 'INFO',
    retryCount: parseInt(process.env.RETRY_COUNT || '2', 10),
    testEnv,
};

// ─── env() Helper — Read ANY key from .env (no index.ts changes needed) ──────
/**
 * Read any environment variable from your .env file.
 * Just add the key to .env and call env('KEY_NAME') anywhere in code.
 *
 * @example
 *   env('APP_USERNAME')       → your app's login user
 *   env('BASE_URL')           → your app's base URL
 *   env('SAUCE_USERNAME')     → your Sauce Labs user
 *   env('MY_NEW_API_TOKEN')   → reads from .env — no index.ts update needed!
 *
 * @param key - The environment variable name (exactly as in .env)
 * @param fallback - Optional default value if key is missing
 */
export function env(key: string, fallback: string = ''): string {
    return process.env[key] || fallback;
}

// ─── credentials() — Read login secrets from .env ONLY (never JSON/source) ────
export interface Credentials {
    username: string;
    password: string;
}

/**
 * Read login credentials from environment variables ONLY. Credentials must NEVER live in
 * JSON test data or source — they belong in the gitignored `.env.<env>` file and are read
 * from there at runtime.
 *
 * Profiles map to .env keys:
 *   'app' → APP_USERNAME / APP_PASSWORD
 *
 * Throws a clear setup error when a key is missing, instead of logging in with blanks.
 */
export function credentials(profile: 'app' = 'app'): Credentials {
    const username = env('APP_USERNAME');
    const password = env('APP_PASSWORD');
    if (!username || !password) {
        throw new Error(
            `Missing ${profile} credentials. Set APP_USERNAME and APP_PASSWORD in your .env.${testEnv} file.`,
        );
    }
    return { username, password };
}

export default config;
