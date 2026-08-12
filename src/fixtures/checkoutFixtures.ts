import { test as base } from './index';
import { CheckoutModule } from '../modules/CheckoutModule';
import { CheckoutPage } from '../pages/CheckoutPage';

type CheckoutFixtures = {
    checkoutPage: CheckoutPage;
    checkoutModule: CheckoutModule;
};

export const test = base.extend<CheckoutFixtures>({
    checkoutPage: async ({ page }, use) => {
        await use(new CheckoutPage(page));
    },
    checkoutModule: async ({ page }, use) => {
        await use(new CheckoutModule(page));
    },
});

export { expect } from '@playwright/test';
