import { expect, Locator, Page } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly orderSummary: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.orderSummary = page.locator('//*[@id="orderSummary"]');
    this.checkoutButton = page.locator('//*[@id="checkout"]');
  }

  async verifyOrderSummary() {
    return this.trimTextContent(this.orderSummary);
  }

  async proceedToCheckout() {
    await this.checkoutButton.scrollIntoViewIfNeeded();
    await this.checkoutButton.waitFor({ state: 'visible' });
    await this.checkoutButton.click();
  }

  async verifySections(sections: string[]): Promise<boolean> {
    for (const section of sections) {
      const sectionLocator = this.page.locator(`text=${section}`).first();
      if (!(await sectionLocator.isVisible())) {
        return false;
      }
    }
    return true;
  }

  async verifyCompleteOrderButton() {
    const completeOrderButton = this.page.locator('//*[@id="btnCompleteOrder"]');
    if (!(await completeOrderButton.isVisible()) || !(await completeOrderButton.isDisabled())) {
      return false;
    }
    return true;
  }
  
  async verifyIpAddress(ipAddress: string): Promise<boolean> {
    const ipAddressLocators = this.page.locator(`//table//td[contains(text(), "${ipAddress}")]`);
    const count = await ipAddressLocators.count();
    for (let i = 0; i < count; i++) {
      const ipText = await this.trimTextContent(ipAddressLocators.nth(i));
      if (ipText === ipAddress) {
        return true;
      }
    }
    return false;
  }

  public async trimTextContent(locator: Locator): Promise<string> {
    const textContent = await locator.textContent();
    return textContent ? textContent.trim() : '';
  }
  
}
