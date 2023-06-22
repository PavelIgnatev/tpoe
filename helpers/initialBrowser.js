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
      server: "95.215.71.191:40018",
      username: "647d6529f5",
      password: "96bd465f6b",
    },
  });

  return [context, browser];
};

module.exports = { initialBrowser };
