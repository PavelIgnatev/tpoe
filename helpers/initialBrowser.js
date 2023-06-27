const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth");
const UserAgent = require("user-agents");

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

  const context = await browser.newContext({
    userAgent: new UserAgent({ deviceCategory: "desktop" }).toString(),
    permissions: ["notifications", "microphone", "camera"],
    cursor: "default",
    proxy: {
      server: "95.31.211.120:40464",
      username: "54fc976344",
      password: "56ddc55334",
    },
  });

  return [context, browser];
};

module.exports = { initialBrowser };
