const createPage = async (context) => {
  if (!context) {
    throw new Error("Произошла ошибка, context не был передан");
  }

  const page = await context.newPage();

  return page;
};

module.exports = { createPage };
