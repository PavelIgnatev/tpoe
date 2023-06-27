const fs = require("fs");
const axios = require("axios");

async function makeRequests() {
  console.time("Время выполнения");

  // Чтение файла и получение строк
  const fileContent = fs.readFileSync("1.txt", "utf8");
  const lines = fileContent.split("\n");

  const requestPromises = [];

  for (let i = 0; i < lines.length; i += 3) {
    const batch = lines.slice(i, i + 3);

    const dialogues = batch.map((line) => {
      return `Какой род деятельности связан с ${line.trim()}; результат выводи в виде 1 слова по пользователю, если не определено - пиши не определено, обязательноый формат вывода результата (ничего писать больше не нужно): имя пользователя: тег (один едниственный) или null (в случае, если рода деятельности нет)`;
    });

    console.log(i, lines.length);

    requestPromises.push(
      axios.get(`http://localhost/answer/?dialogue=${dialogues}`)
    );

    if (i % 15 === 0) {
      // Ждем выполнения 10 запросов перед продолжением
      await Promise.all(requestPromises.slice(-10));
    }
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

    fs.writeFileSync("output.txt", results.join("\n"), "utf8");

    console.log("Результаты всех запросов:", results);
  } catch (error) {
    console.error("Ошибка при выполнении запросов:", error);
  }
  console.timeEnd("Время выполнения");
}

makeRequests();
