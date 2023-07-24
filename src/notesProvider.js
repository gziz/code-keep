const vscode = require('vscode');
const { getLineToNoteNumber, getNoteNumberToNote, getRangeToNoteNumber, notesUpdatedEvent } = require('./notesUtils');


class CodewizNotesProvider {
    constructor(extensionUri) {
        this._extensionUri = extensionUri;
		this._view = null;

		notesUpdatedEvent.event(() => {
            if (this._view) {
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

		this.lineToNoteNumber = getLineToNoteNumber()
		this.noteNumberToNote = getNoteNumberToNote()
		this.rangeToNoteNumber = getRangeToNoteNumber()
		
		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
		this._view = webviewView;


		webviewView.webview.onDidReceiveMessage(message => {
			if (message.command === 'goToNote') {
				console.log(message)
				// Find the line number given the noteNumber (inside message.noteNumber)
				// let lineNumber = Array.from(this.lineToNoteNumber.entries()).find(([line, noteNumber]) => noteNumber === message.noteNumber)[0];

				if (typeof message.startLine !== 'undefined') {
					// Go to the line
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
		
		let htmlContent = `<html><body>`;
		
		this.rangeToNoteNumber.forEach((noteNumber, range) => {
			let [startLine, endLine] = range.split(",")
			let note = this.noteNumberToNote.get(noteNumber)
			
			
			htmlContent += `
				<div id="note-${noteNumber}" onclick="sendMessage(${startLine})" style="margin-bottom: 20px; cursor: pointer;">
					<h3>Note. ${startLine}-${endLine}</h3>
					<textarea style="width: 100%; height: 60px;">${note}</textarea>
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