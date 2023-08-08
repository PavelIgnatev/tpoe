const { readAccountEmail } = require("../db/account");
const { createPage } = require("../helpers/createPage");
const { extractNumbers } = require("./extructNumbers");
const fs = require("fs");

const loginPoe = async (context) => {
  const tempmailPage = await createPage(context);

  // загружаем куки
  const cookiesData = fs.readFileSync("cookies.json");
  const cookiess = JSON.parse(cookiesData);
  await tempmailPage.context().addCookies(cookiess);

  await tempmailPage.goto("https://premium.emailnator.com/email-generator");

  try {
    const label1 = await tempmailPage.waitForSelector(
      'label[for="public-domain-option"]'
    );
    const label2 = await tempmailPage.waitForSelector(
      'label[for="public-gmailplus-option"]'
    );
    const label3 = await tempmailPage.waitForSelector(
      'label[for="private-domain-option"]'
    );
    const label4 = await tempmailPage.waitForSelector(
      'label[for="private-gmailplus-option"]'
    );

    await label1.click();
    await label2.click();
    await label3.click();
    await label4.click();
  } catch {
    console.log("Скорее всего куки сломаны - обновляю");
    const emailInput = await tempmailPage.waitForSelector(
      'input[name="email"]'
    );
    await emailInput.fill("palllkaignatev@gmail.com");
    const emailPassword = await tempmailPage.waitForSelector(
      'input[name="password"]'
    );
    await emailPassword.fill("nas-pLC-W6a-akK");
    const button = await tempmailPage.waitForSelector(
      'button:has-text("Login")'
    );
    await button.click();

    await tempmailPage.waitForTimeout(3000);

    const currentCookies = await tempmailPage.context().cookies();
    fs.writeFileSync("cookies.json", JSON.stringify(currentCookies));

    await tempmailPage.waitForTimeout(3000);
  }

  let generateValue;
  let k = 0;

  while (!generateValue) {
    const generateButton = await tempmailPage.waitForSelector(
      "#generate-button"
    );

    await generateButton.click();

    await tempmailPage.waitForSelector("#generate-button[disabled]", {
      state: "hidden",
    });

    const generateInput = await tempmailPage.waitForSelector(
      "#generated-email"
    );
    const generateInputValue = await generateInput?.getProperty("value");
    const currentGenerate = await generateInputValue?.jsonValue();

    const isEnabled = await readAccountEmail(currentGenerate);

    if (!isEnabled) {
      console.log("Аккаунт с почтой", currentGenerate, "отсутствует");
      generateValue = currentGenerate;
    } else {
      console.log("Аккаунт с почтой", currentGenerate, "уже существует");
      k += 1;
      if (k > 5) {
        throw new Error("Дохуя ретраев");
      }
    }
  }

  console.log(`Текущий gmail для регистрации: ${generateValue}`);

  const poePage = await createPage(context);

  await poePage.goto("https://poe.com/login?redirect_url=%2F");
  await poePage.waitForLoadState();

  const emailAddress = await poePage.waitForSelector('input[type="email"]');
  await emailAddress.fill(generateValue, { delay: 100 });
  await poePage.keyboard.press("Enter");
  await poePage.waitForSelector('span[class^="LoadingDots"]', {
    state: "hidden",
  });

  const inputCode = await poePage.waitForSelector('input[placeholder="Code"]', {
    timeout: 12500,
  });

  await tempmailPage.bringToFront();

  await tempmailPage.waitForTimeout(3000);

  const buttonReload = await tempmailPage.waitForSelector(
    'button:has-text("Reload")'
  );

  await buttonReload.click();

  const poeVerif = await tempmailPage.waitForSelector(
    'td:has-text("Your verification code")'
  );

  await poeVerif.click();

  const text = await tempmailPage.waitForSelector("tr td");

  const content = await text.textContent();
  const code = extractNumbers(content);

  console.log(`Код сообщения от poe: ${code}`);

  await poePage.bringToFront();

  await inputCode.fill(String(code), { delay: 100 });
  await poePage.keyboard.press("Enter");
  await poePage.waitForSelector(
    'textarea[placeholder="Talk to Assistant on Poe"]',
    {
      timeout: 7500,
    }
  );

  await tempmailPage.close();

  return [poePage, generateValue];
};

module.exports = { loginPoe };
