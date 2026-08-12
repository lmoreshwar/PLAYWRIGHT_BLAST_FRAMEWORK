import { Locator, Page } from '@playwright/test';

export class CheckoutPage {
    public constructor(private readonly page: Page) {}

    public checkoutCompleteTitle(): Locator {
        return this.page.getByRole('heading', { name: 'Checkout: Complete!' });
    }

    public checkoutOverviewTitle(): Locator {
        return this.page.getByRole('heading', { name: 'Checkout: Overview' });
    }

    public continueButton(): Locator {
        return this.page.getByRole('button', { name: 'Continue' });
    }

    public finishButton(): Locator {
        return this.page.getByRole('button', { name: 'Finish' });
    }

    public firstNameInput(): Locator {
        return this.page.getByPlaceholder('First Name');
    }

    public lastNameInput(): Locator {
        return this.page.getByPlaceholder('Last Name');
    }

    public postalCodeInput(): Locator {
        return this.page.getByPlaceholder('Zip/Postal Code');
    }

    public firstNameRequiredError(): Locator {
        return this.page.locator('[data-test="error"]');
    }

    public postalCodeRequiredError(): Locator {
        return this.page.locator('[data-test="error"]');
    }

    public orderCompleteMessage(): Locator {
        return this.page.getByRole('heading', { name: 'Thank you for your order!' });
    }

    public orderDispatchedMessage(): Locator {
        return this.page.getByText('Your order has been dispatched');
    }

    public summaryProductLink(productName: string): Locator {
        return this.page.getByRole('link', { name: productName });
    }
}
