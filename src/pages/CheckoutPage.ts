import { Locator, Page } from '@playwright/test';

/**
 * CheckoutPage — locators for the cart, checkout, and order-complete views.
 * No workflows or assertions.
 */
export class CheckoutPage {
    constructor(private readonly page: Page) {}

    shoppingCartLink = (): Locator =>
        this.page.locator('.shopping_cart_link');

    cartItemByName = (productName: string): Locator =>
        this.page.getByRole('link', { name: productName });

    checkoutButton = (): Locator =>
        this.page.getByRole('button', { name: 'Checkout' });

    continueShoppingButton = (): Locator =>
        this.page.getByRole('button', { name: 'Continue Shopping' });

    firstNameInput = (): Locator =>
        this.page.getByRole('textbox', { name: 'First Name' });

    lastNameInput = (): Locator =>
        this.page.getByRole('textbox', { name: 'Last Name' });

    postalCodeInput = (): Locator =>
        this.page.getByRole('textbox', { name: 'Zip/Postal Code' });

    continueButton = (): Locator =>
        this.page.getByRole('button', { name: 'Continue' });

    validationError = (): Locator =>
        this.page.getByText('Error: First Name is required');

    finishButton = (): Locator =>
        this.page.getByRole('button', { name: 'Finish' });

    orderConfirmation = (): Locator =>
        this.page.getByText('Thank you for your order!');

    dispatchMessage = (): Locator =>
        this.page.getByText(
            'Your order has been dispatched, and will arrive just as fast as the pony can get there!',
        );

    productsTitle = (): Locator =>
        this.page.getByText('Products', { exact: true });
}
