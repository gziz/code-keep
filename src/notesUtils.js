const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const {workspace, Uri} = require('vscode');

let globalNotesDir = "/Users/gerardo/Desktop/vs-notes";
let lineToNoteNumber = new Map();
let noteNumberToNote = new Map();
let rangeToNoteNumber = new Map();
const notesUpdatedEvent = new vscode.EventEmitter();

function getLineToNoteNumber() {
    return lineToNoteNumber;
}

function getNoteNumberToNote() {
    return noteNumberToNote;
}

function getRangeToNoteNumber() {
    return rangeToNoteNumber;
}

async function loadNotes() {
	
    let editor = vscode.window.activeTextEditor;
    if (editor) {
        let currentFileObj = path.parse(editor.document.fileName);
        let currentFileName = currentFileObj.name;

		let notesFilePath = `${globalNotesDir}/${currentFileName}.json`
		let parsedNotesFilePath = Uri.parse(notesFilePath)

        if (fs.existsSync(notesFilePath)) {

            let data = await workspace.fs.readFile(parsedNotesFilePath)
            
            let obj = JSON.parse(data.toString())
            lineToNoteNumber.clear();
            noteNumberToNote.clear();
            lineToNoteNumber = new Map(obj.lineToNoteNumber);
            noteNumberToNote = new Map(obj.noteNumberToNote);
            rangeToNoteNumber = new Map(obj.rangeToNoteNumber);

			console.log("noteNumberToNote: ", noteNumberToNote);
			console.log("lineToNoteNumber: ", lineToNoteNumber);
            console.log("rangeToNoteNumber: ", rangeToNoteNumber);

        }
    }
}

loadNotes()

module.exports = {
    getLineToNoteNumber,
    getNoteNumberToNote,
    getRangeToNoteNumber,
    loadNotes,
    lineToNoteNumber,
    noteNumberToNote,
    notesUpdatedEvent,
    globalNotesDir
};
