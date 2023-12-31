const getResponse = async (page, messages) => {
  for (const message of messages) {
    await page.waitForTimeout(2500);
    const fakeExit = await page.$('button[aria-label="close modal"]');

    if (fakeExit) {
      await fakeExit.click();
    }
    const textarea = await page.waitForSelector(
      'textarea[placeholder="Talk to ChatGPT on Poe"]',
      { state: "attached" }
    );
    await textarea.fill(`            ${message.slice(-3750)}`);
    await page.keyboard.press("Enter");

    await page.waitForSelector('button:has-text("Tell me more")', {
      timeout: 60000,
    });

    if (messages.length > 1) {
      await page.waitForTimeout(5000);
    }
  }

  await page.waitForTimeout(10000);

  const elements = await page.$$(
    'div[class^="ChatMessagesView_messagePair"] div[class^="Markdown_markdownContainer"]'
  );

  const response = await elements[elements.length - 1].textContent();

  try {
    const clearHistoryButton = await page.waitForSelector(
      'path[d="M19.54 3.66c-.13-.49-.45-.9-.89-1.16-.44-.26-.95-.32-1.45-.19-.49.13-.9.45-1.16.89l-3.48 6.03L10.42 8a.738.738 0 0 0-1.02.27L8.28 10.2c-.1.17-.13.38-.08.57.05.19.18.36.35.46l.31.18c-2.21 2.1-6.06 3.64-6.1 3.66-.26.1-.45.35-.47.63-.03.28.11.55.35.7l2.01 1.25c.19.12.42.15.63.08.03-.01.48-.16 1.07-.42-.1.15-.18.24-.18.24-.15.16-.22.39-.2.61.03.22.16.42.35.54l4.99 3.1c.12.08.26.11.4.11.16 0 .32-.05.45-.15.11-.09 2.63-2.04 3.74-6.29l.31.18a.746.746 0 0 0 1.02-.27l1.12-1.93c.1-.17.13-.38.08-.57a.77.77 0 0 0-.35-.46l-2.21-1.27 3.48-6.03c.25-.45.32-.97.19-1.46Zm-7.91 16.56-3.84-2.39c.28-.49.59-1.2.65-2.07a.758.758 0 0 0-.38-.71.747.747 0 0 0-.8.04c-.74.52-1.65.91-2.13 1.09l-.49-.3c1.51-.71 3.96-2.04 5.56-3.7l4.33 2.5c-.69 3.03-2.2 4.84-2.9 5.54Zm4.68-6.26L9.96 10.3l.36-.63 4.15 2.39 2.2 1.27-.36.63Zm1.74-9.6-3.48 6.03-.7-.4 3.48-6.03c.11-.19.36-.26.55-.15a.405.405 0 0 1 .15.55ZM16.75 21.14a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM19 17.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM20.25 19.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"]',
      { timeout: 1500, state: "attached" }
    );

    await clearHistoryButton.click({ timeout: 1500, state: "attached" });
  } catch {}

  return response;
};

const getAnswer = async (page, message) => {
  while (true) {
    try {
      await page.waitForLoadState("networkidle");

      page.on("console", (message) => {
        if (message.type() === "error") {
          return "";
        }
      });
      return await getResponse(page, message);
    } catch (e) {
      await page.reload();
      throw new Error(e.message);
    }
  }
};

module.exports = { getAnswer };
