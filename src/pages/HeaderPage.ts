import { Locator, Page } from '@playwright/test';

/**
 * HeaderPage — locators for global header elements such as the menu button and logout link.
 * No workflows, no assertions.
 */
export class HeaderPage {
    constructor(private readonly page: Page) {}

    /** Menu (hamburger) button that opens the side navigation */
    menuButton = (): Locator => this.page.getByRole('button', { name: 'Open Menu' });

    /** Logout link inside the side navigation */
    logoutLink = (): Locator => this.page.getByRole('link', { name: 'Logout' });
}
