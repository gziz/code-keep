const vscode = require('vscode');
const path = require('path');
const notesUtils = require('./notesUtils');
const { notesUpdatedEvent } = require('./events');

class CodewizNotesProvider {
    constructor(extensionUri) {
        this._extensionUri = extensionUri;
		this._view = null;

		notesUpdatedEvent.event(() => {
			this.currFileNotes = notesUtils.getCurrFileNotes();
			this._view.webview.html = this._getHtmlForWebview(this._view.webview);
        });
    }

    resolveWebviewView(webviewView) {
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this._extensionUri],
		  };

		this.currFileNotes = notesUtils.getCurrFileNotes();
		
		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
		this._view = webviewView;


		webviewView.webview.onDidReceiveMessage(message => {
			if (message.command === 'goToNote') {
				console.log(message)

				if (typeof message.startLine !== 'undefined') {

					let editor = vscode.window.activeTextEditor;
					let targetLine = new vscode.Position(message.startLine, 0);
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
		
		let htmlContent = `<html><body><h1>Your notes!</h1>`;
		
		this.currFileNotes.forEach((note, noteNum) => {
			
			htmlContent += `
				<div id="note-${note.id}" onclick="sendMessage(${note.start_line})" style="margin-bottom: 20px; cursor: pointer;">
					<h3>Note. ${note.start_line}-${note.end_line}</h3>
					<textarea style="width: 100%; height: 60px;">${note.content}</textarea>
				</div>
			`;
		});
	
		htmlContent += `
		<script src="${scriptSource}"></script>
		</body></html>`;
		return htmlContent;

	}
	
}

module.exports = CodewizNotesProvider;