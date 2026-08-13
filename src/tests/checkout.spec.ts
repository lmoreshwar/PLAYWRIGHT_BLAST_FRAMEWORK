import { test, expect } from '../fixtures';
import { credentials } from '../config';
import testData from '../testdata/testData.json';

test.describe('Checkout — Required-Field Recovery and Order Completion', () => {
    const valid = credentials('app');
    const productName = testData.products.backpack;
    const checkoutInfo = testData.checkoutInfo;

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

    test('TC_025 Add Sauce Labs Backpack and complete the order successfully @AddAProductToTheCartFromTheInventoryPage @Positive', async ({
        inventoryModule,
        inventoryPage,
        cartModule,
        cartPage,
        checkoutModule,
        checkoutPage,
        page,
    }) => {
        await inventoryModule.addProductToCartFromInventory(productName);

        await expect(inventoryPage.removeFromCartButton()).toBeVisible();

        await cartModule.goto(`${testData.urls.baseUrl}${testData.urls.cartUrl}`);
        await expect(cartPage.productLink(productName)).toBeVisible();

        await cartModule.checkout();
        await expect(page).toHaveURL(/checkout-step-one\.html/);

        await checkoutModule.enterCustomerInformation(
            testData.tc025CheckoutInfo.firstName,
            testData.tc025CheckoutInfo.lastName,
            testData.tc025CheckoutInfo.postalCode,
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

    test('TC_031 Complete checkout with one item and verify order summary totals @CompleteCheckoutOrderSummaryAndPriceTotalVerification @Positive', async ({
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
        await expect(page).toHaveURL(/cart\.html/);
        await expect(cartPage.productLink(productName)).toBeVisible();

        await cartModule.checkout();
        await expect(page).toHaveURL(/checkout-step-one\.html/);

        await checkoutModule.enterCustomerInformation(
            checkoutInfo.firstName,
            checkoutInfo.lastName,
            checkoutInfo.postalCode,
        );
        await checkoutModule.continue();

        await expect(page).toHaveURL(/checkout-step-two\.html/);
        await expect(checkoutPage.checkoutOverviewTitle()).toBeVisible();
        await expect(checkoutPage.summaryProductLink(productName)).toBeVisible();
        await expect(checkoutPage.itemTotal()).toHaveText(testData.orderSummary.itemTotal);
        await expect(checkoutPage.tax()).toHaveText(testData.orderSummary.tax);
        await expect(checkoutPage.total()).toHaveText(testData.orderSummary.total);

        await checkoutModule.finish();

        await expect(page).toHaveURL(/checkout-complete\.html/);
        await expect(checkoutPage.orderCompleteMessage()).toHaveText(
            testData.messages.orderComplete,
        );
        await expect(checkoutPage.orderDispatchedMessage()).toHaveText(
            testData.messages.orderDispatched,
        );
    });

    test('TC_032 Reject checkout when First Name is empty @CompleteCheckoutOrderSummaryAndPriceTotalVerification @Boundary', async ({
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
        await expect(page).toHaveURL(/cart\.html/);
        await expect(cartPage.productLink(productName)).toBeVisible();

        await cartModule.checkout();
        await expect(page).toHaveURL(/checkout-step-one\.html/);

        await checkoutModule.enterCustomerInformation(
            '',
            testData.checkoutInfo.lastName,
            '12345',
        );
        await checkoutModule.continue();

        await expect(page).toHaveURL(/checkout-step-one\.html/);
        await expect(checkoutPage.firstNameRequiredError()).toHaveText(
            testData.messages.firstNameRequired,
        );
    });

    test('TC_033 Accept minimum single-character checkout values @CompleteCheckoutOrderSummaryAndPriceTotalVerification @Boundary', async ({
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
        await expect(page).toHaveURL(/cart\.html/);
        await expect(cartPage.productLink(productName)).toBeVisible();

        await cartModule.checkout();
        await expect(page).toHaveURL(/checkout-step-one\.html/);

        await checkoutModule.enterCustomerInformation(
            testData.tc033CheckoutInfo.firstName,
            testData.tc033CheckoutInfo.lastName,
            testData.tc033CheckoutInfo.postalCode,
        );
        await checkoutModule.continue();

        await expect(page).toHaveURL(/checkout-step-two\.html/);
        await expect(checkoutPage.checkoutOverviewTitle()).toBeVisible();
        await expect(checkoutPage.summaryProductLink(productName)).toBeVisible();
        await expect(checkoutPage.itemTotal()).toHaveText(testData.orderSummary.itemTotal);
        await expect(checkoutPage.tax()).toHaveText(testData.orderSummary.tax);
        await expect(checkoutPage.total()).toHaveText(testData.orderSummary.total);
    });

    test('TC_034 Accept leading and trailing whitespace around checkout values @CompleteCheckoutOrderSummaryAndPriceTotalVerification @Boundary', async ({
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
        await expect(page).toHaveURL(/cart\.html/);
        await expect(cartPage.productLink(productName)).toBeVisible();

        await cartModule.checkout();
        await expect(page).toHaveURL(/checkout-step-one\.html/);

        await checkoutModule.enterCustomerInformation(
            testData.tc034CheckoutInfo.firstName,
            testData.tc034CheckoutInfo.lastName,
            testData.tc034CheckoutInfo.postalCode,
        );
        await checkoutModule.continue();

        await expect(page).toHaveURL(/checkout-step-two\.html/);
        await expect(checkoutPage.checkoutOverviewTitle()).toBeVisible();
        await expect(checkoutPage.summaryProductLink(productName)).toBeVisible();
        await expect(checkoutPage.itemTotal()).toHaveText(testData.orderSummary.itemTotal);
        await expect(checkoutPage.tax()).toHaveText(testData.orderSummary.tax);
        await expect(checkoutPage.total()).toHaveText(testData.orderSummary.total);
    });

    test('TC_035 Return from cart without changing the selected item @CompleteCheckoutOrderSummaryAndPriceTotalVerification @Positive', async ({
        inventoryModule,
        inventoryPage,
        cartModule,
        cartPage,
        page,
    }) => {
        await inventoryModule.navigateToProductDetailPage(productName);
        await inventoryModule.addProductToCartFromDetail();

        await cartModule.goto(`${testData.urls.baseUrl}${testData.urls.cartUrl}`);

        await expect(page).toHaveURL(/cart\.html/);
        await expect(cartPage.productLink(productName)).toBeVisible();

        await cartModule.continueShopping();

        await expect(page).toHaveURL(/inventory\.html/);
        await expect(inventoryPage.productsTitle()).toBeVisible();
        await expect(inventoryPage.removeFromCartButton()).toBeVisible();
    });

    test('TC_036 Cancel from the order summary without completing the order @CompleteCheckoutOrderSummaryAndPriceTotalVerification @Positive', async ({
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
        await expect(page).toHaveURL(/cart\.html/);
        await expect(cartPage.productLink(productName)).toBeVisible();

        await cartModule.checkout();
        await expect(page).toHaveURL(/checkout-step-one\.html/);

        await checkoutModule.enterCustomerInformation(
            testData.tc036CheckoutInfo.firstName,
            testData.tc036CheckoutInfo.lastName,
            testData.tc036CheckoutInfo.postalCode,
        );
        await checkoutModule.continue();

        await expect(page).toHaveURL(/checkout-step-two\.html/);
        await expect(checkoutPage.checkoutOverviewTitle()).toBeVisible();
        await expect(checkoutPage.summaryProductLink(productName)).toBeVisible();
        await expect(checkoutPage.itemTotal()).toHaveText(testData.orderSummary.itemTotal);
        await expect(checkoutPage.tax()).toHaveText(testData.orderSummary.tax);
        await expect(checkoutPage.total()).toHaveText(testData.orderSummary.total);

        await checkoutModule.cancelFromOrderSummary();

        await expect(page).toHaveURL(/inventory\.html/);
        await expect(inventoryPage.productsTitle()).toBeVisible();
    });

    test('TC_037 Return home after a completed order @CompleteCheckoutOrderSummaryAndPriceTotalVerification @Positive', async ({
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
        await expect(page).toHaveURL(/cart\.html/);
        await expect(cartPage.productLink(productName)).toBeVisible();

        await cartModule.checkout();
        await expect(page).toHaveURL(/checkout-step-one\.html/);

        await checkoutModule.enterCustomerInformation(
            testData.tc037CheckoutInfo.firstName,
            testData.tc037CheckoutInfo.lastName,
            testData.tc037CheckoutInfo.postalCode,
        );
        await checkoutModule.continue();

        await expect(page).toHaveURL(/checkout-step-two\.html/);
        await expect(checkoutPage.checkoutOverviewTitle()).toBeVisible();
        await expect(checkoutPage.summaryProductLink(productName)).toBeVisible();
        await expect(checkoutPage.total()).toHaveText(testData.orderSummary.total);

        await checkoutModule.finish();

        await expect(page).toHaveURL(/checkout-complete\.html/);
        await expect(checkoutPage.orderCompleteMessage()).toHaveText(
            testData.messages.orderComplete,
        );

        await checkoutModule.backHome();

        await expect(page).toHaveURL(/inventory\.html/);
        await expect(inventoryPage.productsTitle()).toBeVisible();
    });

    test('TC_001 Complete checkout from a reviewed cart item @CartReview @Positive', async ({
        inventoryModule,
        inventoryPage,
        cartModule,
        cartPage,
        checkoutModule,
        checkoutPage,
        page,
    }) => {
        await expect(page).toHaveURL(/inventory\.html/);
        await expect(inventoryPage.productsTitle()).toBeVisible();

        await inventoryModule.addProductToCartFromInventory(productName);

        await cartModule.goto(`${testData.urls.baseUrl}${testData.urls.cartUrl}`);
        await expect(page).toHaveURL(/cart\.html/);
        await expect(cartPage.productLink(productName)).toBeVisible();

        await cartModule.checkout();
        await expect(page).toHaveURL(/checkout-step-one\.html/);

        await checkoutModule.enterCustomerInformation(
            testData.tc031CheckoutInfo.firstName,
            testData.tc031CheckoutInfo.lastName,
            testData.tc031CheckoutInfo.postalCode,
        );
        await checkoutModule.continue();

        await expect(page).toHaveURL(/checkout-step-two\.html/);
        await expect(checkoutPage.summaryProductLink(productName)).toBeVisible();

        await checkoutModule.finish();

        await expect(page).toHaveURL(/checkout-complete\.html/);
        await expect(checkoutPage.orderCompleteMessage()).toHaveText(
            testData.messages.orderComplete,
        );
    });
});
