const { readCookies, updateAccountByCookie } = require("./db/account");
const { chromium } = require("playwright");
const { initialBrowser } = require("./helpers/initialBrowser");

const createPage = async (browser, cookie) => {
  const context = await browser.newContext({});

  const page = await context.newPage();

  await context.addCookies([cookie]);

  return page;
};

async function checkAccount(browser, cookie) {
  let page;

  try {
    page = await createPage(browser, cookie);

    await page.goto("https://poe.com/", { waitUntil: "domcontentloaded" });

    try {
      await page.waitForSelector(
        ':has-text("reached the daily free message limit."), :has-text("es left today across standard bots.")',
        { timeout: 1000 }
      );
      // await updateAccountByCookie(cookie.value, { working: false });
      console.log("акк не в порядке");
    } catch (у) {
      // await updateAccountByCookie(cookie.value, { working: true });

      console.log("акк в порядке");
    }
  } catch (e) {
    console.log(e);
    // await updateAccountByCookie(cookie.value, { working: false });
  }

  await page.close();
}

let i = 0;

const checker = async () => {
  const result = (await readCookies()).slice(3500);
  const [browser] = await initialBrowser(false);

  for (const cookie of result.reverse()) {
    console.log(i, result.length);
    await checkAccount(browser, cookie);
    i += 1;
  }
};

checker();
