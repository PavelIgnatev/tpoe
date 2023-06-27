const fs = require("fs");
const axios = require("axios");

async function makeRequests() {
  console.time("Время выполнения");

  // Чтение файла и получение строк
  const fileContent = fs.readFileSync("1.txt", "utf8");
  const lines = fileContent.split("\n");

  const requestPromises = [];

  for (let i = 0; i < lines.length; i += 100) {
    const batch = lines.slice(i, i + 100); // Берем 100 элементов из индекса lines

    const dialogues = batch.map((line) => {
      return `Какой род деятельности связан с ${line.trim()}; результат выводи в виде 1 слова по пользователю, если не определено - пиши не определено, формат вывода: username: "тег или null"`;
    });

    requestPromises.push(
      axios.get(`http://localhost/answer/?dialogue=${dialogues}`)
    );
  }

  try {
    const responses = await Promise.allSettled(requestPromises);

    const results = responses.flatMap((response) => {
      if (response.status === "fulfilled") {
        return response.value.data.split("\n");
      } else {
        console.error("Ошибка при выполнении запросов:", response.reason);
        return [];
      }
    });

    fs.writeFileSync("output.txt", JSON.stringify(results), "utf8");

    console.log("Результаты всех запросов:", results);
  } catch (error) {
    console.error("Ошибка при выполнении запросов:", error);
  }
  console.timeEnd("Время выполнения");
}

makeRequests();
