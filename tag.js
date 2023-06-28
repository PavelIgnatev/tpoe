const fs = require("fs");
const axios = require("axios");

async function makeRequests() {
  console.time("Время выполнения");

  // Чтение файла и получение строк
  const fileContent = fs.readFileSync("1.txt", "utf8");
  const lines = fileContent.split("\n");

  const requestPromises = [];

  for (let i = 0; i < lines.length; i += 25) {
    const batch = lines.slice(i, i + 25);

    console.log(i, lines.length);

    requestPromises.push(
      axios.post("http://localhost/answer/", {
        dialogue: `
У меня имеется шкала оценки рода деятельности:
1 - никакой информации
2 - очень смутное описание
3 - недостаточно ясное описание
4 - нечеткое описание
5 - некоторая информация, но не полная
6 - понятное описание, но с некоторой неопределенностью
7 - ясное описание, но не до конца конкретное
8 - достаточно конкретное описание, но не до конца ясное
9 - очень ясное описание, но с некоторой неопределенностью
10 - точное и ясное описание.

Оцени каждого из пользователей ниже по шкале выше:
${batch.join(";\n")}

В результате я ожидаю вывод в формате:
username: номер из шкалы (само описание и имя выводить не нужно, обязательно следуй формату из примера ниже!)

Пример:
ignatevPavel: 5
sergaer: 10
sonina: 1`,
      })
    );

    if (i % 250 === 0) {
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
