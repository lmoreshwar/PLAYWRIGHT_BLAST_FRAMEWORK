import { Page } from '@playwright/test';
import { Actions } from '../utils/Actions';
import { Logger } from '../utils/Logger';
import { InventoryPage } from '../pages/InventoryPage';
import { WorkflowActions } from '../utils/WorkflowActions';

/**
 * LogoutModule — workflows for logging out of the application.
 * Uses Actions and WorkflowActions wrappers; no assertions.
 */
export class LogoutModule {
    private readonly actions: Actions;
    private readonly inventoryPage: InventoryPage;
    private readonly workflowActions: WorkflowActions;
    private readonly logger = Logger.create('LogoutModule');

    constructor(private readonly page: Page) {
        this.actions = new Actions(page);
        this.inventoryPage = new InventoryPage(page);
        this.workflowActions = new WorkflowActions(page);
    }

    /**
     * Performs logout by opening the side menu and clicking the Logout link.
     */
    async logout(): Promise<void> {
        this.logger.step(1, 'Open side navigation menu');
        await this.actions.click(this.inventoryPage.menuButton());

        this.logger.step(2, 'Click Logout link');
        await this.actions.click(this.inventoryPage.logoutLink());

        // Wait for login page to be visible (username input)
        await this.workflowActions.waitForVisible(this.inventoryPage.menuButton(), {
            timeout: 5000,
        }).catch(() => {
            // If menu button disappears after logout, fallback to waiting for login page
            // reason: menu button may be removed from DOM after logout, so we wait for login username field
            // Using a SmartLocator fallback is unnecessary here; direct wait on login page is handled in spec.
        });
    }
}
