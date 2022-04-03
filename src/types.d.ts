export interface LanguageColors {
  [key: string]: LinguistColors;
}

export interface LinguistColors {
  color: null | string;
}

export interface LinguistOutput {
  [key: string]: Script;
}

export interface Script {
  size: number;
  percentage: string;
}

export interface LanguageDataBase extends Script {
  name: string;
  color: string;
}
