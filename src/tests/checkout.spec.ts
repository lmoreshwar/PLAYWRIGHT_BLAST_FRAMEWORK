import { test, expect } from '../fixtures/checkoutFixtures';
import { credentials } from '../config';
import testData from '../testdata/testData.json';

test.describe('Checkout — Product Purchase', () => {
    const valid = credentials('app');
    const checkoutInfo = testData.checkoutInfoTc023;
    const backpack = testData.products.backpack;

    test.beforeEach(async ({ loginModule, loginPage, page }) => {
        await loginModule.goto();
        await loginModule.login(valid.username, valid.password);

        await expect(page).toHaveURL(/inventory\.html/);
        await expect(loginPage.menuButton()).toBeVisible();
    });

    test('TC_023 Add Sauce Labs Backpack and complete checkout successfully @AddProductToCart @Positive @Regression @Automation', async ({
        checkoutModule,
        checkoutPage,
        inventoryPage,
    }) => {
        await checkoutModule.addProductFromInventory(backpack);

        await expect(inventoryPage.removeFromCartButton()).toBeVisible();

        await checkoutModule.openCart();

        await expect(checkoutPage.cartProductLink(backpack)).toBeVisible();

        await checkoutModule.selectCheckout();

        await checkoutModule.enterCustomerInformation(
            checkoutInfo.firstName,
            checkoutInfo.lastName,
            checkoutInfo.postalCode,
        );
        await checkoutModule.continueToOverview();

        await expect(checkoutPage.checkoutOverviewProductLink(backpack)).toBeVisible();

        await checkoutModule.finishCheckout();

        await expect(checkoutPage.orderConfirmation()).toHaveText(testData.messages.orderComplete);

        await checkoutModule.returnHome();

        await expect(inventoryPage.productsTitle()).toBeVisible();
    });

    
});
