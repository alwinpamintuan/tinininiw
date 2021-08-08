const puppeteer =  require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('http://quotes.toscrape.com');

    await page.waitForSelector(".col-md-4");
    await page.click(".col-md-4 a");
    
    await page.waitForSelector("#username");
    await page.type("#username", "PedroTech", {delay: 100});
    
    await page.waitForSelector("#password");
    await page.type("#password", "password", {delay: 100});

    await page.click("input[type=submit");

    await browser.close();
})();