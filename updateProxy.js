const { default: axios } = require("axios");

setTimeout(() => {
  console.log("смена прокси");
  axios.get(
    "https://frigate-proxy.ru/ru/change_ip/af6e30706dee6cfc01e52d7b73944d60/998524"
  );
}, 90000);
