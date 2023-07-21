const { webkit } = require('playwright-extra');
const stealth = require("puppeteer-extra-plugin-stealth");

const shromiumStealth = stealth();

shromiumStealth.enabledEvasions.delete("user-agent-override");
webkit.use(shromiumStealth);

webkit.plugins.setDependencyDefaults("stealth/evasions/webgl.vendor", {
  vendor: "Gsad",
  renderer: "dsa",
});

const initialBrowser = async (headless) => {
  const browser = await webkit.launch({
    headless,
  });

  return [browser];
};

module.exports = { initialBrowser };
