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

    sortDropdown = (): Locator =>
        this.page.getByRole('combobox');

    productLinks = (): Locator =>
        this.page
            .getByRole('link')
            .filter({ has: this.page.getByRole('img') });

    async goto(url: string): Promise<void> {
        this.logger.step(1, `Navigate to inventory: ${url}`);
        await this.page.goto(url);
        await this.actions.waitForVisible(this.inventoryPage.productsTitle());
    }

    async sortReverseAlphabetically(): Promise<void> {
        this.logger.step(2, 'Focus the inventory sort combobox');
        await this.actions.click(this.inventoryPage.sortDropdown());

        this.logger.step(3, 'Select reverse alphabetical product order');
        await this.actions.pressOn(this.inventoryPage.sortDropdown(), 'ArrowDown');
        await this.actions.pressOn(this.inventoryPage.sortDropdown(), 'Enter');
    }

    async getDisplayedProductOrder(): Promise<string[]> {
        this.logger.step(4, 'Read the displayed product-link order');
        return this.inventoryPage.productLinks().allTextContents();
    }

    async navigateToProductDetailPage(productName: string): Promise<void> {
        this.logger.step(5, `Open product details for "${productName}"`);
        await this.actions.click(this.inventoryPage.productItemByName(productName));
        await this.actions.waitForVisible(this.inventoryPage.productDetailName());
    }

    async addProductToCartFromDetail(): Promise<void> {
        this.logger.step(6, 'Add the product to the cart from its detail page');
        await this.actions.click(this.inventoryPage.addToCartButton());
    }

    async removeProductFromCartFromDetail(): Promise<void> {
        this.logger.step(7, 'Remove the product from the cart from its detail page');
        await this.actions.click(this.inventoryPage.removeFromCartButton());
    }

    async goBackToProducts(): Promise<void> {
        this.logger.step(8, 'Return to the products view');
        await this.actions.click(this.inventoryPage.backToProductsButton());
        await this.actions.waitForVisible(this.inventoryPage.productsTitle());
    }

    async getCartItemCount(): Promise<string | null> {
        this.logger.step(9, 'Read the shopping-cart item count');
        return this.inventoryPage.shoppingCartBadge().textContent();
    }

    sortingControl = (): Locator =>
        this.page.getByRole('combobox');

    selectedSortingOption = (optionLabel: string): Locator =>
        this.page.getByRole('option', {
            name: optionLabel,
            selected: true,
        });
}
