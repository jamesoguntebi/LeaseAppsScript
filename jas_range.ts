type Range = GoogleAppsScript.Spreadsheet.Range;
type Sheet = GoogleAppsScript.Spreadsheet.Sheet;

export default class JasRange {
  /**
   * Returns A1 notation for a range, including the sheet name, with fixed row
   * and fixed column.
   */
  static getFixedA1Notation(range: Range): string {
    new CellData(range); // To assert it is a single cell.
    const nonFixedA1 = range.getA1Notation();

    const sheet = range.getSheet().getName();
    const row = nonFixedA1.match(/[a-zA-Z]+/);
    const column = nonFixedA1.match(/[0-9]+/);
    
    return `'${sheet}'!$${row}$${column}`;
  }
}

export class CellData {
  private readonly data: unknown;

  constructor(private range: Range) {
    if (range.getHeight() !== 1 || range.getWidth() !== 1) {
      throw new Error ('CellData is invalid for multi-cell ranges.');
    }

    this.data = range.getValue();
  }

  isBlank(): boolean {
    return this.range.isBlank();
  }

  string(): string {
    if (this.isBlank() || typeof this.data !== 'string') {
      throw new Error('Expected string');
    }
    return this.data as string;
  }

  stringOptional(): string|undefined {
    return this.isBlank() ? undefined : this.string();
  }

  number(): number {
    if (this.isBlank() || typeof this.data !== 'number') {
      throw new Error('Expected number');
    }
    return this.data as number;
  }
}