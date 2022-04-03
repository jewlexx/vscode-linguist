import * as vscode from 'vscode';
import { LanguageColors, LinguistOutput, LanguageDataBase } from './types';
import { execa } from 'execa';
import axios from 'axios';

export class LanguageDataProvider
  implements vscode.TreeDataProvider<LanguageData>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    LanguageData | undefined | void
  > = new vscode.EventEmitter<LanguageData | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<LanguageData | undefined | void> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: LanguageData): vscode.TreeItem {
    return element;
  }

  getChildren(): Thenable<LanguageData[]> {
    return this.getLanguages();
  }

  private async getLanguages(): Promise<LanguageData[]> {
    const toLang = ({
      name,
      color,
      size,
      percentage,
    }: LanguageDataBase): LanguageData => {
      return new LanguageData(
        name,
        color,
        size,
        percentage,
        vscode.TreeItemCollapsibleState.None,
      );
    };

    const wf = vscode.workspace.workspaceFolders?.[0].uri.path;

    if (!wf) {
      return [];
    }

    const linguistFile =
      'https://raw.githubusercontent.com/ozh/github-colors/master/colors.json';
    const { data: file } = await axios.get<LanguageColors>(linguistFile);
    const r = await execa('github-linguist', [wf, '--json', '-b']);

    const output: LinguistOutput = JSON.parse(r.stdout);

    return Object.keys(output)
      .map((v) => ({
        name: v,
        ...output[v],
        language: v,
        color: file[v].color || '#FFFFFF',
      }))
      .map(toLang);
  }
}

export class LanguageData extends vscode.TreeItem {
  constructor(
    public readonly name: string,
    public readonly color: string,
    public readonly size: number,
    public readonly percentage: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(name, collapsibleState);

    this.tooltip = name;
    this.description = `${percentage}% - ${size} bytes`;
  }

  contextValue = 'language';
}
