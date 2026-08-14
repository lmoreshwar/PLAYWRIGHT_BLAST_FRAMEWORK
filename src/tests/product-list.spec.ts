import { test, expect } from '../fixtures';
import { credentials } from '../config';
import testData from '../testdata/testData.json';

test.describe('Inventory — Product List', () => {
    const validCredentials = credentials('app');

    test.beforeEach(async ({ loginModule, inventoryPage, page }) => {
        await loginModule.goto();
        await loginModule.login(validCredentials.username, validCredentials.password);

        await expect(page).toHaveURL(/inventory\.html/);
        await expect(inventoryPage.productsTitle()).toBeVisible();
    });

    test('TC_001 Display all six products @ProductList @Validation', async ({
        inventoryPage,
    }) => {
        const expectedProductCount = Object.keys(testData.products).length;

        await expect(inventoryPage.productLinks()).toHaveCount(expectedProductCount);
    });

    test('TC_002 Verify product count below required boundary @ProductList @Validation', async ({
        inventoryPage,
    }) => {
        const requiredBoundary = Object.keys(testData.products).length + 1;

        await expect(inventoryPage.productLinks()).toHaveCount(
            Object.keys(testData.products).length,
        );
        await expect(inventoryPage.productLinks()).not.toHaveCount(requiredBoundary);
    });
});
