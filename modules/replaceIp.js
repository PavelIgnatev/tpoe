const axios = require("axios");

const replaceIp = async (url) => {
  try {
    const result = await axios.get(url);

    console.log(result.data);

    await new Promise((res) => setTimeout(res, 10000));
  } catch {
    throw new Error("Ошибка при смене прокси");
  }
};

module.exports = { replaceIp };
