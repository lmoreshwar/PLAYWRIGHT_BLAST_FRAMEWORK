import { type Locator, type Page } from '@playwright/test';

export class InventoryPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    productsTitle = (): Locator => this.page.getByText('Products', { exact: true });
    sortDropdown = (): Locator => this.page.getByRole('combobox');
    shoppingCartLink = (): Locator => this.page.getByRole('link', { name: /shopping cart/i });
    shoppingCartBadge = (): Locator => this.page.getByText(/^\d+$/);
    productItemByName = (productName: string): Locator =>
        this.page.getByRole('link', { name: productName }).last();
    productImageLinks = (): Locator =>
        this.page.getByRole('link').filter({ has: this.page.getByRole('img') });
    addToCartButtonOnList = (productName: string): Locator =>
        this.page
            .locator('[data-test="inventory-item"]')
            .filter({ hasText: productName })
            .getByRole('button', { name: 'Add to cart' });
    removeFromCartButtonOnList = (productName: string): Locator =>
        this.page
            .locator('[data-test="inventory-item"]')
            .filter({ hasText: productName })
            .getByRole('button', { name: 'Remove' });
    addToCartButton = (): Locator => this.page.getByRole('button', { name: 'Add to cart' });
    removeFromCartButton = (): Locator => this.page.getByRole('button', { name: 'Remove' });
    productDetailName = (): Locator => this.page.getByTestId('inventory-item-name');
    productDetailDescription = (): Locator => this.page.getByTestId('inventory-item-desc');
    productDetailPrice = (): Locator => this.page.getByTestId('inventory-item-price');
    backToProductsButton = (): Locator => this.page.getByRole('button', { name: 'Back to products' });
}
