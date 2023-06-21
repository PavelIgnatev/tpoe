const destroyBrowser = async (browser) => {
  if (!browser) {
    throw new Error("Произошла ошибка, проверьте аргументы функции");
  }

  await browser.close();
};

module.exports = { destroyBrowser };
