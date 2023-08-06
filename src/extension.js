const vscode = require('vscode');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { addNote, addDot } = require('./commands');
const { hoverProvider } = require('./hoverProvider');
const notesUtils = require('./notesUtils');
const CodewizNotesProvider = require('./notesProvider');
const dbUtils = require('./dbUtils')
const { notesUpdatedEvent } = require('./events');
const { updateWorkspacePath, updateWorkspaceID, getWorkspaceId } = require('./workspaceInfo');

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    console.log('Codewiz is active!');
    let db;
    let workspaceId;
    let workspacePath;

    if (vscode.workspace.workspaceFolders !== undefined) {
        workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
        const dbPath = path.join(workspacePath, 'notes.db');

        db = new sqlite3.Database(dbPath);

        workspaceId = await dbUtils.getWorkspaceIdByPath(db, workspacePath);
        if (!workspaceId) {
            await dbUtils.insertWorkspace(db, workspacePath);
        }

        updateWorkspacePath(workspacePath);
        updateWorkspaceID(workspaceId);
    }

    await notesUtils. loadWorkspaceNotes(db);

    vscode.window.onDidChangeActiveTextEditor(async () => {
        notesUtils.loadCurrFileNotes();
        notesUpdatedEvent.fire();
    });

    const addDotCmd = vscode.commands.registerCommand('codewiz.addDot', addDot);
    const addNoteCmd = vscode.commands.registerCommand('codewiz.addNote', () => addNote(db));
    
    context.subscriptions.push(addDotCmd);
    context.subscriptions.push(addNoteCmd);
	context.subscriptions.push(hoverProvider);

    const viewProvider = new CodewizNotesProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("codewizNotesView", viewProvider));
}

// This method is called when your extension is deactivated
function deactivate() {
    db.close()
}

module.exports = {
	activate,
	deactivate
}
