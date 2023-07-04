const fs = require("fs");
const { insertMessage } = require("../telegram/db/message");

// Функция для чтения файла
function readFile(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// Функция для парсинга строки
function parseLine(line) {
  const parts = line.split(":");

  // Пропускаем строки без символа ":"
  if (parts.length < 1) {
    return null;
  }

  const username = parts[0].trim();
  const part = parts[parts.length - 1].trim();
  const splitter = part.split("; ");
  const data = splitter[splitter.length - 1].trim();
  const das = data.split("-");
  const natural = das[das.length - 1].trim();
  const count =
    natural.length <= 2
      ? Number(natural.replace("null", "1").replace("undefined", "1"))
      : Number(1);

  if (!username) {
    return null;
  }

  if (isNaN(count)) {
    return {
      username,
      count: 1,
    };
  }

  return {
    username,
    count,
  };
}

// Основная функция
async function parseFile(filename) {
  try {
    const data = await readFile(filename);
    const data2 = await readFile("./2.txt");
    const lines = data.split("\n");
    const lines2 = data2.split("\n");
    const result = {};

    console.log(lines.length);

    for (const line of lines) {
      const parsedLine = parseLine(line);
      if (parsedLine) {
        const { username, count } = parsedLine;
        result[username] = count;
      }
    }

    for (const line2 of lines2) {
      const [tgName, fullname, descr] = line2.split(":");
      if (result[tgName]) {
        await insertMessage({
          username: tgName,
          accountData: fullname,
          count: result[tgName],
          description: descr,
        });
      }
    }

    return result;
  } catch (error) {
    console.error("Error reading file:", error);
    return null;
  }
}

// Вызов основной функции с указанием пути к файлу
const filename = "./output.txt";
parseFile(filename);
