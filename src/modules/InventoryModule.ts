import { Page } from '@playwright/test';
import { Actions } from '../utils/Actions';
import { WaitHelper } from '../utils/WaitHelper';
import { WorkflowActions } from '../utils/WorkflowActions';
import { InventoryPage } from '../pages/InventoryPage';

export class InventoryModule {
    private readonly actions: Actions;

    public constructor(
        private readonly page: Page,
        private readonly inventoryPage: InventoryPage,
        actions: Actions = new Actions(page),
        _waitHelper?: WaitHelper,
        _workflowActions?: WorkflowActions,
    ) {
        this.actions = actions;
    }

    public async navigateToProductDetailPage(productName: string): Promise<void> {
        await this.actions.click(this.inventoryPage.productItemByName(productName));
    }

    public async addProductToCartFromDetail(): Promise<void> {
        await this.actions.click(this.inventoryPage.addToCartButton());
    }

    public async removeProductFromCartFromDetail(): Promise<void> {
        await this.actions.click(this.inventoryPage.removeFromCartButton());
    }

    public async goBackToProducts(): Promise<void> {
        await this.actions.click(this.inventoryPage.backToProductsButton());
    }

    public async getCartItemCount(): Promise<number> {
        return this.inventoryPage.shoppingCartBadge().count();
    }

    public async focusSortControlAndPressHome(): Promise<void> {
        const sortControl = this.page.getByRole('combobox', { name: 'Sort' });
        await this.actions.click(sortControl);
        await this.actions.pressOn(sortControl, 'Home');
    }

    public async sortProductsDescendingByKeyboard(): Promise<void> {
        const sortControl = this.page.getByRole('combobox', { name: 'Sort' });
        await this.actions.click(sortControl);
        await this.actions.pressOn(sortControl, 'End');
    }

    public async sortProductsByPriceAscendingByKeyboard(): Promise<void> {
        const sortControl = this.page.getByRole('combobox', { name: 'Sort' });
        await this.actions.click(sortControl);
        await this.actions.pressOn(sortControl, 'Home');
        await this.actions.pressOn(sortControl, 'ArrowDown');
        await this.actions.pressOn(sortControl, 'Enter');
    }

    public async sortProductsByPriceDescendingByKeyboard(): Promise<void> {
        const sortControl = this.page.getByRole('combobox', { name: 'Sort' });
        await this.actions.click(sortControl);
        await this.actions.pressOn(sortControl, 'End');
        await this.actions.pressOn(sortControl, 'Enter');
    }
}
