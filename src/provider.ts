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

  getChildren(element?: LanguageData): Thenable<LanguageData[]> {
    if (element) {
      return Promise.resolve(element.files.map((v) => new LanguageData(v)));
    }
    return this.getLanguages();
  }

  private async getLanguages(): Promise<LanguageData[]> {
    const toLang = ({
      name,
      color,
      size,
      files,
      percentage,
    }: LanguageDataBase): LanguageData => {
      return new LanguageData(name, {
        color,
        size,
        percentage,
        files,
        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
      });
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
  files: string[] = [];

  contextValue = 'language';

  constructor(
    public readonly name: string,
    public readonly options?: {
      color: string;
      size: number;
      percentage: string;
      files: string[];
      collapsibleState: vscode.TreeItemCollapsibleState;
    },
  ) {
    super(name, options?.collapsibleState);

    this.tooltip = name;

    if (options) {
      this.description = `${options.percentage}% - ${options.size} bytes`;
      this.files = options.files;
    }
  }
}
