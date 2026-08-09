import { test, expect } from '../fixtures';
import { credentials } from '../config';

/**
 * TC_016 – Direct access to inventory page without authentication
 *
 * Verify that navigating directly to the inventory page redirects the user
 * to the login screen when not authenticated.
 */
test('TC_016 Direct access to inventory page without authentication', async ({
    page,
    loginPage,
}) => {
    // Navigate directly to the inventory page URL
    await page.goto(`${process.env.BASE_URL || ''}/inventory.html`);

    // Expect the login page to be displayed
    await expect(loginPage.usernameInput()).toBeVisible();
    await expect(loginPage.passwordInput()).toBeVisible();
    await expect(loginPage.loginButton()).toBeVisible();
});
