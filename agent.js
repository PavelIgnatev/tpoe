const { initialBrowser } = require("./helpers/initialBrowser");
const { loginPoe } = require("./modules/loginPoe");
const { destroyBrowser } = require("./helpers/destroyBrowser");
const { getAnswer } = require("./modules/getAnswer");
const { insertAccount } = require("./db/account");
const express = require("express")();

let isProcessingRequest = false;
const requestQueue = [];

const setupBrowser = async () => {
  while (true) {
    let browser;

    try {
      const [context, initialBrows] = await initialBrowser(true);
      browser = initialBrows;

      global.page = await loginPoe(context);
      global.context = context;
      global.browser = browser;

      const cookies = await context.cookies();
      const userAgent = await page.evaluate(() => window.navigator.userAgent);
      const localStorage = await page.evaluate(() => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          const value = localStorage.getItem(key);
          data[key] = value;
        }
        return data;
      });

      await insertAccount({
        cookies,
        userAgent,
        localStorage,
      });

      break;
    } catch (e) {
      console.log(`Ошибка при поднятии браузера: ${e.message}`);
      await destroyBrowser(browser);
    }
  }
};

const processNextRequest = async () => {
  if (isProcessingRequest || requestQueue.length === 0) {
    return;
  }

  isProcessingRequest = true;
  const request = requestQueue.shift();
  try {
    const response = await getAnswer(global.page, request.dialogue);
    request.callback(null, response);
  } catch (error) {
    request.callback(error, null);
  } finally {
    isProcessingRequest = false;
    processNextRequest();
  }
};

express.use("/answer/", async (request, reply) => {
  if (!global.page) {
    reply.sendStatus(400);
    return;
  }

  const { dialogue = "Сочини рандомную шутку до 50 слов" } = request.query;
  const callback = (error, response) => {
    if (error) {
      reply.sendStatus(400);
    } else {
      reply.send(response);
    }
  };

  requestQueue.push({ dialogue, callback });
  processNextRequest();
});

express.listen(process.env.PORT ?? 3000, async (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("Начинаю сетап браузера");
  await setupBrowser();
  console.log(`Сервер запущен на адресе ${process.env.PORT ?? 3000}`);
});
