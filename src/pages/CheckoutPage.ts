import { Locator, Page } from '@playwright/test';

/**
 * CheckoutPage — locators for navigating to and viewing checkout information.
 * No workflows, no assertions.
 */
export class CheckoutPage {
    constructor(private readonly page: Page) {}

    /** Shopping cart link in the inventory header */
    shoppingCartLink = (): Locator => this.page.getByRole('link', { name: 'Shopping Cart' });

    /** Checkout button on the cart page */
    checkoutButton = (): Locator => this.page.getByRole('button', { name: 'Checkout' });

    /** Checkout information page header */
    informationHeader = (): Locator =>
        this.page.getByRole('heading', { name: 'Checkout: Your Information' });

    /** Login button displayed when an unauthenticated user is redirected to login */
    loginButton = (): Locator => this.page.getByRole('button', { name: 'Login' });
}
