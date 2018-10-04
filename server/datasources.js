'use strict';

module.exports = {
  db: {
    url: process.env.NODE_ENV === 'production' ? process.env.MONGODB_URI : '',
    host: 'localhost',
    port: 27017,
    database: 'alfred-waiter',
    password: '',
    name: 'db',
    user: '',
    connector: 'mongodb',
  },
};
