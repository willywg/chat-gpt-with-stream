const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./chat.db');

function createTable() {
    db.run(`CREATE TABLE IF NOT EXISTS messages(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER,
        role TEXT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
}

createTable();
