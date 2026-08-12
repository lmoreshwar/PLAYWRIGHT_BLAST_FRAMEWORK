import { Page } from '@playwright/test';
import { Actions } from '../utils/Actions';
import { Logger } from '../utils/Logger';
import { CheckoutPage } from '../pages/CheckoutPage';
import { InventoryModule } from './InventoryModule';

/**
 * CheckoutModule — workflows for checkout form submission and order completion.
 * No assertions.
 */
export class CheckoutModule {
    private readonly actions: Actions;
    private readonly checkoutPage: CheckoutPage;
    private readonly inventoryModule: InventoryModule;
    private readonly logger = Logger.create('CheckoutModule');

    constructor(private readonly page: Page) {
        this.actions = new Actions(page);
        this.checkoutPage = new CheckoutPage(page);
        this.inventoryModule = new InventoryModule(page);
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
        this.logger.step(2, 'Click "Continue"');
        await this.actions.click(this.checkoutPage.continueButton());
    }

    async finish(): Promise<void> {
        this.logger.step(3, 'Click "Finish"');
        await this.actions.click(this.checkoutPage.finishButton());
    }

    async abortWithContinueShopping(): Promise<void> {
        this.logger.step(4, 'Return to the products page');
        await this.page.goBack();
        await this.page.goBack();
        await this.inventoryModule.goBackToProducts();
    }

    async cancelCustomerInformation(): Promise<void> {
        this.logger.step(5, 'Cancel checkout');
        await this.actions.click(this.checkoutPage.cancelButton());
    }

    async enterCustomerInformationWithEmptyFirstName(
        lastName: string,
        postalCode: string,
    ): Promise<void> {
        this.logger.step(6, 'Enter checkout information with an empty First Name');
        await this.actions.fill(this.checkoutPage.lastNameInput(), lastName);
        await this.actions.fill(this.checkoutPage.postalCodeInput(), postalCode);
    }

    async enterCustomerInformationWithEmptyPostalCode(
        firstName: string,
        lastName: string,
    ): Promise<void> {
        this.logger.step(7, 'Enter checkout information with an empty Zip/Postal Code');
        await this.actions.fill(this.checkoutPage.firstNameInput(), firstName);
        await this.actions.fill(this.checkoutPage.lastNameInput(), lastName);
    }
}
