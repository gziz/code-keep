const vscode = require('vscode');
const { lineToNoteNumber, noteNumberToNote} = require('./notesUtils');

let hoverProvider = vscode.languages.registerHoverProvider('*', {
    provideHover(document, position, token) {
        let line = position.line;
        console.log("hovering over: ", line)

        let currNoteNumber = lineToNoteNumber.get(line)
        if (currNoteNumber !== undefined){
            let currNote = noteNumberToNote.get(currNoteNumber)
            return new vscode.Hover(currNote);
        }
        
    }
});