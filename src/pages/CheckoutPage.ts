import { Locator, Page } from '@playwright/test';

/**
 * CheckoutPage — locators for cart and checkout screens.
 * No workflows, assertions, or business logic.
 */
export class CheckoutPage {
    constructor(private readonly page: Page) {}

    cartTitle = (): Locator =>
        this.page.locator('[data-test="title"]').filter({ hasText: 'Your Cart' });

    shoppingCartLink = (): Locator => this.page.locator('[data-test="shopping-cart-link"]');

    checkoutButton = (): Locator => this.page.getByRole('button', { name: 'Checkout' });

    checkoutStepOneTitle = (): Locator =>
        this.page
            .locator('[data-test="title"]')
            .filter({ hasText: 'Checkout: Your Information' });

    firstNameInput = (): Locator => this.page.getByPlaceholder('First Name');

    lastNameInput = (): Locator => this.page.getByPlaceholder('Last Name');

    postalCodeInput = (): Locator => this.page.getByPlaceholder('Zip/Postal Code');

    continueButton = (): Locator => this.page.getByRole('button', { name: 'Continue' });

    goBackContinueShoppingButton = (): Locator =>
        this.page.getByRole('button', { name: 'Go back Continue Shopping' });

    checkoutStepTwoTitle = (): Locator =>
        this.page.locator('[data-test="title"]').filter({ hasText: 'Checkout: Overview' });

    finishButton = (): Locator => this.page.getByRole('button', { name: 'Finish' });

    orderConfirmation = (): Locator => this.page.getByText('Thank you for your order!', { exact: true });

    backHomeButton = (): Locator => this.page.getByRole('button', { name: 'Back Home' });

    cartProductLink = (productName: string): Locator =>
        this.page.getByRole('link', { name: productName, exact: true });

    checkoutOverviewProductLink = (productName: string): Locator =>
        this.page.getByRole('link', { name: productName, exact: true });
}
