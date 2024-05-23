import { expect, Locator, Page } from '@playwright/test';
import { extractPrice } from '../helper/priceHelper';

export class ProductPage {
  readonly page: Page;
  readonly ipAddressInput: Locator;
  readonly addonCheckbox: Locator;
  readonly addonName: Locator;
  readonly addonPrice: Locator;
  readonly summaryCount: Locator;
  readonly currentPrice: Locator;
  readonly checkoutProductPrice: Locator;
  readonly checkoutAddonPrice: Locator;
  readonly continueToReviewButton: Locator;
  readonly continueToCheckoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.ipAddressInput = page.locator('//*[@id="customfield11"]');
    this.addonCheckbox = page.locator('//*[@id="productAddonsContainer"]//input[@name="addons[147]"]');
    this.addonName = page.locator('//*[@id="productAddonsContainer"]//input[@name="addons[147]"]/../../../label');
    this.addonPrice = page.locator('//*[@id="productAddonsContainer"]//input[@name="addons[147]"]/../../../../div[@class="panel-price"]');
    this.summaryCount = page.locator('.summary-totals .clearfix');
    this.currentPrice = page.locator('//*[@class="cycle"]');
    this.checkoutProductPrice = page.locator('//table//td[contains(text(), "$43.49 USD")]');
    this.checkoutAddonPrice = page.locator('//table//td[contains(text(), "$26.00 USD")]');
    this.continueToReviewButton = page.locator('//*[@id="btnCompleteProductConfig"]');
    this.continueToCheckoutButton = page.locator('//*[@id="checkout"]');
  }

  async enterIpAddress(ip: string) {
    await this.ipAddressInput.fill(ip);
    return ip;
  }

  async selectAddon() {
    await this.addonCheckbox.scrollIntoViewIfNeeded();
    await this.addonCheckbox.focus();
    await this.addonCheckbox.waitFor({ state: 'visible' });
    await this.addonCheckbox.check({ force: true });
  }

  async getAddonName(): Promise<string> {
    return this.trimTextContent(this.addonName);
  }

  async getAddonPrice(): Promise<number> {
    const addonPrice = await this.trimTextContent(this.addonPrice);
    return extractPrice(addonPrice) ?? 0;
  }

  async getInitialSummaryCount(): Promise<number> {
    return await this.summaryCount.count();
  }

  async getUpdatedSummaryCount(): Promise<number> {
    return await this.summaryCount.count();
  }

  async getCurrentPrice(): Promise<number | null> {
    const currentPrice = await this.trimTextContent(this.currentPrice.first());
    return currentPrice ? extractPrice(currentPrice) : null;
  }

  async getCheckoutProductPrice(): Promise<number | null> {
    const displayedPrice = await this.trimTextContent(this.checkoutProductPrice);
    return displayedPrice ? extractPrice(displayedPrice) : null;
  }

  async getCheckoutAddonPrice(): Promise<number | null> {
    const displayedPrice = await this.trimTextContent(this.checkoutAddonPrice);
    return displayedPrice ? extractPrice(displayedPrice) : null;
  }

  async continueToReview() {
    await this.continueToReviewButton.scrollIntoViewIfNeeded();
    await this.continueToReviewButton.waitFor({ state: 'visible' });
    await this.continueToReviewButton.click();
  }

  async continueToCheckout() {
    await this.continueToCheckoutButton.scrollIntoViewIfNeeded();
    await this.continueToCheckoutButton.waitFor({ state: 'visible' });
    await this.continueToCheckoutButton.click();
  }

  public async trimTextContent(locator: Locator): Promise<string> {
    const textContent = await locator.textContent();
    return textContent ? textContent.trim() : '';
  }
}
