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

    async logout(): Promise<void> {
        this.logger.step(3, 'Open the burger menu and log out');
        await this.actions.click(this.loginPage.menuButton());
        await this.actions.click(this.loginPage.logoutLink());
    }

    async openProtectedPage(path: string): Promise<void> {
        this.logger.step(4, `Attempt direct access to protected page: ${path}`);
        await this.page.goto(path);
    }
}
