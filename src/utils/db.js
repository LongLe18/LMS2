const Sequelize = require('sequelize');
const { database } = require('../config');

const sequelize = new Sequelize(
    database.database,
    database.username,
    database.password,
    {
        host: database.host,
        dialect: database.dialect,
        port: database.port,
        pool: {
            max: database.pool.max,
            min: database.pool.min,
            acquire: database.pool.acquire,
            idle: database.pool.idle,
        },
        timezone: '+07:00',
        logging: false
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
