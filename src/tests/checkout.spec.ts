import { test, expect } from '../fixtures';
import { credentials } from '../config';
import testData from '../testdata/testData.json';

test.describe('Checkout', () => {
    test(
        'TC_023 Logged-in user accesses checkout page and sees the information header',
        { tag: ['@Checkout', '@Positive'] },
        async ({ loginModule, inventoryModule, checkoutModule, checkoutPage }) => {
            await loginModule.login(credentials('app'));
            await inventoryModule.navigateToProductDetailPage(testData.products.backpack);
            await inventoryModule.addProductToCartFromDetail();
            await checkoutModule.navigateToCheckoutInformation();

            await expect(checkoutPage.informationHeader()).toBeVisible();
        },
    );

    test(
        'TC_024 Unauthenticated user is blocked from checkout page',
        { tag: ['@Checkout', '@Negative'] },
        async ({ checkoutModule, loginPage }) => {
            const checkoutUrl = `${testData.urls.baseUrl}${testData.urls.checkoutStepOneUrl}`;

            await checkoutModule.navigateToCheckoutInformationUrl(checkoutUrl);

            await expect(loginPage.loginButton()).toBeVisible();
        },
    );

    test(
        'TC_025 User skips checkout step one and attempts to load step two',
        { tag: ['@Checkout', '@Negative'] },
        async ({ checkoutModule, loginPage }) => {
            const checkoutStepTwoUrl = `${testData.urls.baseUrl}${testData.urls.checkoutStepTwoUrl}`;

            await checkoutModule.navigateToCheckoutInformationUrl(checkoutStepTwoUrl);

            await expect(loginPage.loginButton()).toBeVisible();
        },
    );

    test(
        'TC_026 Attempt to finish checkout with an empty cart',
        { tag: ['@Checkout', '@Negative'] },
        async ({ loginModule, checkoutModule, checkoutPage }) => {
            await loginModule.login(credentials('app'));
            await checkoutModule.attemptToFinishCheckoutWithEmptyCart();

            await expect(checkoutPage.informationHeader()).toBeVisible();
        },
    );
});
