import { Page } from '@playwright/test';
import { Actions } from '../utils/Actions';
import { CheckoutPage } from '../pages/CheckoutPage';
import { Logger } from '../utils/Logger';

/**
 * CheckoutModule — workflows for reaching the checkout information page.
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

    async navigateToCheckoutInformation(): Promise<void> {
        this.logger.step(1, 'Navigate from the inventory page to the checkout information page');
        await this.actions.click(this.checkoutPage.shoppingCartLink());
        await this.actions.waitForVisible(this.checkoutPage.checkoutButton());
        await this.actions.click(this.checkoutPage.checkoutButton());
        await this.actions.waitForVisible(this.checkoutPage.informationHeader());
    }

    async attemptToFinishCheckoutWithEmptyCart(): Promise<void> {
        this.logger.step(1, 'Attempt to proceed to checkout without adding any products');
        await this.actions.click(this.checkoutPage.shoppingCartLink());
        await this.actions.waitForVisible(this.checkoutPage.checkoutButton());
        await this.actions.click(this.checkoutPage.checkoutButton());
        await this.actions.waitForVisible(this.checkoutPage.informationHeader());
    }

    async navigateToCheckoutInformationUrl(url: string): Promise<void> {
        this.logger.step(1, 'Navigate directly to the checkout information URL');
        await this.page.goto(url);
        await this.actions.waitForVisible(this.checkoutPage.loginButton());
    }
}
