import { test, expect } from '../fixtures';
import { credentials } from '../config';
import testData from '../testdata/testData.json';

/**
 * Product Detail Page & Cart Interactions (SauceDemo)
 * Covers TC_001–TC_005 related to product detail page functionality.
 */
test.describe('Product Detail Page & Cart Interactions', () => {
    const validUser = credentials('app');
    const productName = testData.products.backpack;

    test.beforeEach(async ({ loginModule, page }) => {
        await loginModule.goto();
        await loginModule.login(validUser.username, validUser.password);
        await expect(page).toHaveURL(/inventory\.html/);
    });

    test('TC_001 Click Product Opens Detail Page @ProductDetailPage', async ({ inventoryModule, inventoryPage, page }) => {
        await inventoryModule.navigateToProductDetailPage(productName);

        await expect(page).toHaveURL(/inventory-item\.html\?id=/);
        await expect(inventoryPage.productDetailName()).toBeVisible();
        await expect(inventoryPage.productDetailDescription()).toBeVisible();
        await expect(inventoryPage.productDetailPrice()).toBeVisible();
        await expect(inventoryPage.addToCartButton()).toBeVisible();
        await expect(inventoryPage.backToProductsButton()).toBeVisible();
    });

    test('TC_002 Detail Page Shows Product Information @ProductDetailPage', async ({ inventoryModule, inventoryPage }) => {
        await inventoryModule.navigateToProductDetailPage(productName);

        await expect(inventoryPage.productDetailName()).toHaveText(productName);
        await expect(inventoryPage.productDetailDescription()).not.toBeEmpty();
        await expect(inventoryPage.productDetailPrice()).not.toBeEmpty();
        await expect(inventoryPage.productDetailPrice()).toContainText('$');
    });

    test('TC_003 Add to Cart Button Works @ProductDetailPage @Cart', async ({ inventoryModule, inventoryPage }) => {
        await inventoryModule.navigateToProductDetailPage(productName);
        await expect(inventoryPage.addToCartButton()).toBeVisible();

        await inventoryModule.addProductToCartFromDetail();

        await expect(inventoryPage.removeFromCartButton()).toBeVisible();
        await expect(inventoryPage.addToCartButton()).not.toBeVisible();
        await expect(inventoryPage.shoppingCartBadge()).toHaveText('1');
        await expect(inventoryModule.getCartItemCount()).resolves.toBe(1);
    });

    test('TC_004 Remove from Cart Button Works @ProductDetailPage @Cart', async ({ inventoryModule, inventoryPage }) => {
        await inventoryModule.navigateToProductDetailPage(productName);
        await inventoryModule.addProductToCartFromDetail();
        await expect(inventoryPage.shoppingCartBadge()).toHaveText('1');

        await inventoryModule.removeProductFromCartFromDetail();

        await expect(inventoryPage.addToCartButton()).toBeVisible();
        await expect(inventoryPage.removeFromCartButton()).not.toBeVisible();
        await expect(inventoryPage.shoppingCartBadge()).not.toBeVisible();
        await expect(inventoryModule.getCartItemCount()).resolves.toBe(0);
    });

    test('TC_005 Back to Products Button Works @ProductDetailPage @Navigation', async ({ inventoryModule, inventoryPage, page }) => {
        await inventoryModule.navigateToProductDetailPage(productName);

        await expect(page).toHaveURL(/inventory-item\.html/);

        await inventoryModule.goBackToProducts();

        await expect(page).toHaveURL(/inventory\.html/);
        await expect(inventoryPage.productsTitle()).toBeVisible();
        await expect(inventoryPage.productItemByName(productName)).toBeVisible();
    });

    test('TC_025 Product sorting on the inventory page: First Name boundary (whitespace & max length) @ProductSortingOnTheInventoryPage @Boundary', async ({
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

        await checkoutModule.enterCustomerInformation(
            testData.boundaryValues.firstNameWithWhitespace,
            testData.checkoutInfo.lastName,
            testData.checkoutInfo.postalCode,
        );
        await checkoutModule.continue();

        await expect(page).toHaveURL(/checkout-step-two\.html/);
        await expect(checkoutPage.summaryProductLink(productName)).toBeVisible();

        await checkoutModule.finish();

        await expect(page).toHaveURL(/checkout-complete\.html/);
        await expect(checkoutPage.orderCompleteMessage()).toHaveText(testData.messages.orderComplete);
        await expect(checkoutPage.orderDispatchedMessage()).toHaveText(testData.messages.orderDispatched);
    });

    test('TC_026 Product sorting on the inventory page: Last Name boundary (whitespace & max length) @ProductSortingOnTheInventoryPage @Boundary', async ({
        inventoryModule,
        inventoryPage,
        cartModule,
        cartPage,
        checkoutModule,
        checkoutPage,
        page,
    }) => {
        const boundaryLastName = ` ${testData.boundaryValues.lastNameMaxLengthCore.repeat(testData.boundaryValues.lastNameMaxLength)} `;

        await inventoryModule.navigateToProductDetailPage(productName);
        await inventoryModule.addProductToCartFromDetail();

        await expect(inventoryPage.removeFromCartButton()).toBeVisible();

        await cartModule.goto(`${testData.urls.baseUrl}${testData.urls.cartUrl}`);
        await expect(cartPage.productLink(productName)).toBeVisible();
        await cartModule.checkout();

        await expect(page).toHaveURL(/checkout-step-one\.html/);

        await checkoutModule.enterCustomerInformation(
            testData.checkoutInfo.firstName,
            boundaryLastName,
            testData.checkoutInfo.postalCode,
        );
        await checkoutModule.continue();

        await expect(page).toHaveURL(/checkout-step-two\.html/);
        await expect(checkoutPage.summaryProductLink(productName)).toBeVisible();

        await checkoutModule.finish();

        await expect(page).toHaveURL(/checkout-complete\.html/);
        await expect(checkoutPage.orderCompleteMessage()).toHaveText(testData.messages.orderComplete);
        await expect(checkoutPage.orderDispatchedMessage()).toHaveText(testData.messages.orderDispatched);
    });

    test('TC_027 Product sorting on the inventory page: Zip/Postal Code boundary (whitespace & max length) @ProductSortingOnTheInventoryPage @Boundary', async ({
        inventoryModule,
        inventoryPage,
        cartModule,
        cartPage,
        checkoutModule,
        checkoutPage,
        page,
    }) => {
        const boundaryPostalCode = ` ${testData.boundaryValues.postalCodeMaxLengthCore.repeat(testData.boundaryValues.postalCodeMaxLength)} `;

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
            boundaryPostalCode,
        );
        await checkoutModule.continue();

        await expect(page).toHaveURL(/checkout-step-two\.html/);
        await expect(checkoutPage.summaryProductLink(productName)).toBeVisible();

        await checkoutModule.finish();

        await expect(page).toHaveURL(/checkout-complete\.html/);
        await expect(checkoutPage.orderCompleteMessage()).toHaveText(testData.messages.orderComplete);
        await expect(checkoutPage.orderDispatchedMessage()).toHaveText(testData.messages.orderDispatched);
    });

    test('TC_028 Product sorting on the inventory page: "Go back Continue Shopping" aborts without completing the action @ProductSortingOnTheInventoryPage @Negative', async ({
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
        await expect(page).not.toHaveURL(/checkout-(step-one|step-two|complete)\.html/);
    });

    

    

    

    
});
