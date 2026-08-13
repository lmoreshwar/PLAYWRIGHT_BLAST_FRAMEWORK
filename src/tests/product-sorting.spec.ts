import { test, expect } from '../fixtures';
import { credentials } from '../config';
import testData from '../testdata/testData.json';

test.describe('Product Sorting by Name and Price', () => {
    const valid = credentials('app');

    test.beforeEach(async ({ loginModule, inventoryPage, page }) => {
        await loginModule.goto();
        await loginModule.login(valid.username, valid.password);

        await expect(page).toHaveURL(/inventory\.html/);
        await expect(inventoryPage.productsTitle()).toBeVisible();
    });

    test('TC_026 Sort products by name in ascending order @ProductSortingByNameAndPrice @Positive', async ({
        inventoryModule,
        inventoryPage,
    }) => {
        await inventoryModule.sortProductsBy(testData.sortOptions.nameAsc);

        await expect(inventoryPage.sortDropdown()).toHaveValue('az');
        await expect(inventoryPage.productLinks()).toHaveText([
            testData.products.backpack,
            testData.products.bikeLight,
            testData.products.boltTShirt,
            testData.products.fleeceJacket,
            testData.products.onesie,
            testData.products.redTShirt,
        ]);
    });

    test('TC_027 Sort products by name in descending order @ProductSortingByNameAndPrice @Positive', async ({
        inventoryModule,
        inventoryPage,
    }) => {
        await inventoryModule.sortProductsBy(testData.sortOptions.nameDesc);

        await expect(inventoryPage.sortDropdown()).toHaveValue('za');
        await expect(inventoryPage.productLinks()).toHaveText([
            testData.products.redTShirt,
            testData.products.onesie,
            testData.products.fleeceJacket,
            testData.products.boltTShirt,
            testData.products.bikeLight,
            testData.products.backpack,
        ]);
    });

    test('TC_028 Sort products by price from low to high @ProductSortingByNameAndPrice @Positive', async ({
        inventoryModule,
        inventoryPage,
    }) => {
        await inventoryModule.sortProductsBy(testData.sortOptions.priceAsc);

        await expect(inventoryPage.sortDropdown()).toHaveValue('lohi');
        await expect(inventoryPage.productLinks()).toHaveText([
            testData.products.onesie,
            testData.products.bikeLight,
            testData.products.boltTShirt,
            testData.products.redTShirt,
            testData.products.backpack,
            testData.products.fleeceJacket,
        ]);
    });

    test('TC_029 Sort products by price from high to low @ProductSortingByNameAndPrice @Positive', async ({
        inventoryModule,
        inventoryPage,
    }) => {
        await inventoryModule.sortProductsBy(testData.sortOptions.priceDesc);

        await expect(inventoryPage.sortDropdown()).toHaveValue('hilo');
        await expect(inventoryPage.productLinks()).toHaveText([
            testData.products.fleeceJacket,
            testData.products.backpack,
            testData.products.boltTShirt,
            testData.products.redTShirt,
            testData.products.bikeLight,
            testData.products.onesie,
        ]);
    });

    test('TC_030 Unauthenticated direct access to inventory is blocked @ProductSortingByNameAndPrice @Negative', async ({
        loginModule,
        loginPage,
        page,
    }) => {
        await loginModule.logout();
        await loginModule.openProtectedPage('/inventory.html');

        await expect(page).toHaveURL(/\/$/);
        await expect(loginPage.errorMessage()).toHaveText(testData.messages.sessionRequired);
    });
});
