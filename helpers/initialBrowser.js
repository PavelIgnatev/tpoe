const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth");

const shromiumStealth = stealth();

shromiumStealth.enabledEvasions.delete("user-agent-override");
chromium.use(shromiumStealth);

chromium.plugins.setDependencyDefaults("stealth/evasions/webgl.vendor", {
  vendor: "Gsad",
  renderer: "dsa",
});

const initialBrowser = async (headless) => {
  const browser = await chromium.launch({
    headless,
  });

  return [browser];
};

module.exports = { initialBrowser };

