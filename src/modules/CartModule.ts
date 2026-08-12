import { Page } from '@playwright/test';
import { Actions } from '../utils/Actions';
import { CartPage } from '../pages/CartPage';
import { InventoryPage } from '../pages/InventoryPage';
import { InventoryModule } from './InventoryModule';
import { Logger } from '../utils/Logger';

/**
 * CartModule — workflows for cart and checkout journeys.
 * No assertions.
 */
export class CartModule {
    private readonly actions: Actions;
    private readonly cartPage: CartPage;
    private readonly inventoryPage: InventoryPage;
    private readonly inventoryModule: InventoryModule;
    private readonly logger = Logger.create('CartModule');

    constructor(private readonly page: Page) {
        this.actions = new Actions(page);
        this.cartPage = new CartPage(page);
        this.inventoryPage = new InventoryPage(page);
        this.inventoryModule = new InventoryModule(page);
    }

    async establishCartPrecondition(productName: string): Promise<void> {
        this.logger.step(1, `Add "${productName}" to the cart through the inventory flow`);
        await this.inventoryModule.navigateToProductDetailPage(productName);
        await this.inventoryModule.addProductToCartFromDetail();
        await this.inventoryModule.goBackToProducts();

        this.logger.step(2, 'Open the shopping cart');
        await this.actions.click(this.cartPage.shoppingCartLink());
        await this.actions.waitForVisible(this.cartPage.cartCheckoutButton());
    }

    async checkout(): Promise<void> {
        this.logger.step(3, 'Click Checkout');
        await this.actions.click(this.cartPage.cartCheckoutButton());
        await this.actions.waitForVisible(this.cartPage.checkoutInformationHeading());
    }

    async submitEmptyCheckout(): Promise<void> {
        this.logger.step(4, 'Submit checkout information without entering customer details');
        await this.actions.click(this.cartPage.checkoutContinueButton());
        await this.actions.waitForVisible(this.cartPage.checkoutErrorMessage());
    }

    async enterCheckoutInformation(
        firstName: string,
        lastName: string,
        postalCode: string,
    ): Promise<void> {
        this.logger.step(5, 'Enter checkout information');
        await this.actions.fill(this.cartPage.firstNameInput(), firstName);
        await this.actions.fill(this.cartPage.lastNameInput(), lastName);
        await this.actions.fill(this.cartPage.postalCodeInput(), postalCode);
    }

    async continueToOverview(): Promise<void> {
        this.logger.step(6, 'Continue to checkout overview');
        await this.actions.click(this.cartPage.checkoutContinueButton());
        await this.actions.waitForVisible(this.cartPage.checkoutOverviewHeading());
    }

    async finishOrder(): Promise<void> {
        this.logger.step(7, 'Finish the order');
        await this.actions.click(this.cartPage.finishButton());
        await this.actions.waitForVisible(this.cartPage.checkoutCompleteHeading());
    }

    async continueShopping(): Promise<void> {
        this.logger.step(8, 'Abort the cart action and continue shopping');
        await this.actions.click(this.cartPage.continueShoppingButton());
        await this.actions.waitForVisible(this.inventoryPage.productsTitle());
    }
}
