import { Page } from '@playwright/test';
import { Actions } from '../utils/Actions';
import { Logger } from '../utils/Logger';
import { HeaderPage } from '../pages/HeaderPage';
import { WaitHelper } from '../utils/WaitHelper';
import { WorkflowActions } from '../utils/WorkflowActions';

/**
 * LogoutModule — workflow to terminate the user session.
 * Uses HeaderPage locators via Actions and WaitHelper. No assertions.
 */
export class LogoutModule {
    private readonly actions: Actions;
    private readonly headerPage: HeaderPage;
    private readonly waitHelper: WaitHelper;
    private readonly workflowActions: WorkflowActions;
    private readonly logger = Logger.create('LogoutModule');

    constructor(private readonly page: Page) {
        this.actions = new Actions(page);
        this.headerPage = new HeaderPage(page);
        this.waitHelper = new WaitHelper(page);
        this.workflowActions = new WorkflowActions(page);
    }

    /**
     * Performs logout by opening the side menu and clicking the logout link.
     * Waits until the login page username input becomes visible, indicating a new session.
     */
    async logout(): Promise<void> {
        this.logger.step(1, 'Open side menu');
        await this.actions.click(this.headerPage.menuButton());

        this.logger.step(2, 'Click logout link');
        await this.actions.click(this.headerPage.logoutLink());

        this.logger.step(3, 'Wait for login page to be visible');
        // Assuming the login page username input is the first visible element after logout
        await this.waitHelper.waitForVisible(this.page.getByLabel('Username'));
    }
}
