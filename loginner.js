const { initialBrowser } = require("./helpers/initialBrowser");
const { loginPoe } = require("./modules/loginPoe");
const { insertAccount } = require("./db/account");
const UserAgent = require("user-agents");

const setupBrowser = async () => {
  console.log("Начинаю поднимать браузер");
  let page;
  let context;

  try {
    context = await global.browser.newContext({
      userAgent: new UserAgent({ deviceCategory: "desktop" }).toString(),
      permissions: ["notifications", "microphone", "camera"],
      cursor: "default",
      // proxy: {
      //   server: "46.8.31.137:40037",
      //   username: "b069646704",
      //   password: "d96b970906",
      // },
    });

    page = await loginPoe(context);

    const cookies = await context.cookies();
    const userAgent = await page.evaluate(() => window.navigator.userAgent);

    await page.waitForTimeout(5000)

    await insertAccount({
      cookies,
      userAgent,
    });

    await page.close();
    await context.close();
  } catch (e) {
    console.log(`Ошибка при выполнении скрипта: ${e.message}`);
    if (page) {
      await page.close();
    }
    if (context) {
      await context.close();
    }
  }
};

const main = async () => {
  while (true) {
    console.log("Начинаю поднимать браузер");
    const [initBrowser] = await initialBrowser(false);
    global.browser = initBrowser;

    const promises = [];

    for (let i = 0; i < 5; i++) {
      promises.push(setupBrowser());
    }

    await Promise.all(promises);
  }
};

main();
