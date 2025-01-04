const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { VIDEO_STATUS } = require('../constants/constants');

const DB_PATH = path.resolve(__dirname, '../database.sqlite');

// Initialize SQLite database
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Create videos table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fileName TEXT NOT NULL,
            filePath TEXT NOT NULL,
            mimeType TEXT NOT NULL,
            size INTEGER NOT NULL,
            duration INTEGER NOT NULL,
            encoding TEXT NOT NULL,
            status TEXT DEFAULT '${VIDEO_STATUS.ACTIVE}',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating table ' + err.message);
            }
        });
    }
});

module.exports = db;