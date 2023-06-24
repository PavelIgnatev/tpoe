const { default: axios } = require("axios");

setTimeout(() => {
  console.log("смена прокси");
  axios.get(
    "https://frigate-proxy.ru/ru/change_ip/82d68ac1341d35f48d503c735d9a6149/1014889"
  );
}, 90000);
