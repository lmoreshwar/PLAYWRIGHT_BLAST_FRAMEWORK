import { test, expect } from '../fixtures';
import { credentials } from '../config';
import testData from '../testdata/testData.json';

/**
 * Authentication — Login & Session (SauceDemo)
 * Covers TC_001–TC_010 from TestCases_SD-2. Valid credentials come from `.env.<env>`
 * via credentials('app'); negative data comes from testData.json / the source sheet.
 */
test.describe('Authentication — Login & Session', () => {
    const valid = credentials('app');
    const locked = testData.invalidLogins.find((l) => l.username === 'locked_out_user')!;

    test.beforeEach(async ({ loginModule }) => {
        await loginModule.goto();
    });

    test('TC_001 Valid Login @Sanity @Regression @Automation @Critical', async ({ loginModule, loginPage, page }) => {
        await loginModule.login(valid.username, valid.password);

        await expect(page).toHaveURL(/inventory\.html/);
        await expect(loginPage.menuButton()).toBeVisible();
    });

    test('TC_002 Invalid Login - Wrong Credentials @Regression @Automation @Critical', async ({ loginModule, loginPage }) => {
        await loginModule.login('invalid_user', 'wrong_password');

        await expect(loginPage.errorMessage()).toBeVisible();
        await expect(loginPage.errorMessage()).toContainText('do not match any user');
    });

    test('TC_003 Invalid Login - Empty Fields @Regression @Automation @Critical', async ({ loginModule, loginPage }) => {
        await loginModule.submitEmpty();

        await expect(loginPage.errorMessage()).toHaveText(testData.messages.usernameRequired);
    });

    test('TC_004 Logout Functionality @Sanity @Regression @Automation @Critical', async ({ loginModule, loginPage, page }) => {
        await loginModule.login(valid.username, valid.password);
        await expect(page).toHaveURL(/inventory\.html/);

        await loginModule.logout();

        await expect(page).toHaveURL(/saucedemo\.com\/?$/);
        await expect(loginPage.loginButton()).toBeVisible();
    });

    test('TC_005 Locked User Login Attempt @Regression @Automation @Critical', async ({ loginModule, loginPage }) => {
        await loginModule.login(locked.username, locked.password);

        await expect(loginPage.errorMessage()).toHaveText(locked.expectedError);
    });

    test('TC_006 Boundary Login - SQL Injection Attempt @Regression @Automation @Critical', async ({ loginModule, loginPage, page }) => {
        await loginModule.login(testData.sqlInjectionPayload, valid.password);

        await expect(loginPage.errorMessage()).toBeVisible();
        await expect(page).not.toHaveURL(/inventory\.html/);
    });

    test('TC_007 Session Expiration After Logout @Regression @Automation @High', async ({ loginModule, loginPage }) => {
        await loginModule.login(valid.username, valid.password);
        await loginModule.logout();

        await loginModule.openProtectedPage('/inventory.html');

        // Logged-out access to a protected page renders the login form with the guard error.
        await expect(loginPage.errorMessage()).toHaveText(testData.messages.sessionRequired);
        await expect(loginPage.loginButton()).toBeVisible();
    });

    test('TC_008 Multiple Login Attempts with Invalid Credentials @Regression @Automation @Critical', async ({ loginModule, loginPage }) => {
        await loginModule.attemptInvalidLogins('invalid_user', 'wrong_password', testData.loginAttemptCount);

        await expect(loginPage.errorMessage()).toBeVisible();
        await expect(loginPage.errorMessage()).toContainText('do not match any user');
        // Repeated bad logins must NOT lock the account (SauceDemo has no attempt-based lockout).
        await expect(loginPage.errorMessage()).not.toContainText('locked out');
    });

    test('TC_009 UI Validation - Login Page @Sanity @Regression @Automation @Critical', async ({ loginPage }) => {
        await expect(loginPage.usernameInput()).toBeVisible();
        await expect(loginPage.passwordInput()).toBeVisible();
        await expect(loginPage.loginButton()).toBeEnabled();
    });

    test('TC_010 Error Handling - Invalid Credentials @Regression @Automation @High', async ({ loginModule, loginPage }) => {
        await loginModule.login('invalid_user', 'wrong_password');

        await expect(loginPage.errorMessage()).toBeVisible();
        await expect(loginPage.errorMessage()).toContainText('do not match any user');
    });

    });
