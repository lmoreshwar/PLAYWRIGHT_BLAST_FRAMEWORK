import { Page } from '@playwright/test';
import { Logger } from '../utils/Logger';
import { Actions } from '../utils/Actions';
import { LoginModule } from './LoginModule';

/**
 * LoginErrorModule — workflows for simulating error responses on the login request.
 * Uses Playwright routing to force a 500 HTTP response, then performs a login attempt.
 * No assertions; those belong in the spec.
 */
export class LoginErrorModule {
    private readonly logger = Logger.create('LoginErrorModule');
    private readonly actions: Actions;

    constructor(
        private readonly page: Page,
        private readonly loginModule: LoginModule,
    ) {
        this.actions = new Actions(page);
    }

    /**
     * Mocks a 500 Internal Server Error for the login POST request and then
     * attempts to log in with the supplied credentials.
     *
     * @param username - Username to submit.
     * @param password - Password to submit.
     */
    async loginWithServerError(username: string, password: string): Promise<void> {
        this.logger.step(1, 'Mock 500 response for login request');
        await this.page.route('**/login', async (route) => {
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Internal Server Error' }),
            });
        });

        // Perform the login using the existing LoginModule workflow.
        await this.loginModule.login(username, password);

        // Clean up the route to avoid affecting other tests.
        await this.page.unroute('**/login');
    }
}
