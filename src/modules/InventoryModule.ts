import { Page } from '@playwright/test';
import { Actions } from '../utils/Actions';
import { WaitHelper } from '../utils/WaitHelper';
import { InventoryPage } from '../pages/InventoryPage';

export class InventoryModule {
    private readonly inventoryPage: InventoryPage;
    private readonly actions: Actions;
    private readonly waitHelper: WaitHelper;

    constructor(
        private readonly page: Page,
        inventoryPage?: InventoryPage,
        actions?: Actions,
        waitHelper?: WaitHelper,
    ) {
        this.inventoryPage = inventoryPage ?? new InventoryPage(page);
        this.actions = actions ?? new Actions(page);
        this.waitHelper = waitHelper ?? new WaitHelper(page);
    }

    async navigateToProductDetailPage(productName: string): Promise<void> {
        await this.waitHelper.waitForVisible(this.inventoryPage.productItemByName(productName));
        await this.actions.click(this.inventoryPage.productItemByName(productName));
    }

    async addProductToCartFromDetail(): Promise<void> {
        await this.actions.click(this.inventoryPage.addToCartButton());
    }

    async removeProductFromCartFromDetail(): Promise<void> {
        await this.actions.click(this.inventoryPage.removeFromCartButton());
    }

    async goBackToProducts(): Promise<void> {
        await this.actions.click(this.inventoryPage.backToProductsButton());
    }

    async getCartItemCount(): Promise<number> {
        const badge = this.inventoryPage.shoppingCartBadge();

        if ((await badge.count()) === 0) {
            return 0;
        }

        const badgeText = await badge.textContent();
        return Number.parseInt(badgeText?.trim() ?? '0', 10);
    }

    async sortProducts(value: string): Promise<void> {
        await this.actions.selectOption(this.inventoryPage.productSortDropdown(), value);
    }

    async addProductToCartFromList(productName: string): Promise<void> {
        await this.actions.click(this.inventoryPage.addToCartButtonOnList(productName));
    }

    async openCart(): Promise<void> {
        await this.actions.click(this.inventoryPage.shoppingCartLink());
    }
}
