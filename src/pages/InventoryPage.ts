import { type Locator, type Page } from '@playwright/test';

export class InventoryPage {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    productsTitle = (): Locator => this.page.getByText('Products', { exact: true });

    sortControl = (): Locator => this.page.getByRole('combobox');

    productLinks = (): Locator => this.page.locator('.inventory_item_name');

    productItemByName = (productName: string): Locator =>
        this.page.getByRole('link', { name: productName, exact: true });

    addToCartButton = (): Locator => this.page.getByRole('button', { name: 'Add to cart', exact: true });

    addToCartButtonOnList = (productName: string): Locator =>
        this.page
            .locator('.inventory_item')
            .filter({ has: this.page.getByRole('link', { name: productName, exact: true }) })
            .getByRole('button', { name: 'Add to cart', exact: true });

    removeFromCartButton = (): Locator => this.page.getByRole('button', { name: 'Remove', exact: true });

    shoppingCartLink = (): Locator => this.page.getByRole('link', { name: /shopping cart/i });

    shoppingCartBadge = (): Locator => this.page.locator('.shopping_cart_badge');

    productDetailName = (): Locator => this.page.getByText(/Sauce Labs|Test\.allTheThings/).first();

    productDetailDescription = (): Locator => this.page.locator('.inventory_details_desc');

    productDetailPrice = (): Locator => this.page.locator('.inventory_details_price');

    backToProductsButton = (): Locator => this.page.getByRole('button', { name: 'Back to products', exact: true });
}
