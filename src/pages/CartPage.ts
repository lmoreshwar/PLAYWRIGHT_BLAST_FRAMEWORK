import { Locator, Page } from '@playwright/test';

/**
 * CartPage — locators for cart and checkout screens.
 * No workflows, assertions, or business logic.
 */
export class CartPage {
    constructor(private readonly page: Page) {}

    shoppingCartLink = (): Locator =>
        this.page.locator('[data-test="shopping-cart-link"]');

    cartCheckoutButton = (): Locator => this.page.getByRole('button', { name: 'Checkout' });

    continueShoppingButton = (): Locator =>
        this.page.getByRole('button', { name: 'Continue Shopping' });

    checkoutInformationHeading = (): Locator =>
        this.page.getByRole('heading', { name: 'Checkout: Your Information' });

    firstNameInput = (): Locator => this.page.getByLabel('First Name');

    lastNameInput = (): Locator => this.page.getByLabel('Last Name');

    postalCodeInput = (): Locator => this.page.getByLabel('Zip/Postal Code');

    checkoutContinueButton = (): Locator =>
        this.page.getByRole('button', { name: 'Continue' });

    checkoutErrorMessage = (): Locator =>
        this.page.getByText('Error: First Name is required', { exact: true });

    checkoutOverviewHeading = (): Locator =>
        this.page.getByRole('heading', { name: 'Checkout: Overview' });

    finishButton = (): Locator => this.page.getByRole('button', { name: 'Finish' });

    checkoutCompleteHeading = (): Locator =>
        this.page.getByRole('heading', { name: 'Checkout: Complete!' });

    orderConfirmation = (): Locator =>
        this.page.getByText('Thank you for your order!', { exact: true });
}
