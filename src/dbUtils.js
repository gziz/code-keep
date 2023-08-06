const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const vscode = require('vscode');
const path = require('path');

function insertWorkspace(db, workspacePath) {
  return new Promise((resolve, reject) => {
    db.run("INSERT INTO workspaces (path) VALUES (?)", [workspacePath], function(err) {
      if (err) {
        reject(err.message);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

function insertFile(db, relativeFilePath, workspaceId) {
  return new Promise((resolve, reject) => {
    db.run("INSERT INTO files (name, relative_path, workspace_id) VALUES (?, ?, ?)", [relativeFilePath, relativeFilePath, workspaceId], function(err) {
      if (err) {
        reject(err.message);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

function insertNote(db, content, startLine, endLine, fileId) {
  return new Promise((resolve, reject) => {
    db.run("INSERT INTO notes (content, start_line, end_line, file_id) VALUES (?, ?, ?, ?)", [content, startLine, endLine, fileId], function(err) {
      if (err) {
        reject(err.message);
      } else {
        resolve(this.lastID); 
      }
    });
  });
}



function getWorkspaceIdByPath(db, workspacePath) {
  return new Promise((resolve, reject) => {
    db.get("SELECT id FROM workspaces WHERE path = ?", [workspacePath], (err, row) => {
      if (err) {
        reject(err.message);  
      } else {
        resolve(row ? row.id : null);
      }
    });
  });
}


function getFileIdByPath(db, relativeFilePath, workspaceId) {
  return new Promise((resolve, reject) => {
    db.get("SELECT id FROM files WHERE relative_path = ? AND workspace_id = ?", [relativeFilePath, workspaceId], (err, row) => {
      if (err) {
        reject(err.message);
      } else if (row) {
        resolve(row.id);
      } else {
        insertFile(db, relativeFilePath, workspaceId)
          .then(id => resolve(id))
          .catch(err => reject(err));
      }
    });
  });
}

function getNotesForFile(db, fileId) {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM notes WHERE file_id = ?", [fileId], (err, rows) => {
      if (err) {
        reject(err.message);  
      } else {
        resolve(rows);  // resolve the promise with the rows retrieved
      }
    });
  });
}

function getWorkspaceNotes(db, workspaceId) {

  // Query to get all files and notes in the current workspace
  let sql = `
      SELECT files.relative_path, notes.id, notes.content, notes.start_line, notes.end_line
      FROM files
      INNER JOIN notes ON notes.file_id = files.id
      WHERE files.workspace_id = ?
  `;

  return new Promise((resolve, reject) => {
      db.all(sql, [workspaceId], (err, rows) => {
          if (err) {
              reject(err);
          } else {
              // Transform the rows into the required format
              let notesByFile = {};
              rows.forEach(row => {
                  if (!notesByFile[row.relative_path]) {
                      notesByFile[row.relative_path] = [];
                  }
                  let note = {
                      id: row.id,
                      content: row.content,
                      start_line: row.start_line,
                      end_line: row.end_line
                  };
                  notesByFile[row.relative_path].push(note);
              });

              resolve(notesByFile);
          }
      });
  });
}


module.exports = {
    insertWorkspace,
    insertFile,
    insertNote,
    getWorkspaceIdByPath,
    getFileIdByPath,
    getNotesForFile,
    getWorkspaceNotes
};
