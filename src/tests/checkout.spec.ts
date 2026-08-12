import { test, expect } from '../fixtures';
import { credentials } from '../config';
import testData from '../testdata/testData.json';

test.describe('Checkout — Sauce Labs Backpack Order', () => {
    const validCredentials = credentials('app');
    const productName = testData.products.backpack;
    const checkoutInfo = testData.checkoutPositiveInfo;

    test.beforeEach(async ({ loginModule, page }) => {
        await loginModule.goto();
        await loginModule.login(validCredentials.username, validCredentials.password);
        await expect(page).toHaveURL(/inventory\.html/);
    });

    test('TC_023 Add Sauce Labs Backpack and complete checkout successfully @AddProductToCart @Positive', async ({
        inventoryPage,
        inventoryModule,
        checkoutPage,
        checkoutModule,
    }) => {
        await inventoryModule.navigateToProductDetailPage(productName);
        await inventoryModule.addProductToCartFromDetail();
        await inventoryModule.goBackToProducts();

        await expect(inventoryPage.removeFromCartButton()).toBeVisible();

        await checkoutModule.openCart();
        await expect(checkoutPage.cartItemByName(productName)).toBeVisible();

        await checkoutModule.startCheckout();

        await checkoutModule.submitEmptyCheckoutForm();
        await expect(checkoutPage.validationError()).toHaveText(
            testData.messages.checkoutFirstNameRequired,
        );

        await checkoutModule.completeCustomerDetails(
            checkoutInfo.firstName,
            checkoutInfo.lastName,
            checkoutInfo.postalCode,
        );

        await expect(checkoutPage.cartItemByName(productName)).toBeVisible();

        await checkoutModule.finishOrder();

        await expect(checkoutPage.orderConfirmation()).toHaveText(
            testData.messages.orderComplete,
        );
        await expect(checkoutPage.dispatchMessage()).toHaveText(
            testData.messages.dispatchMessage,
        );
    });

    
});
