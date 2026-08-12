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
        cartModule,
        cartPage,
        checkoutModule,
        inventoryPage,
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
        await expect(inventoryPage.shoppingCartBadge()).toHaveText('1');

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

    test('TC_026 Checkout customer information: First Name boundary (whitespace & max length) @CheckoutCustomerInformation @Boundary', async ({
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

        const boundaryFirstName =
            `  ${testData.tc026CheckoutInfo.firstNameCore.repeat(
                testData.tc026CheckoutInfo.firstNameCoreLength,
            )}  `;

        await checkoutModule.enterCustomerInformation(
            boundaryFirstName,
            testData.tc026CheckoutInfo.lastName,
            testData.tc026CheckoutInfo.postalCode,
        );
        await checkoutModule.continue();
        await expect(page).toHaveURL(/checkout-step-two\.html/);
        await expect(checkoutPage.summaryProductLink(productName)).toBeVisible();
    });

    test('TC_027 Checkout customer information: Last Name boundary (whitespace & max length) @CheckoutCustomerInformation @Boundary', async ({
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

        const boundaryLastName =
            ` ${'a'.repeat(testData.tc027CheckoutInfo.lastNameCoreLength)} `;

        await checkoutModule.enterCustomerInformation(
            testData.tc027CheckoutInfo.firstName,
            boundaryLastName,
            testData.tc027CheckoutInfo.postalCode,
        );
        await checkoutModule.continue();
        await expect(page).toHaveURL(/checkout-step-two\.html/);
        await expect(checkoutPage.summaryProductLink(productName)).toBeVisible();
    });

    test('TC_028 Checkout customer information: Zip/Postal Code boundary (whitespace & max length) @CheckoutCustomerInformation @Boundary', async ({
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

        const boundaryPostalCode =
            ` ${'1'.repeat(testData.tc028CheckoutInfo.postalCodeCoreLength)} `;

        await checkoutModule.enterCustomerInformation(
            testData.tc028CheckoutInfo.firstName,
            testData.tc028CheckoutInfo.lastName,
            boundaryPostalCode,
        );
        await checkoutModule.continue();
        await expect(page).toHaveURL(/checkout-step-two\.html/);
        await expect(checkoutPage.summaryProductLink(productName)).toBeVisible();
    });

    test('TC_029 Checkout customer information: "Go back Cancel" aborts without completing the action @CheckoutCustomerInformation @Negative', async ({
        inventoryModule,
        cartModule,
        cartPage,
        checkoutModule,
        page,
    }) => {
        await inventoryModule.addProductToCartFromInventory(productName);

        await cartModule.goto(`${testData.urls.baseUrl}${testData.urls.cartUrl}`);
        await expect(cartPage.productLink(productName)).toBeVisible();
        await cartModule.checkout();
        await expect(page).toHaveURL(/checkout-step-one\.html/);

        await checkoutModule.enterCustomerInformation(
            testData.checkoutInfo.firstName,
            testData.checkoutInfo.lastName,
            testData.checkoutInfo.postalCode,
        );
        await checkoutModule.cancelCustomerInformation();

        await expect(page).toHaveURL(/cart\.html/);
        await expect(cartPage.productLink(productName)).toBeVisible();
    });

    test('TC_030 Complete checkout customer information and place order @CheckoutCustomerInformation @Positive', async ({
        inventoryModule,
        inventoryPage,
        cartModule,
        cartPage,
        checkoutModule,
        checkoutPage,
        page,
    }) => {
        await inventoryModule.addProductToCartFromInventory(productName);
        await expect(inventoryPage.shoppingCartBadge()).toHaveText('1');

        await cartModule.goto(`${testData.urls.baseUrl}${testData.urls.cartUrl}`);
        await expect(cartPage.productLink(productName)).toBeVisible();
        await cartModule.checkout();
        await expect(page).toHaveURL(/checkout-step-one\.html/);

        await checkoutModule.enterCustomerInformation(
            testData.tc030CheckoutInfo.firstName,
            testData.tc030CheckoutInfo.lastName,
            testData.tc030CheckoutInfo.postalCode,
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

    test('TC_031 Reject an empty First Name @CheckoutCustomerInformation @Negative', async ({
        inventoryModule,
        inventoryPage,
        cartModule,
        cartPage,
        checkoutModule,
        checkoutPage,
        page,
    }) => {
        await inventoryModule.addProductToCartFromInventory(productName);
        await expect(inventoryPage.shoppingCartBadge()).toHaveText('1');

        await cartModule.goto(`${testData.urls.baseUrl}${testData.urls.cartUrl}`);
        await expect(cartPage.productLink(productName)).toBeVisible();
        await cartModule.checkout();
        await expect(page).toHaveURL(/checkout-step-one\.html/);

        await checkoutModule.enterCustomerInformation(
            testData.tc031CheckoutInfo.firstName,
            testData.tc031CheckoutInfo.lastName,
            testData.tc031CheckoutInfo.postalCode,
        );
        await checkoutModule.continue();

        await expect(page).toHaveURL(/checkout-step-one\.html/);
        await expect(checkoutPage.firstNameRequiredError()).toHaveText(
            testData.messages.firstNameRequired,
        );
    });

    

    

    test('TC_034 Reject submission when all customer information is empty @CheckoutCustomerInformation @Negative', async ({
        inventoryModule,
        inventoryPage,
        cartModule,
        cartPage,
        checkoutModule,
        checkoutPage,
        page,
    }) => {
        await inventoryModule.addProductToCartFromInventory(productName);
        await expect(inventoryPage.shoppingCartBadge()).toHaveText('1');

        await cartModule.goto(`${testData.urls.baseUrl}${testData.urls.cartUrl}`);
        await expect(cartPage.productLink(productName)).toBeVisible();
        await cartModule.checkout();
        await expect(page).toHaveURL(/checkout-step-one\.html/);

        await checkoutModule.enterCustomerInformation('', '', '');
        await checkoutModule.continue();

        await expect(page).toHaveURL(/checkout-step-one\.html/);
        await expect(checkoutPage.firstNameRequiredError()).toHaveText(
            testData.messages.firstNameRequired,
        );
    });

    test('TC_010 Recover from missing First Name and continue @CheckoutCustomerInformation @Negative', async ({
        inventoryModule,
        inventoryPage,
        cartModule,
        cartPage,
        checkoutModule,
        checkoutPage,
        page,
    }) => {
        await inventoryModule.addProductToCartFromInventory(productName);
        await expect(inventoryPage.shoppingCartBadge()).toHaveText('1');

        await cartModule.goto(`${testData.urls.baseUrl}${testData.urls.cartUrl}`);
        await expect(cartPage.productLink(productName)).toBeVisible();
        await cartModule.checkout();
        await expect(page).toHaveURL(/checkout-step-one\.html/);

        await checkoutModule.enterCustomerInformationWithoutFirstName(
            testData.checkoutInfo.lastName,
            testData.checkoutInfo.postalCode,
        );
        await checkoutModule.continue();

        await expect(page).toHaveURL(/checkout-step-one\.html/);
        await expect(checkoutPage.firstNameRequiredError()).toHaveText(
            testData.messages.firstNameRequired,
        );
    });
});
