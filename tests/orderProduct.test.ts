import { test, expect } from '../fixtures/fixtures';
import { summeryPrice } from '../helper/priceHelper';

test.describe('cPanel Store Order Flow', () => {
  test('should order a product and proceed to checkout', async ({ homePage, productPage, checkoutPage, page }) => {
    await homePage.navigate();

    const orderName = await homePage.getName();
    const orderPrice = await homePage.getPrice() ?? 0;

    await homePage.orderNow(0);
    const ipAddress = await productPage.enterIpAddress('2.2.2.2');

    const initialSummaryCount = await productPage.getInitialSummaryCount();
    await productPage.selectAddon();

    const addonName = await productPage.getAddonName();
    const cleanAddonPrice = await productPage.getAddonPrice();
    const sum = summeryPrice(orderPrice, cleanAddonPrice);

    await page.locator('.summary-totals .clearfix').nth(1).waitFor({ state: 'visible' });
    const updatedSummaryCount = await productPage.getUpdatedSummaryCount();
    expect(updatedSummaryCount).toBeGreaterThan(initialSummaryCount);

    await productPage.continueToReview();
    const currentPrice = await productPage.getCurrentPrice() ?? 0;
    const currentName = await productPage.trimTextContent(page.locator('//*[@class="item-title"]').first());
    expect(currentPrice).toEqual(parseFloat(sum.toFixed(2)));
    expect(currentName).toContain(orderName);

    const currentAddonName = await productPage.trimTextContent(page.locator('//*[@class="item-title"]').nth(1));
    expect(currentAddonName).toContain(addonName);

    await productPage.continueToCheckout();

    // Verify the license name
    const licenseName = await productPage.trimTextContent(page.locator('//table//td[contains(text(), "cPanel Solo® Cloud (1 Account)")]'));
    expect(licenseName).toBe(orderName);

    const licenseAddonName = await productPage.trimTextContent(page.locator('//table//td[contains(text(), "Monthly CloudLinux")]'));
    expect(licenseAddonName).toBe(addonName);

    // Verify the IP address
    const displayedIpAddress = await productPage.trimTextContent(page.locator(`//table//td[contains(text(), "${ipAddress}")]`).first());
    expect(displayedIpAddress).toBe(ipAddress);

    const displayedPrice = await productPage.getCheckoutProductPrice();
    expect(displayedPrice).toEqual(parseFloat(sum.toFixed(2)));

    const displayedAddonPrice = await productPage.getCheckoutAddonPrice();
    expect(displayedAddonPrice).toEqual(cleanAddonPrice);

    // Verify that the 'Personal Information', 'Billing Address', 'Account Security', 'Terms & Conditions' and 'Payment Details' sections are visible
    const sections = [
      'Personal Information',
      'Billing Address',
      'Account Security',
      'Terms & Conditions',
      'Payment Details'
    ];

    await checkoutPage.verifySections(sections);

    await checkoutPage.verifyCompleteOrderButton();
  });
});
