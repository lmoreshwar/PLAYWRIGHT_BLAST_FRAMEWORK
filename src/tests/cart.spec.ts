import { test, expect } from '../fixtures';
import { credentials } from '../config';
import testData from '../testdata/testData.json';

test.describe('Cart — Checkout Recovery and Order Completion', () => {
    const valid = credentials('app');
    const checkoutInfo = testData.checkoutRecovery;

    test.beforeEach(async ({ loginModule, inventoryPage, page }) => {
        await loginModule.goto();
        await loginModule.login(valid.username, valid.password);

        await expect(page).toHaveURL(/inventory\.html/);
        await expect(inventoryPage.productsTitle()).toBeVisible();
    });

    

    test('TC_024 Cart: "Go back Continue Shopping" aborts without completing the action @Cart @Negative @Automation', async ({
        cartModule,
        inventoryPage,
        page,
    }) => {
        await cartModule.establishCartPrecondition(testData.products.backpack);

        await expect(page).toHaveURL(/cart\.html/);
        await cartModule.continueShopping();

        await expect(page).toHaveURL(/inventory\.html/);
        await expect(inventoryPage.productsTitle()).toBeVisible();
    });
});
