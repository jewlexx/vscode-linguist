export interface LinguistOutput {
  [key: string]: Script;
}

export interface Script {
  size: number;
  percentage: string;
  files: string[];
}

export interface LanguageDataBase extends Script {
  name: string;
}
