import { Locator, Page } from '@playwright/test';

export class CheckoutPage {
    constructor(private readonly page: Page) {}

    checkoutCompleteTitle = (): Locator =>
        this.page.getByRole('heading', { name: 'Checkout: Complete!' });

    checkoutOverviewTitle = (): Locator =>
        this.page.getByRole('heading', { name: 'Checkout: Overview' });

    continueButton = (): Locator =>
        this.page.getByRole('button', { name: 'Continue', exact: true });

    finishButton = (): Locator =>
        this.page.getByRole('button', { name: 'Finish', exact: true });

    cancelButton = (): Locator =>
        this.page.getByRole('button', { name: 'Cancel', exact: true });

    firstNameInput = (): Locator =>
        this.page.getByLabel('First Name');

    firstNameRequiredError = (): Locator =>
        this.page.locator('[data-test="error"]');

    lastNameInput = (): Locator =>
        this.page.getByLabel('Last Name');

    postalCodeInput = (): Locator =>
        this.page.getByLabel('Zip/Postal Code');

    orderCompleteMessage = (): Locator =>
        this.page.getByRole('heading', { name: 'Thank you for your order!' });

    orderDispatchedMessage = (): Locator =>
        this.page.getByText('Your order has been dispatched');

    summaryProductLink = (productName: string): Locator =>
        this.page.getByRole('link', { name: productName });
}
