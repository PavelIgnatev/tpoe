const { firefox } = require('playwright-extra');
const stealth = require("puppeteer-extra-plugin-stealth");

const shromiumStealth = stealth();

shromiumStealth.enabledEvasions.delete("user-agent-override");
firefox.use(shromiumStealth);

firefox.plugins.setDependencyDefaults("stealth/evasions/webgl.vendor", {
  vendor: "Gsad",
  renderer: "dsa",
});

const initialBrowser = async (headless) => {
  const browser = await firefox.launch({
    headless,
  });

  return [browser];
};

module.exports = { initialBrowser };
