import { Page } from '@playwright/test';
import { Actions } from '../utils/Actions';
import { Logger } from '../utils/Logger';
import { LoginPage } from '../pages/LoginPage';

/**
 * LoginModule — authentication & session workflows. Sequences of LoginPage
 * interactions via `Actions`. No raw locators, no assertions (those live in the spec).
 */
export class LoginModule {
    private readonly actions: Actions;
    private readonly loginPage: LoginPage;
    private readonly logger = Logger.create('LoginModule');

    constructor(private readonly page: Page) {
        this.actions = new Actions(page);
        this.loginPage = new LoginPage(page);
    }

    async goto(): Promise<void> {
        this.logger.step(1, 'Open the SauceDemo login page');
        await this.page.goto('/');
        await this.actions.waitForVisible(this.loginPage.loginButton());
    }

    async login(username: string, password: string): Promise<void> {
        this.logger.step(2, `Log in as "${username || '<empty>'}"`);
        await this.actions.fill(this.loginPage.usernameInput(), username);
        await this.actions.fill(this.loginPage.passwordInput(), password);
        await this.actions.click(this.loginPage.loginButton());
    }

    async submitEmpty(): Promise<void> {
        this.logger.step(2, 'Submit the login form with empty fields');
        await this.actions.clear(this.loginPage.usernameInput());
        await this.actions.clear(this.loginPage.passwordInput());
        await this.actions.click(this.loginPage.loginButton());
    }

    async attemptInvalidLogins(username: string, password: string, attempts: number): Promise<void> {
        this.logger.step(2, `Attempt ${attempts} invalid login(s) as "${username}"`);
        for (let i = 1; i <= attempts; i++) {
            await this.login(username, password);
        }
    }

    async logout(): Promise<void> {
        this.logger.step(3, 'Open the burger menu and log out');
        await this.actions.click(this.loginPage.menuButton());
        await this.actions.click(this.loginPage.logoutLink());
    }

    async openProtectedPage(path: string): Promise<void> {
        this.logger.step(4, `Attempt direct access to protected page: ${path}`);
        await this.page.goto(path);
    }

    async refreshLoginPage(): Promise<void> {
        this.logger.step(5, 'Refresh the SauceDemo login page');
        await this.page.reload();
        await this.actions.waitForVisible(this.loginPage.loginButton());
    }

    async attemptLogoutWithoutSession(): Promise<void> {
        this.logger.step(6, 'Attempt to access logout without an active session');

        if (await this.loginPage.menuButton().isVisible()) {
            await this.actions.click(this.loginPage.menuButton());

            if (await this.loginPage.sidebarLogoutLink().isVisible()) {
                await this.actions.click(this.loginPage.sidebarLogoutLink());
            }
        }

        await this.actions.waitForVisible(this.loginPage.loginButton());
    }

    async openMenu(): Promise<void> {
        this.logger.step(7, 'Open the hamburger menu without selecting logout');
        await this.actions.click(this.loginPage.menuButton());
    }

    async captureSessionCredential(): Promise<string> {
        this.logger.step(8, 'Capture the active session credential');

        const credential = await this.page.evaluate(() => window.localStorage.getItem('session-username'));

        if (credential === null) {
            throw new Error('No active session credential was found.');
        }

        return credential;
    }

    async reuseSessionCredential(credential: string): Promise<void> {
        this.logger.step(9, 'Attempt to reuse the captured session credential');

        await this.page.evaluate((sessionCredential) => {
            window.localStorage.setItem('session-username', sessionCredential);
        }, credential);

        await this.openProtectedPage('/inventory.html');
    }
}
