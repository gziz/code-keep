const vscode = require('vscode');
const { addNote, addDot } = require('./commands');
const { hoverProvider } = require('./hoverProvider');
const { loadNotes } = require('./notesUtils');
const CodewizNotesProvider = require('./notesProvider');

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    console.log('Codewiz is active!');
    await loadNotes();

    vscode.window.onDidChangeActiveTextEditor(async () => {
        await loadNotes();
    });

    const addDotCmd = vscode.commands.registerCommand('codewiz.addDot', addDot);
    const addNoteCmd = vscode.commands.registerCommand('codewiz.addNote', addNote);
    
    context.subscriptions.push(addDotCmd);
    context.subscriptions.push(addNoteCmd);
	context.subscriptions.push(hoverProvider);

    const viewProvider = new CodewizNotesProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("codewizNotesView", viewProvider));
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
