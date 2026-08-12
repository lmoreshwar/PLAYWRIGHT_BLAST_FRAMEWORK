import { Page } from '@playwright/test';
import { Actions } from '../utils/Actions';
import { CheckoutPage } from '../pages/CheckoutPage';
import { InventoryPage } from '../pages/InventoryPage';
import { Logger } from '../utils/Logger';

/**
 * CheckoutModule — workflows for adding a product and completing checkout.
 * No assertions.
 */
export class CheckoutModule {
    private readonly actions: Actions;
    private readonly checkoutPage: CheckoutPage;
    private readonly inventoryPage: InventoryPage;
    private readonly logger = Logger.create('CheckoutModule');

    constructor(private readonly page: Page) {
        this.actions = new Actions(page);
        this.checkoutPage = new CheckoutPage(page);
        this.inventoryPage = new InventoryPage(page);
    }

    async addProductFromInventory(productName: string): Promise<void> {
        this.logger.step(1, `Add "${productName}" to the cart from inventory`);
        await this.actions.click(this.inventoryPage.addToCartButtonOnList(productName));
        await this.actions.waitForVisible(this.inventoryPage.removeFromCartButton());
    }

    async openCart(): Promise<void> {
        this.logger.step(2, 'Open the shopping cart');
        await this.actions.click(this.checkoutPage.shoppingCartLink());
        await this.actions.waitForVisible(this.checkoutPage.cartTitle());
    }

    async selectCheckout(): Promise<void> {
        this.logger.step(3, 'Select Checkout');
        await this.actions.click(this.checkoutPage.checkoutButton());
        await this.actions.waitForVisible(this.checkoutPage.firstNameInput());
    }

    async enterCustomerInformation(
        firstName: string,
        lastName: string,
        postalCode: string,
    ): Promise<void> {
        this.logger.step(4, 'Enter checkout customer information');
        await this.actions.fill(this.checkoutPage.firstNameInput(), firstName);
        await this.actions.fill(this.checkoutPage.lastNameInput(), lastName);
        await this.actions.fill(this.checkoutPage.postalCodeInput(), postalCode);
    }

    async continueToOverview(): Promise<void> {
        this.logger.step(5, 'Continue to checkout overview');
        await this.actions.click(this.checkoutPage.continueButton());
        await this.actions.waitForVisible(this.checkoutPage.checkoutStepTwoTitle());
    }

    async finishCheckout(): Promise<void> {
        this.logger.step(6, 'Finish checkout');
        await this.actions.click(this.checkoutPage.finishButton());
        await this.actions.waitForVisible(this.checkoutPage.orderConfirmation());
    }

    async returnHome(): Promise<void> {
        this.logger.step(7, 'Return to products');
        await this.actions.click(this.checkoutPage.backHomeButton());
        await this.actions.waitForVisible(this.inventoryPage.productsTitle());
    }

    async goBackContinueShopping(): Promise<void> {
        this.logger.step(8, 'Abort checkout and continue shopping');
        await this.actions.click(this.checkoutPage.goBackContinueShoppingButton());
        await this.actions.waitForVisible(this.inventoryPage.productsTitle());
    }
}
