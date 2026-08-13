import { expect, test } from '../fixtures';
import { credentials } from '../config';

test.describe('Logout', () => {
    test.beforeEach(async ({ loginModule, inventoryPage, page }) => {
        await loginModule.goto();

        const appCredentials = credentials('app');
        await loginModule.login(appCredentials.username, appCredentials.password);

        await expect(page).toHaveURL(/\/inventory\.html$/);
        await expect(inventoryPage.productsTitle()).toBeVisible();
    });

    test('[TC_001] Logout through hamburger menu @Logout @Authentication @UI', async ({
        loginModule,
        loginPage,
        page,
    }) => {
        await loginModule.logout();

        await expect(page).toHaveURL(/\/$/);
        await expect(loginPage.usernameInput()).toBeVisible();
    });

    test('[TC_002] Verify hamburger menu provides logout option @Logout @Authentication @UI', async ({
        actions,
        loginPage,
    }) => {
        await actions.click(loginPage.menuButton());

        await expect(loginPage.logoutLink()).toBeVisible();
    });
});
