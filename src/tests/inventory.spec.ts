import { test, expect } from '../fixtures';
import { credentials } from '../config';
import testData from '../testdata/testData.json';

test.describe('Inventory — Product Sorting Boundary Coverage', () => {
    const validCredentials = credentials('app');
    const productName = testData.products.backpack;

    test.beforeEach(async ({ loginModule, inventoryPage, page }) => {
        await loginModule.goto();
        await loginModule.login(validCredentials.username, validCredentials.password);

        await expect(page).toHaveURL(/inventory\.html/);
        await expect(inventoryPage.productsTitle()).toBeVisible();
    });

    

    

    

    

    test('TC_029 Sort inventory products by name ascending @ProductSortingOnTheInventoryPage @Positive', async ({
        inventoryModule,
        inventoryPage,
    }) => {
        const initialProductNames = await inventoryModule.observeProductNames();

        await expect(inventoryPage.sortCombobox()).toBeVisible();

        await inventoryModule.sortProducts(testData.sortOptions.nameAsc);

        await expect(inventoryPage.sortCombobox()).toHaveValue('az');

        const expectedProductNames = [...initialProductNames].sort((left, right) =>
            left.localeCompare(right),
        );

        await expect(inventoryModule.observeProductNames()).resolves.toEqual(
            expectedProductNames,
        );
    });

    

    test('TC_031 Verify lowest and highest price sorting boundaries @ProductSortingOnTheInventoryPage @Boundary', async ({
        inventoryModule,
        inventoryPage,
    }) => {
        await inventoryModule.sortProducts(testData.sortOptions.priceAsc);

        await expect(inventoryPage.sortCombobox()).toHaveValue('lohi');

        const lowToHighProductNames = await inventoryModule.observeProductNames();
        const lowestPriceFirstProduct = lowToHighProductNames[0];
        const lowestPriceLastProduct = lowToHighProductNames[lowToHighProductNames.length - 1];

        expect(lowestPriceFirstProduct).toBe(testData.products.onesie);
        expect(lowestPriceLastProduct).toBe(testData.products.fleeceJacket);

        await inventoryModule.sortProducts(testData.sortOptions.priceDesc);

        await expect(inventoryPage.sortCombobox()).toHaveValue('hilo');

        const highToLowProductNames = await inventoryModule.observeProductNames();
        const highestPriceFirstProduct = highToLowProductNames[0];
        const highestPriceLastProduct = highToLowProductNames[highToLowProductNames.length - 1];

        expect(highestPriceFirstProduct).toBe(testData.products.fleeceJacket);
        expect(highestPriceLastProduct).toBe(testData.products.onesie);
    });

    
});
