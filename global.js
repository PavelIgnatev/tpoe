const express = require("express");
const { chromium } = require("playwright");
const { readRandomCookie } = require("./db/account");
const { getAnswer } = require("./modules/getAnswer");

let browser;
const app = express();
app.use(express.json());

async function postMessage(cookie, message) {
  let result;
  let page;

  try {
    page = await createPage(browser, cookie);

    await page.goto("https://poe.com/", { waitUntil: "domcontentloaded" });

    result = await getAnswer(page, message);
  } catch {}

  console.log(result)

  await page.close();

  return result;
}

const connectBrowser = async () => {
  browser = await chromium.launch({ headless: true });
};

const createPage = async (browser, cookie) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await context.addCookies([cookie]);

  return page;
};

app.all("/answer/*", async (req, res) => {
  const { dialogue = " " } = req.query;

  try {
    let result;
    let retryCount = 0;

    while (!Boolean(result) && retryCount < 5) {
      try {
        const cookie = await readRandomCookie();

        result = await postMessage(cookie, dialogue);
      } catch (err) {
        console.log(`Attempt ${retryCount + 1} failed: ${err}`);
      }
      retryCount++;
    }

    if (!Boolean(result)) {
      throw new Error("Retry limit");
    }

    res.status(200).send(result);
  } catch (err) {
    res.status(400).send(null);
  }
});

app.listen(80, async () => {
  await connectBrowser();

  console.log("Прокси-сервер запущен на порту 80");
});
