import { Locator, Page } from '@playwright/test';

/**
 * InventoryPage — locators ONLY for the SauceDemo inventory list and product detail screens.
 * No workflows, no assertions.
 */
export class InventoryPage {
    constructor(private readonly page: Page) {}

    // --- Inventory List Page Locators ---
    productsTitle = (): Locator => this.page.getByText('Products', { exact: true });

    productItemByName = (productName: string): Locator =>
        this.page.getByRole('link', { name: productName }).first();

    addToCartButtonOnList = (productName: string): Locator =>
        this.page.locator('.inventory_item', { has: this.page.getByText(productName) })
            .getByRole('button', { name: 'Add to cart' });

    // --- Product Detail Page Locators ---
    productDetailName = (): Locator => this.page.locator('.inventory_details_name');

    productDetailDescription = (): Locator => this.page.locator('.inventory_details_desc');

    productDetailPrice = (): Locator => this.page.locator('.inventory_details_price');

    addToCartButton = (): Locator => this.page.getByRole('button', { name: 'Add to cart' });

    removeFromCartButton = (): Locator => this.page.getByRole('button', { name: 'Remove' });

    backToProductsButton = (): Locator => this.page.getByRole('button', { name: 'Back to products' });

    // --- Common Locators (Inventory List & Detail) ---
    shoppingCartLink = (): Locator => this.page.getByRole('link', { name: /shopping cart/i });

    shoppingCartBadge = (): Locator => this.page.locator('.shopping_cart_badge');
}
