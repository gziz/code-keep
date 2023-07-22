const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const {workspace, Uri} = require('vscode');
const {TextEncoder, TextDecoder} = require('util');

let globalNotesDir = "/Users/gerardo/Desktop/vs-notes"
let lineToNoteNumber = new Map();
let noteNumberToNote = new Map();
const notesUpdatedEvent = new vscode.EventEmitter();

async function loadNotes() {
	
    let editor = vscode.window.activeTextEditor;
    if (editor) {
        let currentFileObj = path.parse(editor.document.fileName);
        let currentFileName = currentFileObj.name;

		let notesFilePath = `${globalNotesDir}/${currentFileName}.json`
		let parsedNotesFilePath = Uri.parse(notesFilePath)
        console.log("Loading notes from: ", parsedNotesFilePath)

        if (fs.existsSync(notesFilePath)) {

            let data = await workspace.fs.readFile(parsedNotesFilePath)
            
            let obj = JSON.parse(data.toString())
            lineToNoteNumber.clear();
            noteNumberToNote.clear();
            lineToNoteNumber = new Map(obj.lineToNoteNumber);
            noteNumberToNote = new Map(obj.noteNumberToNote);
			console.log("lineToNoteNumber: ", noteNumberToNote);
			console.log("noteNumberToNote: ", lineToNoteNumber);

        }
    }
}

module.exports = {
    loadNotes,
    lineToNoteNumber,
    noteNumberToNote,
    notesUpdatedEvent
};
