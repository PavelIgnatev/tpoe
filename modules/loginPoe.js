const { createPage } = require("../helpers/createPage");
const { extractNumbers } = require("./extructNumbers");

const loginPoe = async (context) => {
  const poePage = await createPage(context);
  let email;

  await poePage.goto("https://poe.com/login?redirect_url=%2F");

  const tempmailPage = await createPage(context);

  await tempmailPage.goto("https://tempmail.plus/ru/#");

  const buttonDomain = await tempmailPage.waitForSelector("#domain");
  await buttonDomain.click();
  const buttonAnyPink = await tempmailPage.waitForSelector(
    'button:has-text("any.pink")'
  );
  await buttonAnyPink.click();

  const inputName = await tempmailPage?.waitForSelector("#pre_button");

  const inputValue = await inputName?.getProperty("value");
  const emailFirst = await inputValue?.jsonValue();
  email = `${emailFirst}@any.pink`;

  await poePage.bringToFront();

  const emailAddress = await poePage.waitForSelector('input[type="email"]');
  await emailAddress.fill(email, { delay: 100 });
  await poePage.keyboard.press("Enter");
  const inputCode = await poePage.waitForSelector('input[placeholder="Code"]', {
    timeout: 7500,
  });

  await tempmailPage.bringToFront();

  const mail = await tempmailPage.waitForSelector(
    'span:has-text("<noreply@poe.com>")',
    { timeout: 60000 }
  );

  await mail.click();

  const text = await tempmailPage.waitForSelector("tr td");

  const content = await text.textContent();
  const code = extractNumbers(content);

  await poePage.bringToFront();

  await inputCode.fill(String(code), { delay: 100 });
  await poePage.keyboard.press("Enter");
  await poePage.waitForSelector('textarea[placeholder="Talk to Sage on Poe"]', {
    timeout: 7500,
  });

  await tempmailPage.close();

  return poePage;
};

module.exports = { loginPoe };
