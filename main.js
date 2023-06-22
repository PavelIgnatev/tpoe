const express = require("express");
const axios = require("axios");

const { serverPorts } = require("./constants");
const { execPromise } = require("./modules/execPromise");

const app = express();
let currentIndex = 0;

app.use(express.json());

app.get("/restart/", async (req, res) => {
  try {
    await execPromise("pm2 kill");

    for (const port of serverPorts) {
      const command = `PORT=${port} pm2 start npm --name "${port}" -- start`;

      console.log(command);

      await execPromise(command);
    }
  } catch (e) {
    console.log(e.message);
  }

  res.status(200).send("Internal Server Error");
});

app.all("/answer/*", (req, res) => {
  let retryCount = 0;

  const sendRequest = () => {
    const proxyPort = serverPorts[currentIndex];
    const proxyUrl = `http://localhost:${proxyPort}${req.originalUrl}`;
    console.log(proxyUrl);

    axios({
      method: req.method,
      url: proxyUrl,
      data: req.body,
    })
      .then((response) => {
        res.status(response.status).send(response.data);
      })
      .catch(() => {
        console.log(retryCount);
        if (retryCount < 10) {
          retryCount++;
          currentIndex = (currentIndex + 1) % serverPorts.length;
          sendRequest();
        } else {
          res.status(500).send("Maximum retries reached");
        }
      });

    currentIndex = (currentIndex + 1) % serverPorts.length;
  };

  sendRequest();
});

app.listen(80, () => {
  console.log("Прокси-сервер запущен на порту 80");
});
