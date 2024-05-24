import { expect, Locator, Page } from '@playwright/test';
import { extractPrice } from '../helper/priceHelper';

export class ProductPage {
  readonly page: Page;
  readonly ipAddressInput: Locator;
  readonly addonCheckbox: Locator;
  readonly addonPrice: Locator;
  readonly summaryCount: Locator;
  readonly currentPrice: Locator;
  readonly continueToReviewButton: Locator;
  readonly continueToCheckoutButton: Locator;
  readonly itemTitleLocator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.ipAddressInput = page.locator('//*[@id="customfield11"]');
    this.addonCheckbox = page.locator('//*[@id="productAddonsContainer"]//input[@name="addons[147]"]');
    this.addonPrice = page.locator('//input[@name="addons[147]"]/following::div[@class="panel-price"][1]');
    this.summaryCount = page.locator('.summary-totals .clearfix');
    this.currentPrice = page.locator('//*[@class="cycle"]');
    this.continueToReviewButton = page.locator('//*[@id="btnCompleteProductConfig"]');
    this.continueToCheckoutButton = page.locator('//*[@id="checkout"]');
    this.itemTitleLocator = page.locator('//*[@class="item-title"]');
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
    const addonNameLocator = this.page.locator(`//*[@id="productAddonsContainer"]//input[@name="addons[147]"]/../../../label`);
    return this.trimTextContent(addonNameLocator);
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

  private getPriceLocator(price: string): Locator {
    return this.page.locator(`//table//td[contains(text(), "$${price} USD")]`);
  }

  async getCheckoutPrice(price: string): Promise<number | null> {
    const priceLocator = this.getPriceLocator(price);
    const displayedPrice = await this.trimTextContent(priceLocator);
    return displayedPrice ? extractPrice(displayedPrice) : null;
  }

  async continueToReview() {
    await this.continueToReviewButton.scrollIntoViewIfNeeded();
    await this.continueToReviewButton.waitFor({ state: 'visible' });
    await this.waitForEnabled(this.continueToReviewButton);
    await this.continueToReviewButton.click();
  }

  async continueToCheckout() {
    await this.continueToCheckoutButton.scrollIntoViewIfNeeded();
    await this.continueToCheckoutButton.waitFor({ state: 'visible' });
    await this.waitForEnabled(this.continueToCheckoutButton);
    await this.continueToCheckoutButton.click();
  }

  async waitForSummaryVisible() {
    await this.summaryCount.nth(1).waitFor({ state: 'visible' });
  }

  async getItemTitleText(index: number): Promise<string> {
    const title = await this.itemTitleLocator.nth(index).textContent();
    return title ? title.trim() : '';
  }

  async getLicenseName(license: string): Promise<string> {
    const licenseLocator = this.page.locator(`//table//td[contains(text(), "${license}")]`);
    return this.trimTextContent(licenseLocator);
  }

  public async trimTextContent(locator: Locator): Promise<string> {
    const textContent = await locator.textContent();
    return textContent ? textContent.trim() : '';
  }
  
  public async getPriceByText(price: number): Promise<number | null> {
    const priceLocator = this.page.locator(`//table//td[contains(text(), "$${price} USD")]`);
    const priceText = await this.trimTextContent(priceLocator);
    return priceText ? extractPrice(priceText) : null;
  }

  public async getPriceFromClassByIndex(index: number): Promise<number | null> {
    const priceLocator = this.page.locator('.col-sm-4.item-price span').nth(index);
    const priceText = await this.trimTextContent(priceLocator);
    return priceText ? extractPrice(priceText) : null;
  }

  private async waitForEnabled(locator: Locator, timeout: number = 30000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await locator.isEnabled()) {
        return;
      }
      await this.page.waitForTimeout(100);
    }
    throw new Error('Locator did not become enabled within timeout');
  }
}
