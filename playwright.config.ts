import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { TIMEOUTS } from './src/utils/constants';

const testEnv = process.env.TEST_ENV || 'qa';
const envFile = testEnv === 'production' ? '.env' : `.env.${testEnv}`;

dotenv.config({ path: path.resolve(process.cwd(), envFile) });
dotenv.config();

/**
 * AI Native Playwright Framework — Playwright Configuration
 *
 * This framework is template-first. Replace and extend projects as demo needs grow.
 */
export default defineConfig({
    testDir: './src/tests',
    globalSetup: './global-setup.ts',
    globalTeardown: './global-teardown.ts',
    timeout: TIMEOUTS.TEST,
    expect: { timeout: TIMEOUTS.EXPECT },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 2 : 3,

    reporter: [
        ['./src/utils/AiDebugReporter.ts'],
        ['html', { open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
        [
            'allure-playwright',
            {
                resultsDir: 'allure-results',
                detail: true,
                suiteTitle: true,
                environmentInfo: {
                    Environment: testEnv,
                    Base_URL: process.env.BASE_URL || 'https://www.saucedemo.com',
                    Node: process.version,
                    CI: process.env.CI ? 'true' : 'false',
                },
            },
        ],
        ['list'],
    ],

    use: {
        baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
        navigationTimeout: TIMEOUTS.NAVIGATION,
        actionTimeout: TIMEOUTS.ACTION,
    },

    projects: [
        {
            name: 'desktop-chrome',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1440, height: 900 },
            },
        },
        {
            name: 'desktop-firefox',
            use: {
                ...devices['Desktop Firefox'],
                viewport: { width: 1440, height: 900 },
            },
        },
        {
            name: 'desktop-safari',
            use: {
                ...devices['Desktop Safari'],
                viewport: { width: 1440, height: 900 },
            },
        },
        {
            name: 'desktop-edge',
            use: {
                ...devices['Desktop Edge'],
                viewport: { width: 1440, height: 900 },
            },
        },
        {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'mobile-safari',
            use: { ...devices['iPhone 13'] },
        },
        {
            name: 'tablet-chrome',
            use: { ...devices['Galaxy Tab S4'] },
        },
    ],
});
