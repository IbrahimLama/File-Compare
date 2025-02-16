class DatabaseStrategyFactory {
  static createStrategy(dbType) {
    // Map database types to their respective strategy classes
    const strategies = {
      MongoDB: "./mongo_db_strategy",
      PostgreSQL: "./postgre_sql_strategy.js",
      "SQL Server": "./sql_server_strategy.js",
      MySQL: "./my_sql_strategy",
      Oracle: "./oracle_strategy.js",
    };

    const strategyPath = strategies[dbType];
    if (!strategyPath) {
     throw new Error(
        `Database type "${dbType}" is not supported. Supported types: ${Object.keys(
          strategies
        ).join(", ")}`
      );
    }

    // Dynamically require and instantiate the strategy
    const StrategyClass = require(strategyPath);
    return new StrategyClass();
  }
}

module.exports = DatabaseStrategyFactory;

