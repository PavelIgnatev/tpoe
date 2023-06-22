const { initialBrowser } = require("./helpers/initialBrowser");
const { loginPoe } = require("./modules/loginPoe");
const { destroyBrowser } = require("./helpers/destroyBrowser");
const { insertAccount } = require("./db/account");
const { default: axios } = require("axios");

const setupBrowser = async () => {
  while (true) {
    let browser;
    console.log("Начинаю поднимать браузер");

    try {
      const [context, initialBrows] = await initialBrowser(true);
      browser = initialBrows;

      global.page = await loginPoe(context);
      global.context = context;
      global.browser = browser;

      const cookies = await context.cookies();
      const userAgent = await page.evaluate(() => window.navigator.userAgent);

      await insertAccount({
        cookies,
        userAgent,
      });
      console.log("Браузер поднят");
      await destroyBrowser(browser);
    } catch (e) {
      console.log(`Ошибка при поднятии браузера: ${e.message}`);
      await destroyBrowser(browser);
    }
  }
};

const main = async () => {
  setTimeout(() => {
    console.log("смена прокси");
    axios.get(
      "https://frigate-proxy.ru/ru/change_ip/af6e30706dee6cfc01e52d7b73944d60/998524"
    );
  }, 60000);
  await setupBrowser();
};

main();
