const express = require("express");
const { readRandomCookie, deleteAccountById } = require("./db/account");
const { getAnswer } = require("./modules/getAnswer");
const { initialBrowser } = require("./helpers/initialBrowser");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

let browser;
const app = express();
app.use(express.json());

async function postMessage(cookie, message) {
  let result;
  let page;

  try {
    page = await createPage(browser, cookie);

    await page.goto("https://poe.com/ChatGPT", {
      waitUntil: "domcontentloaded",
    });

    result = await getAnswer(page, message);
  } catch (e) {
    console.log(`Во время исполнения запроса произошлаа ошибка: ${e.message}`);
  }

  console.log(`Ответ: ${result}`);

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
    // proxy6 eng
    proxy: {
      server: "81.161.63.6:8000",
      username: "BjTuKg",
      password: "n6yrNn",
    },
  });

  const page = await context.newPage();

  await context.addCookies([cookie]);

  return page;
};

app.all("/answer/*", async (req, res) => {
  const { dialogue = ["Напиши привет"] } = req.body;
  console.log("Получил запрос, начинаю исполнять");

  try {
    let result;
    let retryCount = 0;

    while (!Boolean(result) && retryCount < 5) {
      try {
        const { id, cookie } = await readRandomCookie();
        console.log(id, cookie);
        try {
          result = await postMessage(cookie, dialogue);

          if (!result) {
            await deleteAccountById(id);
            throw new Error("Пустой ответ");
          }
        } catch (err) {
          await connectBrowser();
          console.log(`Attempt ${retryCount + 1} failed: ${err.message}`);
        }
      } catch (e) {
        console.log(`Глобальная ошибка при получении куки: ${e.message}`);
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

  setTimeout(async () => {
    await exec("pm2 restart global");
  }, 450000);

  console.log("Прокси-сервер запущен на порту 80");
});
