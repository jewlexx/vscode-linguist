import { load, load as loadYaml } from 'js-yaml';
import { LinguistConfig } from './types.d';
import { mkdir, rm, stat, writeFile } from 'fs/promises';
import * as vscode from 'vscode';
import axios from 'axios';
import { LanguageDataProvider } from './provider';

const url =
  'https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml';

export async function activate(ctx: vscode.ExtensionContext) {
  const storage = ctx.storageUri?.path ?? '';
  const path = storage + '/languages.yml';
  const info = await stat(path).catch(() => undefined);

  let config: LinguistConfig;

  if (info === undefined || info.mtimeMs - Date.now() > 8.64e7) {
    const output = (await axios.get<string>(url)).data;
    const jsonOutput = loadYaml(output, {
      json: true,
      filename: 'linguist.yml',
    }) as any;

    await mkdir(storage, {
      recursive: true,
    }).catch(() => {});
    await writeFile(path, JSON.stringify(jsonOutput));

    config = jsonOutput;
  } else {
    const configFile = await vscode.workspace.fs.readFile(
      vscode.Uri.file(path),
    );

    config = JSON.parse(configFile.toString());
  }

  const provider = new LanguageDataProvider(ctx, config);
  vscode.window.registerTreeDataProvider('languages', provider);
}

export function deactivate() {}
