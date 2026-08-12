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

        await expect(inventoryPage.removeFromCartButton()).toBeVisible();

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
            ` ${testData.checkoutBoundary.firstNameCharacter.repeat(
                testData.checkoutBoundary.firstNameLength,
            )} `;

        await checkoutModule.enterCustomerInformation(
            boundaryFirstName,
            testData.checkoutBoundary.lastName,
            testData.checkoutBoundary.postalCode,
        );
        await checkoutModule.continue();

        await expect(page).toHaveURL(/checkout-step-two\.html/);
    });

    

    

    

    test('TC_030 Complete checkout customer information through order confirmation @CheckoutCustomerInformation @Positive', async ({
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

        await checkoutModule.enterCustomerInformationWithEmptyFirstName(
            testData.tc031CheckoutInfo.lastName,
            testData.tc031CheckoutInfo.postalCode,
        );
        await checkoutModule.continue();

        await expect(checkoutPage.firstNameRequiredError()).toHaveText(
            testData.messages.firstNameRequired,
        );
        await expect(page).toHaveURL(/checkout-step-one\.html/);
    });

    test('TC_032 Reject an empty Last Name @CheckoutCustomerInformation @Negative', async ({
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
            testData.tc032CheckoutInfo.firstName,
            testData.tc032CheckoutInfo.lastName,
            testData.tc032CheckoutInfo.postalCode,
        );
        await checkoutModule.continue();

        await expect(checkoutPage.lastNameRequiredError()).toHaveText(
            testData.messages.lastNameRequired,
        );
        await expect(page).toHaveURL(/checkout-step-one\.html/);
    });

    test('TC_033 Reject an empty Zip/Postal Code @CheckoutCustomerInformation @Negative', async ({
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

        await checkoutModule.enterCustomerInformationWithEmptyPostalCode(
            testData.tc033CheckoutInfo.firstName,
            testData.tc033CheckoutInfo.lastName,
        );
        await checkoutModule.continue();

        await expect(page).toHaveURL(/checkout-step-one\.html/);
        await expect(checkoutPage.firstNameInput()).toHaveValue(
            testData.tc033CheckoutInfo.firstName,
        );
        await expect(checkoutPage.lastNameInput()).toHaveValue(
            testData.tc033CheckoutInfo.lastName,
        );
        await expect(checkoutPage.postalCodeInput()).toHaveValue('');
    });

    

    
});
