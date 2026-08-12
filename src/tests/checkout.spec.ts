import { test, expect } from '../fixtures';
import { credentials } from '../config';
import testData from '../testdata/testData.json';

test.describe('Checkout — Required-Field Recovery and Order Completion', () => {
    const valid = credentials('app');
    const productName = testData.products.backpack;

    test.beforeEach(async ({ loginModule, inventoryPage, page }) => {
        await loginModule.goto();
        await loginModule.login(valid.username, valid.password);

        await expect(page).toHaveURL(/inventory\.html/);
        await expect(inventoryPage.productsTitle()).toBeVisible();
    });

    test('TC_023 Add Sauce Labs Backpack and complete checkout after required-field recovery @AddProductToCart @Positive', async ({
        inventoryModule,
        inventoryPage,
        cartModule,
        cartPage,
        checkoutModule,
        checkoutPage,
        page,
    }) => {
        await inventoryModule.navigateToProductDetailPage(productName);
        await inventoryModule.addProductToCartFromDetail();

        await expect(inventoryPage.removeFromCartButton()).toBeVisible();

        await cartModule.goto(`${testData.urls.baseUrl}${testData.urls.cartUrl}`);
        await expect(cartPage.productLink(productName)).toBeVisible();
        await cartModule.checkout();

        await expect(page).toHaveURL(/checkout-step-one\.html/);

        await checkoutModule.continue();
        await expect(checkoutPage.firstNameRequiredError()).toHaveText(
            testData.messages.firstNameRequired,
        );

        await checkoutModule.enterCustomerInformation(
            testData.checkoutInfo.firstName,
            testData.checkoutInfo.lastName,
            testData.checkoutInfo.postalCode,
        );
        await checkoutModule.continue();

        await expect(page).toHaveURL(/checkout-step-two\.html/);
        await expect(checkoutPage.summaryProductLink(productName)).toBeVisible();

        await checkoutModule.finish();

        await expect(page).toHaveURL(/checkout-complete\.html/);
        await expect(checkoutPage.orderCompleteMessage()).toHaveText(
            testData.messages.orderComplete,
        );
        await expect(checkoutPage.orderDispatchedMessage()).toHaveText(
            testData.messages.orderDispatched,
        );
    });

    test('TC_024 Add product to cart: "Go back Continue Shopping" aborts without completing the action @AddProductToCart @Negative', async ({
        inventoryModule,
        inventoryPage,
        cartModule,
        cartPage,
        checkoutModule,
        page,
    }) => {
        await inventoryModule.navigateToProductDetailPage(productName);
        await inventoryModule.addProductToCartFromDetail();

        await cartModule.goto(`${testData.urls.baseUrl}${testData.urls.cartUrl}`);
        await expect(cartPage.productLink(productName)).toBeVisible();
        await cartModule.checkout();

        await expect(page).toHaveURL(/checkout-step-one\.html/);

        await checkoutModule.enterCustomerInformation(
            testData.checkoutInfo.firstName,
            testData.checkoutInfo.lastName,
            testData.checkoutInfo.postalCode,
        );
        await checkoutModule.abortWithContinueShopping();

        await expect(page).toHaveURL(/inventory\.html/);
        await expect(inventoryPage.productsTitle()).toBeVisible();
    });
});
