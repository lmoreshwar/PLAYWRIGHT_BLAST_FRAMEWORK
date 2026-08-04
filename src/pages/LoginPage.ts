import { Locator, Page } from '@playwright/test';

/**
 * LoginPage — locators ONLY for the SauceDemo login screen and the post-login
 * session controls (burger menu + logout). No workflows, no assertions.
 */
export class LoginPage {
    constructor(private readonly page: Page) {}

    usernameInput = (): Locator => this.page.getByPlaceholder('Username');

    passwordInput = (): Locator => this.page.getByPlaceholder('Password');

    loginButton = (): Locator => this.page.getByRole('button', { name: 'Login' });

    // reason: the error is an <h3 data-test="error"> with no ARIA role or label; the app-owned
    // data-test hook is the stable single strategy (config testIdAttribute is the default data-testid).
    errorMessage = (): Locator => this.page.locator('[data-test="error"]');

    // Post-login session chrome — the logout entry points shown after a successful login.
    menuButton = (): Locator => this.page.getByRole('button', { name: 'Open Menu' });

    logoutLink = (): Locator => this.page.getByRole('link', { name: 'Logout' });
}
