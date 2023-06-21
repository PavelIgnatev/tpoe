const extractNumbers = (str) => {
  const numbers = str.replace(/[\D]+/g, "");
  return numbers;
};

module.exports = { extractNumbers };
