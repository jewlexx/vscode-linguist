import * as vscode from 'vscode';
import { LanguageDataProvider } from './provider';

export async function activate(ctx: vscode.ExtensionContext) {
  const wf = vscode.workspace.workspaceFolders?.[0].uri.path;

  if (!wf) {
    return;
  }

  let provider = new LanguageDataProvider();
  vscode.window.registerTreeDataProvider('languages', provider);
}

export function deactivate() {}
