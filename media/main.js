const vscode = acquireVsCodeApi();

function sendMessage(noteNumber) {
    // Send the note number to the extension when the note is clicked
    vscode.postMessage({
        command: 'goToNote',
        noteNumber: noteNumber
    });
}
