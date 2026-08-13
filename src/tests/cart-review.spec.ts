import { test, expect } from '../fixtures';
import { credentials } from '../config';
import testData from '../testdata/testData.json';

test.describe('Cart Review', () => {
    const validCredentials = credentials('app');
    const productName = testData.products.backpack;

    test.beforeEach(async ({ loginModule, inventoryPage, page }) => {
        await loginModule.goto();
        await loginModule.login(validCredentials.username, validCredentials.password);

        await expect(page).toHaveURL(/inventory\.html/);
        await expect(inventoryPage.productsTitle()).toBeVisible();
    });

    test('TC_002 Return from cart review without changing the cart @CartReview @Positive', async ({
        inventoryModule,
        cartModule,
        cartPage,
        page,
    }) => {
        await inventoryModule.addProductToCartFromInventory(productName);

        await cartModule.goto(`${testData.urls.baseUrl}${testData.urls.cartUrl}`);

        await expect(page).toHaveURL(/cart\.html/);
        await expect(cartPage.productLink(productName)).toBeVisible();

        await cartModule.continueShopping();

        await expect(page).toHaveURL(/inventory\.html/);

        await cartModule.goto(`${testData.urls.baseUrl}${testData.urls.cartUrl}`);

        await expect(page).toHaveURL(/cart\.html/);
        await expect(cartPage.productLink(productName)).toBeVisible();
    });

    test('TC_003 Remove the reviewed item from the cart @CartReview @Negative', async ({
        inventoryModule,
        cartModule,
        cartPage,
        page,
    }) => {
        await inventoryModule.addProductToCartFromInventory(productName);

        await cartModule.goto(`${testData.urls.baseUrl}${testData.urls.cartUrl}`);

        await expect(page).toHaveURL(/cart\.html/);
        await expect(cartPage.productLink(productName)).toBeVisible();

        await cartModule.removeProductFromCart(productName);

        await expect(cartPage.productLink(productName)).toBeHidden();
        await expect(cartPage.cartTitle()).toBeVisible();
    });

    test('TC_005 Checkout from an empty cart does not complete an order @CartReview @Negative', async ({
        cartModule,
        cartPage,
        checkoutPage,
        page,
    }) => {
        await cartModule.goto(`${testData.urls.baseUrl}${testData.urls.cartUrl}`);

        await expect(page).toHaveURL(/cart\.html/);
        await expect(cartPage.productLink(productName)).toBeHidden();

        await cartModule.checkout();

        await expect(page).toHaveURL(/checkout-step-one\.html/);
        await expect(checkoutPage.firstNameInput()).toBeVisible();
    });
});
