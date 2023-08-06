const sqlite3 = require('sqlite3').verbose();

const dbPath = '/Users/gerardo/Desktop/bla/notes.db';
let db = new sqlite3.Database(dbPath, (err) => {
    db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS workspaces (id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT UNIQUE)");
    db.run("CREATE TABLE IF NOT EXISTS files (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, relative_path TEXT UNIQUE, workspace_id INTEGER, FOREIGN KEY(workspace_id) REFERENCES workspaces(id))");
    db.run("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT, start_line INTEGER, end_line INTEGER, file_id INTEGER, FOREIGN KEY(file_id) REFERENCES files(id))");
    });
});
