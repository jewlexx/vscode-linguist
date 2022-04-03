import * as vscode from 'vscode';
import { LanguageDataProvider } from './provider';

export async function activate(_: vscode.ExtensionContext) {
  let provider = new LanguageDataProvider();
  vscode.window.registerTreeDataProvider('languages', provider);
}

export function deactivate() {}
