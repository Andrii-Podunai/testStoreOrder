import { test, expect } from '../fixtures/fixtures';
import { summaryPrice } from '../helper/priceHelper';

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
    const addonPrice = await productPage.getAddonPrice();
    const sum = summaryPrice(orderPrice, addonPrice);

    await productPage.waitForSummaryVisible();
    const updatedSummaryCount = await productPage.getUpdatedSummaryCount();
    expect(updatedSummaryCount).toBeGreaterThan(initialSummaryCount);

    await productPage.continueToReview();
    const currentPrice = await productPage.getCurrentPrice() ?? 0;
    const currentName = await productPage.getItemTitleText(0);
    expect(currentPrice).toEqual(parseFloat(sum.toFixed(2)));
    expect(currentName).toContain(orderName);

    const currentAddonName = await productPage.getItemTitleText(1);
    expect(currentAddonName).toContain(addonName);

    const duTodayProductPrice = await productPage.getPriceFromClassByIndex(0)?? 0;
    const duTodayAddonPrice = await productPage.getPriceFromClassByIndex(2) ?? 0;

    await productPage.continueToCheckout();

    const licenseName = await productPage.getLicenseName('cPanel Solo® Cloud (1 Account)');
    expect(licenseName).toBe(orderName);

    const licenseAddonName = await productPage.getLicenseName('Monthly CloudLinux');
    expect(licenseAddonName).toBe(addonName);

    const isIpAddressCorrect = await checkoutPage.verifyIpAddress(ipAddress);
    expect(isIpAddressCorrect).toBe(true);

    const displayedPrice = await productPage.getCheckoutPrice('43.49');
    expect(displayedPrice).toEqual(parseFloat(sum.toFixed(2)));

    const displayedAddonPrice = await productPage.getCheckoutPrice('26.00');
    expect(displayedAddonPrice).toEqual(addonPrice);

    const currentDuTodayProductPrice = await productPage.getPriceByText(duTodayProductPrice);
    const currentDuTodayAddonPrice = await productPage.getPriceByText(duTodayAddonPrice);
    
    expect(currentDuTodayProductPrice).toBe(duTodayProductPrice);
    expect(currentDuTodayAddonPrice).toBe(duTodayAddonPrice);

    const sections = [
      'Personal Information',
      'Billing Address',
      'Account Security',
      'Terms & Conditions',
      'Payment Details'
    ];

    const areSectionsVisible = await checkoutPage.verifySections(sections);
    expect(areSectionsVisible).toBe(true);
    
    const areButtonVisible = await checkoutPage.verifyCompleteOrderButton();
    expect(areButtonVisible).toBe(true);

  });
});
