const vscode = require('vscode');
const path = require('path');
const dbUtils = require('./dbUtils');
const notesUtils = require('./notesUtils');
const { notesUpdatedEvent } = require('./events');
const { getWorkspaceId, getWorkspacePath } = require('./workspaceInfo');

function sortMapByRangeKeys(unsortedMap) {
    let sortedMap = new Map([...unsortedMap.entries()].sort((a, b) => {
        let startA = Number(a[0].split(',')[0]);
        let startB = Number(b[0].split(',')[0]);
        return startA - startB;
    }));

    return sortedMap;
}


const addDot = (startLine, endLine) => {
    // const workspaceId = getWorkspaceId();
    // const workspacePath = getWorkspacePath();

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

const addNote = async (db) => {

    let editor = vscode.window.activeTextEditor;
    if (editor) {
        const workspaceId = getWorkspaceId();
        const workspacePath = getWorkspacePath();
        
        let relativeFilePath = path.relative(workspacePath, editor.document.fileName);
        let fileId = await dbUtils.getFileIdByPath(db, relativeFilePath, workspaceId);

        let selection = editor.selection;
        let note = await vscode.window.showInputBox({ prompt: 'Enter your note' });

        if (note) {
            let startLine = selection.start.line
            let endLine = selection.end.line;
            await dbUtils.insertNote(db, note, startLine, endLine, fileId);
            notesUtils.insertNoteLocal(note, startLine, endLine, relativeFilePath);

            notesUpdatedEvent.fire();
        }

    }
}

module.exports = {
    addNote,
    addDot,
};
