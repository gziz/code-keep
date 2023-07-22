const vscode = require('vscode');
const { notesUpdatedEvent } = require('./notesUtils');


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
			vscode.Uri.joinPath(this._extensionUri, 'src', 'webView.js')
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

module.exports = CodewizNotesProvider;