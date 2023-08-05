const axios = require("axios");

const options = {
  method: "POST",
  url: "https://gmailnator.p.rapidapi.com/inbox",
  headers: {
    "content-type": "application/json",
    "X-RapidAPI-Key": "6f13f742d8msh6a26afb8c4187e6p11582fjsnb913ba99f9e2",
    "X-RapidAPI-Host": "gmailnator.p.rapidapi.com",
  },
  data: {
    email: "d.u.sto.fa.ppearance67.8@gmail.com",
    limit: 10,
  },
};

(async () => {
  try {
    const response = await axios.request(options);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
})();
