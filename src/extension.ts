import * as vscode from 'vscode';
const path = require('path');
const fs = require('fs');
const { Configuration, OpenAIApi } = require("openai");

import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../.env' });

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "helloworld" is now active!');

	let disposableHelloWorld = vscode.commands.registerCommand('helloworld.helloWorld', () => {
		vscode.window.showInformationMessage('Hello VS Code');
	});
	// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	let disposableHelloMars = vscode.commands.registerCommand('helloworld.hellomars', () => {
		vscode.window.showInformationMessage('Hello Mars!');
	});
	// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	let disposablePuppy = vscode.commands.registerCommand('helloworld.showPuppy', () => {
		const panel = vscode.window.createWebviewPanel(
			'puppyPanel',
			'Puppy Picture',
			vscode.ViewColumn.One,
			{
				enableScripts: true
			}
		);
		panel.webview.html = getWebviewContent();
	});
	
	const getWebviewContent = () => {
		const filePath = vscode.Uri.file(path.join(context.extensionPath, 'src', 'puppy.html'));
		const fileContent = fs.readFileSync(filePath.fsPath, 'utf-8');
		return fileContent;
	};

	// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	const askGpt = async (prompt: string) => {
		const configuration = new Configuration({
			apiKey: process.env.OPENAI_API_KEY,
		});
		const openai = new OpenAIApi(configuration);
	  
		const chatCompletion = await openai.createChatCompletion({
		  model: "gpt-3.5-turbo",
		  messages: [{ role: "user", content: prompt }],
		});
		console.log(chatCompletion.data.choices[0].message.content);
		const message = chatCompletion.data.choices[0].message.content;

		return message;
	};

	const addNewCell = async () => {
		const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor || activeEditor.document.languageId !== 'python') {
		  vscode.window.showErrorMessage('No .ipynb file is open');
		  return;
		}
		const filePath = activeEditor.document.uri.fsPath;
	  
		// Prompt the user to enter the prompt for the new cell
		const topic = await vscode.window.showInputBox({
		  placeHolder: 'Enter the topic',
		  prompt: 'Please enter the topic you want the cell to be filled with',
		});
	  
		if (!topic) {
		  return;
		}
	  
		askGpt(topic)
		  .then(async (result) => {
			const cell = {
			  cell_type: 'markdown',
			  source: ["###" + result],
			  metadata: {},
			  outputs: [],
			  execution_count: null,
			};
	  
			// Read the existing notebook content
			const existingContent = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
			const existingNotebook = JSON.parse(existingContent.toString());
	  
			// Add the new cell to the existing notebook cells
			existingNotebook.cells.push(cell);
	  
			// Save the updated notebook file
			const updatedContent = JSON.stringify(existingNotebook, null, 2);
			await vscode.workspace.fs.writeFile(vscode.Uri.file(filePath), Buffer.from(updatedContent));
	  
			// Refresh the editor to reflect the changes
			activeEditor.document.save();
			vscode.commands.executeCommand('workbench.action.files.revert');
	  
			// Show success message to the user
			vscode.window.showInformationMessage('New cell added to the notebook');
		  })
		  .catch((error) => {
			console.error(error);
		  });
	  };	  

	// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Add the disposable to the context subscriptions
	context.subscriptions.push(disposableHelloWorld);
	context.subscriptions.push(disposableHelloMars);
	context.subscriptions.push(disposablePuppy);
	context.subscriptions.push(vscode.commands.registerCommand('helloworld.addNewCell', addNewCell));
}
export function deactivate() {}
