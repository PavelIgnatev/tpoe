const { initialBrowser } = require("./helpers/initialBrowser");
const { loginPoe } = require("./modules/loginPoe");
const { insertAccount } = require("./db/account");
const UserAgent = require("user-agents");

let errorCount;

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
    errorCount += 1;
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

    if (errorCount >= 15) {
      console.log("Убиваю скрипт");
      process.exit();
    }
  }
};

const main = async () => {
  const [initBrowser] = await initialBrowser(true);
  global.browser = initBrowser;

  while (true) {
    console.log("Начинаю поднимать страницу");

    const promises = [];

    for (let i = 0; i < 3; i++) {
      promises.push(setupBrowser());
    }

    await Promise.allSettled(promises);
  }
};

main();
