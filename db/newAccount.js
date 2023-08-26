const { MongoClient } = require("mongodb");

const dbName = "telegram";
const collectionName = "poe";
const uri =
  "mongodb://qwerty:qwerty123@ac-llvczxo-shard-00-00.2ry9k50.mongodb.net:27017,ac-llvczxo-shard-00-01.2ry9k50.mongodb.net:27017,ac-llvczxo-shard-00-02.2ry9k50.mongodb.net:27017/?ssl=true&replicaSet=atlas-b2xf0l-shard-0&authSource=admin&retryWrites=true&w=majority";
class AccountService {
  constructor() {
    this.client = null;
    this.db = null;
    this.collection = null;
    this.cookies = null;

    this.connect = this.connect.bind(this);
    this.readAccounts = this.readAccounts.bind(this);
    this.readAccount = this.readAccount.bind(this);
    this.insertAccount = this.insertAccount.bind(this);
    this.updateAccount = this.updateAccount.bind(this);
    this.readRandomCookie = this.readRandomCookie.bind(this);
    this.readCookies = this.readCookies.bind(this);
    this.updateAccountByCookie = this.updateAccountByCookie.bind(this);
    this.addPrevFieldToAccounts = this.addPrevFieldToAccounts.bind(this);
    this.deleteAccount = this.deleteAccount.bind(this);
    this.readAccountEmail = this.readAccountEmail.bind(this);
  }

  async connect() {
    if (this.client) {
      return;
    }

    this.client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.db = this.client.db(dbName);
    this.collection = this.db.collection(collectionName);
  }

  async readRandomCookie() {
    await this.connect();

    if (!this.cookies) {
      const pipeline = [
        { $match: { prev: { $ne: true } } },
        { $sample: { size: 1000 } },
      ];

      const result = await this.collection.aggregate(pipeline).toArray();
      const native = result.map((cookie) => {
        return cookie.cookies.filter((e) => e["name"] === "p-b")[0];
      });
      this.cookies = native;
    }

    const randomIndex = Math.floor(Math.random() * this.cookies.length);

    return this.cookies[randomIndex];
  }

  async readCookies() {
    await this.connect();

    const cookies = await this.collection.distinct("cookies");
    const native = cookies.filter((cookie) => cookie["name"].includes("p-b"));

    return native;
  }

  async updateAccountByCookie(cookieValue, updatedData) {
    await this.connect();

    await this.collection.findOneAndUpdate(
      { cookies: { $elemMatch: { value: cookieValue } } },
      { $set: updatedData },
      { returnOriginal: false }
    );
  }

  // метод для получения всех аккантов
  async readAccounts() {
    await this.connect();

    return await this.collection.find().toArray();
  }

  // метод для получения акканта по полю "username"
  async readAccount(username) {
    await this.connect();

    return await this.collection.findOne({ username });
  }

  async readAccountEmail(email) {
    await this.connect();

    return await this.collection.findOne({ email });
  }

  // метод для добавления аккаунта
  async insertAccount(account) {
    await this.connect();

    await this.collection.insertOne(account);
  }

  // метод для обновления данных аккаунта
  async updateAccount(username, updatedData) {
    await this.connect();

    await this.collection.updateOne({ username }, { $set: updatedData });
  }

  async deleteAccount(username) {
    await this.connect();

    await this.collection.deleteOne({ username });
  }

  async addPrevFieldToAccounts() {
    await this.connect();

    await this.collection.updateMany({}, { $set: { prev: true } });
  }
}

module.exports = new AccountService();
