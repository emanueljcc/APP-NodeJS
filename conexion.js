var Pool = require('pg').Pool;
var pool = new Pool({
  user: 'postgres',
  password: 'root',
  host: 'localhost',
  database: 'agence',
  port: 5433,
  max: 10, // max number of clients in pool
  idleTimeoutMillis: 1000, // close & remove clients which have been idle > 1 second
});