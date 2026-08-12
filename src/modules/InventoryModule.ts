import { Page } from '@playwright/test';
import { Actions } from '../utils/Actions';
import { WaitHelper } from '../utils/WaitHelper';
import { InventoryPage } from '../pages/InventoryPage';

export class InventoryModule {
    private readonly page: Page;
    private readonly inventoryPage: InventoryPage;
    private readonly actions: Actions;
    private readonly waitHelper: WaitHelper;

    constructor(page: Page) {
        this.page = page;
        this.inventoryPage = new InventoryPage(page);
        this.actions = new Actions(page);
        this.waitHelper = new WaitHelper(page);
    }

    async navigateToProductDetailPage(productName: string): Promise<void> {
        await this.actions.click(this.inventoryPage.productItemByName(productName));
        await this.waitHelper.waitForURL(/inventory-item\.html\?id=/);
    }

    async addProductToCartFromDetail(): Promise<void> {
        await this.actions.click(this.inventoryPage.addToCartButton());
    }

    async removeProductFromCartFromDetail(): Promise<void> {
        await this.actions.click(this.inventoryPage.removeFromCartButton());
    }

    async goBackToProducts(): Promise<void> {
        await this.actions.click(this.inventoryPage.backToProductsButton());
        await this.waitHelper.waitForVisible(this.inventoryPage.productsTitle());
    }

    async getCartItemCount(): Promise<number> {
        const badge = this.inventoryPage.shoppingCartBadge();
        if (!(await badge.isVisible().catch(() => false))) {
            return 0;
        }

        const badgeText = await badge.textContent();
        return Number(badgeText ?? '0');
    }

    async getProductOrder(): Promise<string[]> {
        return this.inventoryPage.productLinks().allTextContents();
    }

    async getSortValue(): Promise<string> {
        return this.inventoryPage.sortDropdown().inputValue();
    }

    async selectNextSortOption(): Promise<void> {
        await this.actions.press(this.inventoryPage.sortDropdown(), 'ArrowDown');
        await this.actions.press(this.inventoryPage.sortDropdown(), 'Enter');
    }

    async selectFirstSortOption(): Promise<void> {
        await this.actions.press(this.inventoryPage.sortDropdown(), 'Home');
        await this.actions.press(this.inventoryPage.sortDropdown(), 'Enter');
    }

    async selectLastSortOption(): Promise<void> {
        await this.actions.press(this.inventoryPage.sortDropdown(), 'End');
        await this.actions.press(this.inventoryPage.sortDropdown(), 'Enter');
    }

    async addProductToCartFromList(productName: string): Promise<void> {
        await this.actions.click(this.inventoryPage.addToCartButtonOnList(productName));
    }

    async goToCart(): Promise<void> {
        await this.actions.click(this.inventoryPage.shoppingCartLink());
        await this.waitHelper.waitForURL(/cart\.html/);
    }
}
