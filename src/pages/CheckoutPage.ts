import { Locator, Page } from '@playwright/test';

/**
 * CheckoutPage — locators for checkout-step-one, checkout-step-two, and checkout-complete.
 * No workflows or assertions.
 */
export class CheckoutPage {
    constructor(private readonly page: Page) {}

    firstNameInput = (): Locator =>
        this.page.getByPlaceholder('First Name');

    lastNameInput = (): Locator =>
        this.page.getByPlaceholder('Last Name');

    postalCodeInput = (): Locator =>
        this.page.getByPlaceholder('Zip/Postal Code');

    continueButton = (): Locator =>
        this.page.getByRole('button', { name: 'Continue' });

    summaryProductLink = (productName: string): Locator =>
        this.page.getByRole('link', { name: productName });

    finishButton = (): Locator =>
        this.page.getByRole('button', { name: 'Finish' });

    checkoutOverviewTitle = (): Locator =>
        this.page.getByText('Checkout: Overview', { exact: true });

    checkoutCompleteTitle = (): Locator =>
        this.page.getByText('Checkout: Complete!', { exact: true });

    firstNameRequiredError = (): Locator =>
        this.page.getByText('Error: First Name is required', { exact: true });

    orderCompleteMessage = (): Locator =>
        this.page.getByText('Thank you for your order!', { exact: true });

    orderDispatchedMessage = (): Locator =>
        this.page.getByText(
            'Your order has been dispatched, and will arrive just as fast as the pony can get there!',
            { exact: true },
        );

    itemTotal = (): Locator =>
        this.page.getByText('Item total: $29.99', { exact: true });

    tax = (): Locator =>
        this.page.getByText('Tax: $2.40', { exact: true });

    total = (): Locator =>
        this.page.getByText('Total: $32.39', { exact: true });

    cancelButton = (): Locator =>
        this.page.getByRole('button', { name: 'Go back Cancel' });

    backHomeButton = (): Locator =>
        this.page.getByRole('button', { name: 'Back Home' });
}
