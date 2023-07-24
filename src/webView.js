const vscode = acquireVsCodeApi();

function sendMessage(startLine) {
    // Send the note number to the extension when the note is clicked
    vscode.postMessage({
        command: 'goToNote',
        startLine: startLine
    });
}
