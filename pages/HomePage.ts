import { Locator, Page } from '@playwright/test';
import { extractPrice } from '../helper/priceHelper';

export class HomePage {
  readonly page: Page;
  readonly productName: Locator;
  readonly productPrice: Locator;
  readonly orderButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productName = page.locator('//*[@id="product3-name"]');
    this.productPrice = page.locator('//*[@id="product3-price"]//span[@class="price"]');
    this.orderButton = page.locator('//*[@id="product3-order-button"]');
  }

  async navigate() {
    await this.page.goto('https://store.cpanel.net/store/cpanel-licenses');
  }

  async getName(): Promise<string> {
    const orderName = await this.productName.textContent();
    return orderName ? orderName.trim() : '';
  }

  async getPrice(): Promise<number | null> {
    const priceString = await this.productPrice.textContent();
    return priceString ? extractPrice(priceString) : null;
  }

  async orderNow(productIndex: number) {
    await this.orderButton.nth(productIndex).click();
  }
}
