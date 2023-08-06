const vscode = require('vscode');

const notesUpdatedEvent = new vscode.EventEmitter();

module.exports = {
    notesUpdatedEvent
}