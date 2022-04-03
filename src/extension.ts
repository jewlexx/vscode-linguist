import * as vscode from 'vscode';
import { LanguageDataProvider } from './provider';

export async function activate(ctx: vscode.ExtensionContext) {
  let provider = new LanguageDataProvider(ctx);
  vscode.window.registerTreeDataProvider('languages', provider);
}

export function deactivate() {}
