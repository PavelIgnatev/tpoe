const axios = require("axios");

async function makeRequests() {
  console.time("Время выполнения");

  const requestPromises = [];

  for (let i = 0; i < 500; i++) {
    requestPromises.push(axios.get("http://localhost/answer/"));
  }

  try {
    const responses = await Promise.allSettled(requestPromises);
    console.log(
      "Результаты всех запросов:",
      responses.map((response) => response?.value?.data),
    );
  } catch (error) {
    console.error("Ошибка при выполнении запросов:", error);
  }
  console.timeEnd("Время выполнения");
}

makeRequests();
