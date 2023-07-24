const vscode = require('vscode');
const path = require('path');
const { getLineToNoteNumber, getNoteNumberToNote, getRangeToNoteNumber, notesUpdatedEvent, globalNotesDir }  = require('./notesUtils');
const { TextEncoder } = require('util');

function sortMapByRangeKeys(unsortedMap) {
    let sortedMap = new Map([...unsortedMap.entries()].sort((a, b) => {
        let startA = Number(a[0].split(',')[0]);
        let startB = Number(b[0].split(',')[0]);
        return startA - startB;
    }));

    return sortedMap;
}


const addDot = (startLine, endLine) => {
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
        lineToNoteNumber = getLineToNoteNumber()
        noteNumberToNote = getNoteNumberToNote()
        rangeToNoteNumber = getRangeToNoteNumber()

        let selection = editor.selection;
        let note = await vscode.window.showInputBox({ prompt: 'Enter your note' });

        if (note) {
            let startLine = selection.start.line
            let endLine = selection.end.line;
            rangeToNoteNumber.set(`${startLine},${endLine}`, noteNumberToNote.size)

            for (i = startLine; i <= endLine; i++) {
                lineToNoteNumber.set(i, noteNumberToNote.size)
            }
            noteNumberToNote.set(noteNumberToNote.size, note)
            
            vscode.window.showInformationMessage('Your new note: ' + note);
            
            sortedRangeToNoteNumber = sortMapByRangeKeys(rangeToNoteNumber);
            console.log(sortedRangeToNoteNumber)
            let data = {
                lineToNoteNumber: Array.from(lineToNoteNumber.entries()),
                noteNumberToNote: Array.from(noteNumberToNote.entries()),
                rangeToNoteNumber: Array.from(sortedRangeToNoteNumber.entries()),
            };

            let currentFilePathObj = path.parse(editor.document.fileName);
            let currentFileName = currentFilePathObj.name;
            let parsedNotesFilePath = vscode.Uri.file(`${globalNotesDir}/${currentFileName}.json`)
            
            addDot(startLine, endLine);
            notesUpdatedEvent.fire();
            return vscode.workspace.fs.writeFile(parsedNotesFilePath, new TextEncoder().encode(JSON.stringify(data)));
        }
    }
};

module.exports = {
    addNote,
    addDot,
};
