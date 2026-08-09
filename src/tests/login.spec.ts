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

    test('TC_007 Session Expiration After Logout @Regression @Automation @High', async ({ loginModule, loginPage, page }) => {
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

    // New test cases

    test('TC_012 Password field masks input @Regression @Automation @Critical', async ({ loginPage }) => {
        // Verify that the password input uses the password type, which masks entered characters.
        await expect(loginPage.passwordInput()).toHaveAttribute('type', 'password');
    });

    test('TC_013 Error message clears after correcting credentials @Regression @Automation @High', async ({ loginModule, loginPage }) => {
        // Trigger an error with invalid credentials.
        await loginModule.login('invalid_user', 'wrong_password');
        await expect(loginPage.errorMessage()).toBeVisible();

        // Correct the credentials and ensure the error message disappears.
        await loginModule.login(valid.username, valid.password);
        await expect(loginPage.errorMessage()).not.toBeVisible();
    });

    test('TC_015 Security: XSS attempt on username field @Login @Authentication @Security', async ({ loginModule, loginPage, page }) => {
        await loginModule.login(testData.xssPayload, valid.password);

        await expect(loginPage.errorMessage()).toBeVisible();
        await expect(page).not.toHaveURL(/inventory\.html/);
        // Optionally, verify the error message content if it's specific to XSS or invalid characters.
        // For SauceDemo, it's likely the generic "Username and password do not match" or "Username is required"
        // if the payload is treated as an empty/invalid username.
        await expect(loginPage.errorMessage()).toContainText('do not match any user');
    });
});
