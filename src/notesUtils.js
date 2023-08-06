const vscode = require('vscode');
const dbUtils = require('./dbUtils');
const path = require('path');
const { getWorkspaceId, getWorkspacePath } = require('./workspaceInfo');
const { notesUpdatedEvent } = require('./events');

let workspaceNotes;
let currFileNotes;
let lineToNoteMap = new Map();

function getWorkspaceNotes() {
    return workspaceNotes;
}
function updateWorkspaceNotes(notes) {
    workspaceNotes = notes;
}

function getCurrFileNotes() {
    if (!currFileNotes) {
        loadCurrFileNotes();
    }
    return currFileNotes ? currFileNotes : [];
}

function updateCurrFileNotes(notes) {
    currFileNotes = notes;
}

function insertNoteLocal(content, startLine, endLine, relativeFilePath) {
    let note = {
        id: currFileNotes ? currFileNotes.length + 1 : 1,
        content: content,
        start_line: startLine,
        end_line: endLine
    };
    
    workspaceNotes[relativeFilePath].push(note);
    loadLineToNoteMap();
}

function loadLineToNoteMap() {
    let currFileNotes = getCurrFileNotes();
    currFileNotes.forEach(note => {
        for(let i=note.start_line; i<=note.end_line; i++) {
            lineToNoteMap.set(i, note);
        }
    });
}

function getLineToNoteMap() {
    if (!lineToNoteMap || Object.keys(lineToNoteMap).length === 0) {
        loadLineToNoteMap();
    }
    return lineToNoteMap;
}

async function loadWorkspaceNotes(db) {

    let editor = vscode.window.activeTextEditor;
    if (editor) {
        const workspaceId = getWorkspaceId();
        let notes = await dbUtils.getWorkspaceNotes(db, workspaceId);
        updateWorkspaceNotes(notes);
    }
}

async function loadCurrFileNotes() {

    let editor = vscode.window.activeTextEditor;
    if (editor) {
        let workspacePath = getWorkspacePath();
        let relativeFilePath = path.relative(workspacePath, editor.document.fileName);
    
        if (!workspaceNotes.hasOwnProperty(relativeFilePath)){
            workspaceNotes[relativeFilePath] = [];
        }
        currFileNotes = workspaceNotes[relativeFilePath];
    }

}


module.exports = {
    loadWorkspaceNotes,
    getWorkspaceNotes,
    getCurrFileNotes,
    loadLineToNoteMap,
    loadCurrFileNotes,
    getLineToNoteMap,
    insertNoteLocal,
};
