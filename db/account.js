const { MongoClient } = require("mongodb");

const dbName = "telegram";
const collectionName = "poeAccounts";
const uri =
  "mongodb+srv://qwerty:qwerty123@atlascluster.2ry9k50.mongodb.net/?retryWrites=true&w=majority";

class AccountService {
  constructor() {
    this.client = null;
    this.db = null;
    this.collection = null;

    this.connect = this.connect.bind(this);
    this.readAccounts = this.readAccounts.bind(this);
    this.readAccount = this.readAccount.bind(this);
    this.insertAccount = this.insertAccount.bind(this);
    this.updateAccount = this.updateAccount.bind(this);
    this.readRandomCookie = this.readRandomCookie.bind(this);
    this.deleteAccount = this.deleteAccount.bind(this);
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

    const cookies = await this.collection.distinct("cookies");
    const native = cookies.filter((cookie) => cookie["name"].includes("p-b"));

    const randomIndex = Math.floor(Math.random() * native.length);

    return native[randomIndex];
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
}

module.exports = new AccountService();
