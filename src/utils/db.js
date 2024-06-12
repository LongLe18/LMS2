const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DATABASE_DB_NAME,
    process.env.DATABASE_USERNAME,
    process.env.DATABASE_PASSWORD,
    {
        host: process.env.DATABASE_HOST || 'localhost',
        dialect: process.env.DATABASE_TYPE || 'mysql',
        port: Number(process.env.DATABASE_PORT) ? parseInt(process.env.DATABASE_PORT, 10) : 3306,
        timezone: process.env.DATABASE_TIMEZONE || '+00:00',
        logging: process.env.DATABASE_LOGGING ? JSON.parse(process.env.DATABASE_LOGGING) : false,
    }
);

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully!');
    })
    .catch((err) => {
        console.error('Unable to connect to database ');
    });

module.exports = sequelize;
