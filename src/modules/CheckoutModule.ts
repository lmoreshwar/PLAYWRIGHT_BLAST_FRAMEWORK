import { Page } from '@playwright/test';
import { CheckoutPage } from '../pages/CheckoutPage';
import { Actions } from '../utils/Actions';
import { Logger } from '../utils/Logger';

/**
 * CheckoutModule — workflows for cart and checkout completion.
 * No assertions.
 */
export class CheckoutModule {
    private readonly actions: Actions;
    private readonly checkoutPage: CheckoutPage;
    private readonly logger = Logger.create('CheckoutModule');

    constructor(private readonly page: Page) {
        this.actions = new Actions(page);
        this.checkoutPage = new CheckoutPage(page);
    }

    async openCart(): Promise<void> {
        this.logger.step(1, 'Open the shopping cart');
        await this.actions.click(this.checkoutPage.shoppingCartLink());
        await this.actions.waitForVisible(this.checkoutPage.checkoutButton());
    }

    async startCheckout(): Promise<void> {
        this.logger.step(2, 'Start checkout');
        await this.actions.click(this.checkoutPage.checkoutButton());
        await this.actions.waitForVisible(this.checkoutPage.firstNameInput());
    }

    async submitEmptyCheckoutForm(): Promise<void> {
        this.logger.step(3, 'Submit checkout form with empty customer details');
        await this.actions.click(this.checkoutPage.continueButton());
        await this.actions.waitForVisible(this.checkoutPage.validationError());
    }

    async completeCustomerDetails(
        firstName: string,
        lastName: string,
        postalCode: string,
    ): Promise<void> {
        this.logger.step(4, 'Enter checkout customer details');
        await this.actions.fill(this.checkoutPage.firstNameInput(), firstName);
        await this.actions.fill(this.checkoutPage.lastNameInput(), lastName);
        await this.actions.fill(this.checkoutPage.postalCodeInput(), postalCode);
        await this.actions.click(this.checkoutPage.continueButton());
        await this.actions.waitForVisible(this.checkoutPage.finishButton());
    }

    async enterCustomerDetails(
        firstName: string,
        lastName: string,
        postalCode: string,
    ): Promise<void> {
        this.logger.step(4, 'Enter valid checkout customer details without submitting');
        await this.actions.fill(this.checkoutPage.firstNameInput(), firstName);
        await this.actions.fill(this.checkoutPage.lastNameInput(), lastName);
        await this.actions.fill(this.checkoutPage.postalCodeInput(), postalCode);
    }

    async goBackAndContinueShopping(): Promise<void> {
        this.logger.step(5, 'Return to the cart and abort checkout with Continue Shopping');
        await this.actions.goBack();
        await this.actions.waitForVisible(this.checkoutPage.checkoutButton());
        await this.actions.click(this.checkoutPage.continueShoppingButton());
        await this.actions.waitForVisible(this.checkoutPage.productsTitle());
    }

    async finishOrder(): Promise<void> {
        this.logger.step(5, 'Finish the order');
        await this.actions.click(this.checkoutPage.finishButton());
        await this.actions.waitForVisible(this.checkoutPage.orderConfirmation());
    }
}
