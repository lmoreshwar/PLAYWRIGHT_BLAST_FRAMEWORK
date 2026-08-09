import { test, expect } from '../fixtures';
import { env } from '../config';

/**
 * TC_016 – Direct access to inventory page without authentication.
 * Verifies that unauthenticated users are redirected to the login page.
 */
test('TC_016 Direct access to inventory page without authentication', async ({
    page,
    loginPage,
}) => {
    // Navigate directly to the inventory page URL.
    await page.goto(`${env('BASE_URL')}/inventory.html`);

    // Expect the login page to be displayed.
    await expect(loginPage.usernameInput()).toBeVisible();
    await expect(loginPage.passwordInput()).toBeVisible();
    await expect(loginPage.loginButton()).toBeVisible();

    // Verify that the URL is the base login URL (no path after the domain).
    await expect(page).toHaveURL(`${env('BASE_URL')}/`);
});
