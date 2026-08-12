import { Page } from '@playwright/test';
import { Actions } from '../utils/Actions';
import { Logger } from '../utils/Logger';
import { CheckoutPage } from '../pages/CheckoutPage';

export class CheckoutModule {
    private readonly actions: Actions;
    private readonly checkoutPage: CheckoutPage;
    private readonly logger = Logger.create('CheckoutModule');

    constructor(private readonly page: Page) {
        this.actions = new Actions(page);
        this.checkoutPage = new CheckoutPage(page);
    }

    async enterCustomerInformation(
        firstName: string,
        lastName: string,
        postalCode: string,
    ): Promise<void> {
        this.logger.step(1, 'Enter checkout customer information');
        await this.actions.fill(this.checkoutPage.firstNameInput(), firstName);
        await this.actions.fill(this.checkoutPage.lastNameInput(), lastName);
        await this.actions.fill(this.checkoutPage.postalCodeInput(), postalCode);
    }

    async continue(): Promise<void> {
        this.logger.step(2, 'Continue to checkout overview');
        await this.actions.click(this.checkoutPage.continueButton());
        await this.actions.waitForVisible(this.checkoutPage.checkoutOverviewTitle());
    }

    async finish(): Promise<void> {
        this.logger.step(3, 'Finish checkout');
        await this.actions.click(this.checkoutPage.finishButton());
        await this.actions.waitForVisible(this.checkoutPage.checkoutCompleteTitle());
    }

    async abortWithContinueShopping(): Promise<void> {
        this.logger.step(4, 'Cancel checkout and return to inventory');
        await this.actions.click(this.checkoutPage.cancelButton());
    }
}
