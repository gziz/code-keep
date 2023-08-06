const vscode = require('vscode');
const { getCurrFileNotes, getLineToNoteMap } = require('./notesUtils');

let hoverProvider = vscode.languages.registerHoverProvider('*', {
    provideHover(document, position, token) {
        let lineToNoteMap = getLineToNoteMap();
        let line = position.line;
        console.log("hovering over: ", line)
        let note = lineToNoteMap.get(line);
        if(note) {
            return new vscode.Hover(note.content);
        }
    }
});

module.exports = {
    hoverProvider
}
