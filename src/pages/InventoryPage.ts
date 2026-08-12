import { type Locator, type Page } from '@playwright/test';

export class InventoryPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    productsTitle = (): Locator => this.page.getByText('Products', { exact: true });

    sortDropdown = (): Locator => this.page.getByRole('combobox');

    productLinks = (): Locator => this.page.locator('.inventory_item_name');

    productItemByName = (productName: string): Locator =>
        this.page.getByRole('link', { name: productName, exact: true }).last();

    addToCartButton = (): Locator =>
        this.page.getByRole('button', { name: 'Add to cart', exact: true });

    addToCartButtonOnList = (productName: string): Locator =>
        this.productItemByName(productName)
            .locator('xpath=ancestor::div[contains(@class,"inventory_item")]')
            .getByRole('button', { name: 'Add to cart', exact: true });

    removeFromCartButton = (): Locator =>
        this.page.getByRole('button', { name: 'Remove', exact: true });

    shoppingCartBadge = (): Locator =>
        this.page.getByText(/^\d+$/, { exact: true });

    shoppingCartLink = (): Locator =>
        this.page.getByRole('link', { name: /shopping cart/i });

    productDetailName = (): Locator =>
        this.page.getByRole('heading', { level: 2 });

    productDetailDescription = (): Locator =>
        this.page.locator('.inventory_details_desc');

    productDetailPrice = (): Locator =>
        this.page.locator('.inventory_details_price');

    backToProductsButton = (): Locator =>
        this.page.getByRole('button', { name: 'Back to products', exact: true });
}
