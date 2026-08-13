import { Page } from '@playwright/test';
import { Actions } from '../utils/Actions';
import { Logger } from '../utils/Logger';
import { CartPage } from '../pages/CartPage';

/**
 * CartModule — workflows for shopping-cart interactions.
 * No assertions.
 */
export class CartModule {
    private readonly actions: Actions;
    private readonly cartPage: CartPage;
    private readonly logger = Logger.create('CartModule');

    constructor(private readonly page: Page) {
        this.actions = new Actions(page);
        this.cartPage = new CartPage(page);
    }

    async goto(url: string): Promise<void> {
        this.logger.step(1, `Navigate to cart: ${url}`);
        await this.page.goto(url);
        await this.actions.waitForVisible(this.cartPage.cartTitle());
    }

    async checkout(): Promise<void> {
        this.logger.step(2, 'Click "Checkout"');
        await this.actions.click(this.cartPage.checkoutButton());
    }

    async continueShopping(): Promise<void> {
        this.logger.step(3, 'Click "Go back Continue Shopping"');
        await this.actions.click(this.cartPage.continueShoppingButton());
    }
}
