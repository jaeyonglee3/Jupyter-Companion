import * as vscode from 'vscode';
const path = require('path');
const fs = require('fs');
const { Configuration, OpenAIApi } = require("openai");

import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../.env' });

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
	console.log('Jupyter Companion is now active!');

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

		// Prompt the user to enter whether this cell should be markdown or code
		const markdownOrCode = await vscode.window.showInputBox({
			placeHolder: 'Enter "markdown" or "code"',
			prompt: 'Would you like the cell to be a markdown or code cell?',
		});

		if (!markdownOrCode) {
			return;
		} else if (markdownOrCode !== 'markdown' && markdownOrCode !== 'code') {
			vscode.window.showErrorMessage('Invalid entry! Please enter either "markdown" or "code."');
			return;
		}
	  
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
			  cell_type: markdownOrCode,
			  source: [result],
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

	context.subscriptions.push(vscode.commands.registerCommand('JupyterCompanion.addNewCell', addNewCell));
}

export function deactivate() {}
