import { test, expect } from '../fixtures';
import { credentials } from '../config';
import testData from '../testdata/testData.json';

/**
 * Product Detail Page & Cart Interactions (SauceDemo)
 * Covers TC_001–TC_005 related to product detail page functionality.
 */
test.describe('Product Detail Page & Cart Interactions', () => {
    const validUser = credentials('app');
    const productName = testData.products.backpack; // Using a consistent product for tests

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
        await expect(inventoryPage.shoppingCartBadge()).not.toBeVisible(); // Badge disappears when cart is empty
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
});
