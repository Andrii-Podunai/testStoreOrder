import { Locator, Page } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly orderSummary: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.orderSummary = page.locator('.order-summary');
    this.checkoutButton = page.locator('button:has-text("Checkout")');
  }

  async verifyOrderSummary() {
    return this.trimTextContent(this.orderSummary);
  }

  async proceedToCheckout() {
    await this.checkoutButton.scrollIntoViewIfNeeded();
    await this.checkoutButton.waitFor({ state: 'visible' });
    await this.checkoutButton.click();
  }

  async verifySections(sections: string[]) {
    for (const section of sections) {
      const sectionLocator = this.page.locator(`text=${section}`).first();
      if (!(await sectionLocator.isVisible())) {
        throw new Error(`Section ${section} is not visible`);
      }
    }
  }

  async verifyCompleteOrderButton() {
    const completeOrderButton = this.page.locator('button:has-text("Complete Order")');
    if (!(await completeOrderButton.isVisible()) || !(await completeOrderButton.isDisabled())) {
      throw new Error('Complete Order button is either not visible or not disabled');
    }
  }

  public async trimTextContent(locator: Locator): Promise<string> {
    const textContent = await locator.textContent();
    return textContent ? textContent.trim() : '';
  }
}
