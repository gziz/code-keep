const vscode = require('vscode');
const {workspace, Uri, WebviewViewProvider} = require('vscode');
const {TextEncoder, TextDecoder} = require('util');
const fs = require('fs');
const path = require('path');


let globalNotesDir = "/Users/gerardo/Desktop/vs-notes"
let lineToNoteNumber = new Map();
let noteNumberToNote = new Map();
const notesUpdatedEvent = new vscode.EventEmitter();


class CodewizNotesProvider {
    constructor(extensionUri) {
        this._extensionUri = extensionUri;
		this._view = null;

		notesUpdatedEvent.event(() => {
            if (this._view) {
				console.log("hey", this._view.webview.html)
                this._view.webview.html = this._getHtmlForWebview(this._view.webview);
            }
        });
    }

    resolveWebviewView(webviewView) {
		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,
	  
			localResourceRoots: [this._extensionUri],
		  };
        // webviewView.webview.html = his._getHtmlForWebview(webviewView.webview);
		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
		this._view = webviewView;

		webviewView.webview.onDidReceiveMessage(message => {
			if (message.command === 'goToNote') {
				// Find the line number for the note
				let lineNumber = Array.from(lineToNoteNumber.entries()).find(([line, noteNumber]) => noteNumber === message.noteNumber)[0];
				console.log(lineNumber)
				if (typeof lineNumber !== 'undefined') {
					// Go to the line
					let editor = vscode.window.activeTextEditor;
					let targetLine = new vscode.Position(lineNumber, 0);
					editor.selection = new vscode.Selection(targetLine, targetLine);
					editor.revealRange(new vscode.Range(targetLine, targetLine));
	
				}
			}
		});
    }
	_getHtmlForWebview(webview) {
		const scriptSource = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js')
		);
		console.log(scriptSource);
		// Here you can generate HTML for the webview.
		// You can use notes from your noteNumberToNote Map.
		let htmlContent = `<html><body>`;
		
		noteNumberToNote.forEach((note, noteNumber) => {
			// Each note will be an anchor that sends a postMessage when clicked
			htmlContent += `<p><a href="#" onclick="sendMessage(${noteNumber})">Note ${noteNumber}: ${note}</a></p>`;
		});
	
		htmlContent += `
		<script src="${scriptSource}"></script>
		</body></html>`;
		return htmlContent;
	}
}

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


/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    console.log('Codewiz is active!');
    await loadNotes();

    vscode.window.onDidChangeActiveTextEditor(async () => {
        await loadNotes();
    });
	
	function addDotFunc(startLine, endLine) {
		// Get the active text editor
		let editor = vscode.window.activeTextEditor;

		if (editor) {
			let decorationType = vscode.window.createTextEditorDecorationType({

				// gutterIconPath: vscode.Uri.file('/Users/gerardo/Documents/Dev/vs/codewiz/blue_dot.png'),
				// gutterIconSize: '75%' // Or 'auto' or 'cover' or any percentage value.
				//
				overviewRulerColor: 'blue',
				overviewRulerLane: vscode.OverviewRulerLane.Left,
				// overviewRulerLane: vscode.OverviewRulerLane.Right,
				// before: {
				// 	contentText: "N",
				// 	color: 'red',
				// }
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
	let addDot = vscode.commands.registerCommand('extension.addDot', addDotFunc);
	


	let addNote = vscode.commands.registerCommand('codewiz.addNote', async () => {
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
				
				addDotFunc(startLine, endLine);
				notesUpdatedEvent.fire();

				return workspace.fs.writeFile(parsedNotesFilePath, new TextEncoder().encode(JSON.stringify(data)));
			}
		}
	});
		

    let hoverProvider = vscode.languages.registerHoverProvider('*', {
        provideHover(document, position, token) {
            // Get the line number that the user is hovering over
            let line = position.line;

			let currNoteNumber = lineToNoteNumber.get(line)
			console.log("currNoteNumber: ", currNoteNumber)
			if (currNoteNumber !== undefined){
				let currNote = noteNumberToNote.get(currNoteNumber)
				return new vscode.Hover(currNote);
			}
			
        }
    });


    context.subscriptions.push(hoverProvider);
	context.subscriptions.push(addNote);
	context.subscriptions.push(addDot);

	const viewProvider = new CodewizNotesProvider(context.extensionUri);
	context.subscriptions.push(vscode.window.registerWebviewViewProvider("codewizNotesView", viewProvider));
}


// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}



		
