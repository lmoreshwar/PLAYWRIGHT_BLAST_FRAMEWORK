import { Locator, Page } from '@playwright/test';

/**
 * CartPage — locators for the shopping cart view.
 * No workflows or assertions.
 */
export class CartPage {
    constructor(private readonly page: Page) {}

    productLink = (productName: string): Locator =>
        this.page.getByRole('link', { name: productName });

    checkoutButton = (): Locator =>
        this.page.getByRole('button', { name: 'Checkout' });

    cartTitle = (): Locator =>
        this.page.getByText('Your Cart', { exact: true });

    continueShoppingButton = (): Locator =>
        this.page.getByRole('button', { name: 'Go back Continue Shopping' });

    readonly removeButton = (productName: string): Locator =>
        this.page
            .locator('.cart_item')
            .filter({ has: this.productLink(productName) })
            .getByRole('button', { name: 'Remove', exact: true });
}
