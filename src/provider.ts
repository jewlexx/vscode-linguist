import * as vscode from 'vscode';
import { execa } from 'execa';
import * as path from 'path';
import { icons } from './fileIcons';

import type { LinguistOutput, LanguageDataBase } from './types';

export class LanguageDataProvider
  implements vscode.TreeDataProvider<LanguageData>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    LanguageData | undefined | void
  > = new vscode.EventEmitter<LanguageData | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<LanguageData | undefined | void> =
    this._onDidChangeTreeData.event;

  constructor(private readonly ctx: vscode.ExtensionContext) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: LanguageData): vscode.TreeItem {
    return element;
  }

  getChildren(element?: LanguageData): Thenable<LanguageData[]> {
    if (element) {
      return Promise.resolve(
        element.files.map((v) => {
          const el = new LanguageData(this.ctx, v);

          el.command = {
            command: 'vscode.open',
            title: 'Open File',
            arguments: [v],
          };
          el.contextValue = 'file';

          return el;
        }),
      );
    }
    return this.getLanguages();
  }

  private async getLanguages(): Promise<LanguageData[]> {
    const toLang = ({
      name,
      size,
      files,
      percentage,
    }: LanguageDataBase): LanguageData => {
      return new LanguageData(this.ctx, name, {
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

    const r = await execa('github-linguist', [wf, '--json', '-b']);

    const output: LinguistOutput = JSON.parse(r.stdout);

    return Object.keys(output)
      .map((v) => ({
        name: v,
        ...output[v],
        language: v,
      }))
      .map(toLang);
  }
}

export class LanguageData extends vscode.TreeItem {
  files: vscode.Uri[] = [];

  contextValue = 'language';

  constructor(
    private readonly ctx: vscode.ExtensionContext,
    public readonly name: string | vscode.Uri,
    public readonly options?: {
      size: number;
      percentage: string;
      files: string[];
      collapsibleState: vscode.TreeItemCollapsibleState;
    },
  ) {
    super(name as any, options?.collapsibleState);

    if (typeof name === 'string') {
      this.label = name;
    }

    if (options) {
      const wf = vscode.workspace.workspaceFolders?.[0].uri.path ?? '';
      const uris = options.files.map((f) => vscode.Uri.file(path.join(wf, f)));

      this.description = `${options.percentage}%`;
      this.files = uris;
    }
  }

  get getIconPath(): vscode.Uri | undefined {
    // Return because it is a file not a language and vscode handles that already
    if (typeof this.name !== 'string') {
      return;
    }

    const name = this.name ?? 'file';

    const p = path.join(
      this.ctx.extensionPath,
      'resources',
      `${name.toLowerCase()}.svg`,
    );

    console.log(p);

    return vscode.Uri.file(p);
  }

  iconPath = this.getIconPath;
}
