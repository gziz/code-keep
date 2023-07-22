const vscode = require('vscode');
const { lineToNoteNumber, noteNumberToNote, notesUpdatedEvent, loadNotes } = require('./notesUtils');

const addDot = (startLine, endLine) => {
    // Get the active text editor
    let editor = vscode.window.activeTextEditor;

    if (editor) {
        let decorationType = vscode.window.createTextEditorDecorationType({
            overviewRulerColor: 'blue',
            overviewRulerLane: vscode.OverviewRulerLane.Left,
        });

        let decorationsArray = [];

        let decoration = { range: new vscode.Range(
            new vscode.Position(endLine, 50),
            new vscode.Position(endLine, 55)
            )};
        decorationsArray.push(decoration);

        editor.setDecorations(decorationType, decorationsArray);
    }
};

const addNote = async () => {
    let editor = vscode.window.activeTextEditor; 
    if (editor) {

        let selection = editor.selection;
        let note = await vscode.window.showInputBox({ prompt: 'Enter your note' });

        if (note) {
            let startLine = selection.start.line
            let endLine = selection.end.line;
            for (i = startLine; i <= endLine; i++) {
                lineToNoteNumber.set(i, noteNumberToNote.size)
            }
            noteNumberToNote.set(noteNumberToNote.size, note)
            
            vscode.window.showInformationMessage('Your new note: ' + note);

            let data = {
                lineToNoteNumber: Array.from(lineToNoteNumber.entries()),
                noteNumberToNote: Array.from(noteNumberToNote.entries()),
            };

            let currentFilePathObj = path.parse(editor.document.fileName);
            let currentFileName = currentFilePathObj.name;
            let parsedNotesFilePath = Uri.file(`${globalNotesDir}/${currentFileName}.json`)
            
            addDot(startLine, endLine);
            notesUpdatedEvent.fire();

            return workspace.fs.writeFile(parsedNotesFilePath, new TextEncoder().encode(JSON.stringify(data)));
        }
    }
};

module.exports = {
    addNote,
    addDot,
};
