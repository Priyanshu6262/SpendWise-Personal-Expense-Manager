const winston = require('winston');
const { Loggly } = require('winston-loggly-bulk');

// Determine if we are in production
const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Output logs locally to the console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Add Loggly transport in production or if Token is provided
if (process.env.LOGGLY_TOKEN && process.env.LOGGLY_SUBDOMAIN) {
  logger.add(new Loggly({
    token: process.env.LOGGLY_TOKEN,
    subdomain: process.env.LOGGLY_SUBDOMAIN,
    tags: ['mern-expense-manager', isProduction ? 'production' : 'development'],
    json: true
  }));
}

module.exports = logger;
