// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const path = require('path');
const fs = require('fs');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "helloworld" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// a disposable object is used to manage resources that need to be cleaned up or disposed of when they are no longer needed.
	let disposableHelloWorld = vscode.commands.registerCommand('helloworld.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello VS Code');
	});

	let disposableHelloMars = vscode.commands.registerCommand('helloworld.hellomars', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello Mars!');
	});

	let disposablePuppy = vscode.commands.registerCommand('helloworld.showPuppy', () => {
		// Create a webview panel
		const panel = vscode.window.createWebviewPanel(
			'puppyPanel',
			'Puppy Picture',
			vscode.ViewColumn.One,
			{
				enableScripts: true
			}
		);
	
		// Load the puppy.html file into the webview panel
		panel.webview.html = getWebviewContent();
	});
	
	function getWebviewContent() {
		// Read the contents of the puppy.html file and return it as a string
		const filePath = vscode.Uri.file(path.join(context.extensionPath, 'src', 'puppy.html'));
		const fileContent = fs.readFileSync(filePath.fsPath, 'utf-8');
		return fileContent;
	}

	let diagnosticCollection: vscode.DiagnosticCollection;

	// Add the disposable to the context subscriptions
	context.subscriptions.push(disposableHelloWorld);
	context.subscriptions.push(disposableHelloMars);
	context.subscriptions.push(disposablePuppy);

}

// This method is called when your extension is deactivated
export function deactivate() {}
