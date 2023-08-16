const { initialBrowser } = require("./helpers/initialBrowser");
const { loginPoe } = require("./modules/loginPoe");
const { insertAccount } = require("./db/account");
const UserAgent = require("user-agents");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const setupBrowser = async () => {
  let page;
  let context;

  try {
    context = await global.browser.newContext({
      userAgent: new UserAgent({ deviceCategory: "desktop" }).toString(),
      cursor: "default",
      proxy: {
        server: "46.8.31.137:40825",
        username: "37c27c4c3f",
        password: "c4fca3752c",
      },
    });

    const [loginPage, email] = await loginPoe(context);
    page = loginPage;

    const cookies = await context.cookies();
    const userAgent = await page.evaluate(() => window.navigator.userAgent);

    await insertAccount({
      cookies,
      userAgent,
      email,
    });

    console.log(`Аккаунт с почтой ${email} успешно зарегестрирован`);

    await page.close();
    await context.close();
  } catch (e) {
    if (e.message.includes("net::ERR_PROXY_CONNECTION_FAILED")) {
      console.log(`Ошибка при выполнении скрипта: смена прокси`);
    } else {
      console.log(`Ошибка при выполнении скрипта: ${e.message}`);
    }
    if (page) {
      await page.close();
    }
    if (context) {
      await context.close();
    }

    if (e.message.includes("browser.newContext")) {
      try {
        if (global.browser) {
          await global.browser.close();
        }
      } catch (e) {
        console.log(e.message);
      }

      const [initBrowser] = await initialBrowser(true);
      global.browser = initBrowser;
    }
  }
};

const main = async () => {
  try {
    const [initBrowser] = await initialBrowser(true);
    global.browser = initBrowser;

    console.log("Начинаю поднимать страницу");

    const promises = [];

    for (let i = 0; i < 3; i++) {
      promises.push(setupBrowser());
    }

    await Promise.allSettled(promises);
    await exec("pm2 restart 2");
  } catch {
    await exec("pm2 restart 2");
  }
};

main();
