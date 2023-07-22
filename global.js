const express = require("express");
const { chromium } = require("playwright");
const { readRandomCookie } = require("./db/account");
const { getAnswer } = require("./modules/getAnswer");
const { initialBrowser } = require("./helpers/initialBrowser");

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
  } catch (e) {
    console.log(e);
  }

  console.log(result);

  await page.close();

  return result;
}

const connectBrowser = async () => {
  if (browser) {
    try {
      await browser.close();
    } catch {
      console.log("Ошибка при закрытии браузера");
    }
  }

  const [initBrowser] = await initialBrowser(true);
  browser = initBrowser;
};

const createPage = async (browser, cookie) => {
  const context = await browser.newContext({
    proxy: {
      server: "45.157.36.134:8000",
      username: "tbc7GV",
      password: "tnt2QK",
    },
  });

  const page = await context.newPage();

  await context.addCookies([cookie]);

  return page;
};

app.all("/answer/*", async (req, res) => {
  const { dialogue = ["Напиши привет"] } = req.body;

  try {
    let result;
    let retryCount = 0;

    while (!Boolean(result) && retryCount < 5) {
      try {
        const cookie = await readRandomCookie();

        result = await postMessage(cookie, dialogue);

        if (!result) {
          throw new Error("Пустой ответ");
        }
      } catch (err) {
        console.log(err.message);
        if (err.message !== "Пустой ответ") {
          console.log("Делаю реконнект браузера");
          await connectBrowser();
        }
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
