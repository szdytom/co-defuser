export type LightColor = 'green' | 'red' | 'blue';

export interface CodeSet {
  codeMap: Record<string, string>;
  color: LightColor;
}

export interface SignalRule {
  allSymbols: string[];
  codeSets: CodeSet[];
}

export interface SignalPuzzle {
  challengeSymbols: string[];
  challengeCodes: string[];
  keyboardLayouts: string[][];
  codeSetIndex: number;
  lightColor: LightColor;
}
