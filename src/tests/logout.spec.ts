import { test, expect } from '../fixtures';
import { credentials } from '../config';

/**
 * TC_017 – Access inventory after logout (session termination)
 *
 * Verify that after a successful logout, attempting to navigate directly to the
 * inventory page redirects the user back to the login screen, confirming that
 * the session has been terminated.
 */
test('TC_017 Access inventory after logout (session termination)', async ({
    page,
    loginPage,
    loginModule,
    logoutModule,
}) => {
    // Perform login with valid credentials
    const { username, password } = credentials('app');
    await loginModule.login(username, password);

    // Ensure we are on the inventory page (optional sanity check)
    await expect(page).toHaveURL(/.*\/inventory\.html$/);

    // Logout using the workflow
    await logoutModule.logout();

    // Attempt to navigate directly to the inventory page after logout
    await page.goto(`${process.env.BASE_URL || ''}/inventory.html`);

    // Verify that the login page is displayed again
    await expect(loginPage.usernameInput()).toBeVisible();
    await expect(loginPage.passwordInput()).toBeVisible();
    await expect(loginPage.loginButton()).toBeVisible();
});
