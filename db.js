const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./chat.db');
 
 module.exports = db;