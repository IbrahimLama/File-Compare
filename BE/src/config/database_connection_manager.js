const DatabaseStrategyFactory = require("./database_strategy_factory");
require("dotenv").config({ path: "./.env" }); // Load .env file

class DatabaseConnectionManager {
  constructor() {
    const dbType = process.env.DB_TYPE;
    this.dbType = dbType;
    if (!dbType) {
      throw new Error("DB_TYPE is not defined in the .env file");
    }
    this.strategy = DatabaseStrategyFactory.createStrategy(dbType);
  }

  async connect() {
    console.log(`Connecting to ${this.dbType}...`);
    await this.strategy.connect();
  }
}

module.exports = DatabaseConnectionManager;
