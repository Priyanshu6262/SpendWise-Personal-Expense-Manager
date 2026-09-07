const { Sequelize } = require('sequelize');
const path = require('path');
const logger = require('../utils/logger');

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
    dialectOptions: process.env.DB_SSL === 'true' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  });
} else {
  const dialect = process.env.DB_DIALECT || 'sqlite';

  if (dialect === 'sqlite') {
    const storagePath = process.env.DB_STORAGE 
      ? path.resolve(process.env.DB_STORAGE) 
      : path.join(__dirname, '../database.sqlite');

    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: storagePath,
      logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
    });
  } else {
    sequelize = new Sequelize(
      process.env.DB_NAME || 'spendwise',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || (dialect === 'postgres' ? 5432 : 3306),
        dialect: dialect,
        logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
      }
    );
  }
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    const dialectName = sequelize.getDialect();
    console.log(`SQL Database Connected (${dialectName})`);
    logger.info('SQL Database Connected', { dialect: dialectName });

    // Automatically sync models to create tables if they do not exist
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('SQL Models synchronized successfully');
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    logger.error('Database Connection Error', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
