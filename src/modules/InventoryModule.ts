import { Page } from '@playwright/test';
import { Actions } from '../utils/Actions';
import { Logger } from '../utils/Logger';
import { InventoryPage } from '../pages/InventoryPage';
import { WorkflowActions } from '../utils/WorkflowActions';

/**
 * InventoryModule — workflows for interacting with the product inventory and detail pages.
 * Sequences of InventoryPage interactions via `Actions`. No raw locators, no assertions.
 */
export class InventoryModule {
    private readonly actions: Actions;
    private readonly inventoryPage: InventoryPage;
    private readonly workflowActions: WorkflowActions;
    private readonly logger = Logger.create('InventoryModule');

    constructor(private readonly page: Page) {
        this.actions = new Actions(page);
        this.inventoryPage = new InventoryPage(page);
        this.workflowActions = new WorkflowActions(page);
    }

    async navigateToProductDetailPage(productName: string): Promise<void> {
        this.logger.step(1, `Navigate to detail page for product: "${productName}"`);
        await this.actions.click(this.inventoryPage.productItemByName(productName));
        await this.actions.waitForVisible(this.inventoryPage.productDetailName());
    }

    async addProductToCartFromDetail(): Promise<void> {
        this.logger.step(2, 'Add product to cart from detail page');
        await this.actions.click(this.inventoryPage.addToCartButton());
        await this.actions.waitForVisible(this.inventoryPage.removeFromCartButton());
    }

    async removeProductFromCartFromDetail(): Promise<void> {
        this.logger.step(3, 'Remove product from cart from detail page');
        await this.actions.click(this.inventoryPage.removeFromCartButton());
        await this.actions.waitForVisible(this.inventoryPage.addToCartButton());
    }

    async goBackToProducts(): Promise<void> {
        this.logger.step(4, 'Click "Back to products" button');
        await this.actions.click(this.inventoryPage.backToProductsButton());
        await this.actions.waitForVisible(this.inventoryPage.productsTitle());
    }

    async getCartItemCount(): Promise<number> {
        this.logger.step(5, 'Get shopping cart item count');
        const badge = this.inventoryPage.shoppingCartBadge();
        if (await badge.isVisible()) {
            const count = await badge.textContent();
            return count ? parseInt(count, 10) : 0;
        }
        return 0;
    }

    async sortProducts(optionLabel: string): Promise<void> {
        this.logger.step(6, `Sort inventory products by "${optionLabel}"`);
        await this.actions.selectOption(this.inventoryPage.sortCombobox(), { label: optionLabel });
        await this.actions.waitForVisible(this.inventoryPage.productsTitle());
    }

    async observeProductNames(): Promise<string[]> {
        this.logger.step(7, 'Observe inventory product links from top to bottom');
        return this.inventoryPage.productLinks().allTextContents();
    }

    async observeProductPrices(): Promise<string[]> {
        this.logger.step(8, 'Observe inventory product prices from top to bottom');
        return this.inventoryPage.productPrices().allTextContents();
    }

    async addProductToCartFromList(productName: string): Promise<void> {
        this.logger.step(9, `Add product to cart from inventory list: "${productName}"`);
        await this.actions.click(this.inventoryPage.addToCartButtonOnList(productName));
        await this.actions.waitForVisible(this.inventoryPage.shoppingCartBadge());
    }

    async openCart(): Promise<void> {
        this.logger.step(10, 'Open the shopping cart');
        await this.actions.click(this.inventoryPage.shoppingCartLink());
    }
}
