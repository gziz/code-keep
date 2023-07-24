const vscode = require('vscode');
const { getLineToNoteNumber, getNoteNumberToNote } = require('./notesUtils');

let hoverProvider = vscode.languages.registerHoverProvider('*', {
    provideHover(document, position, token) {
        let line = position.line;
        console.log("hovering over: ", line)

        let lineToNoteNumber = getLineToNoteNumber();
        let currNoteNumber = lineToNoteNumber.get(line)

        if (currNoteNumber !== undefined){
            let noteNumberToNote = getNoteNumberToNote();
            let currNote = noteNumberToNote.get(currNoteNumber)
            return new vscode.Hover(currNote);
        }
        
    }
});

module.exports = {
    hoverProvider
}