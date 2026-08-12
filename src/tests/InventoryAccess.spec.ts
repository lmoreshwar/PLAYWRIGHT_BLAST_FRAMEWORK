import { test, expect } from '../fixtures';
import { credentials } from '../config';
import testData from '../testdata/testData.json';

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

test('TC_026 Reject unauthenticated direct access to the inventory sorting screen @ProductSortingOnTheInventoryPage @Negative', async ({
    loginModule,
    loginPage,
    page,
}) => {
    await loginModule.goto();
    await loginModule.openProtectedPage(
        `${testData.urls.baseUrl}${testData.urls.inventoryUrl}`,
    );

    await expect(page).not.toHaveURL(/inventory\.html/);
    await expect(loginPage.errorMessage()).toHaveText(
        testData.messages.sessionRequired,
    );
});

test.describe('Inventory product sorting', () => {
    test.beforeEach(async ({ loginModule, inventoryPage }) => {
        const appCredentials = credentials('app');

        await loginModule.goto();
        await loginModule.login(
            appCredentials.username,
            appCredentials.password,
        );

        await expect(inventoryPage.productsTitle()).toBeVisible();
    });

    
});
