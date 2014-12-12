/// <reference path="jquery/jquery.d.ts" />
declare class TextEditor {
    static localStorageKey: string;
    element: JQuery;
    constructor(selector: string);
    loadSavedContent(): void;
    setUpAutoSave(): void;
    setContent(content: string): void;
}
interface Formatter {
    format(content: string): string;
}
declare class MultiFormatter {
    formatters: Formatter[];
    constructor(...formatters: Formatter[]);
    format(content: string): string;
}
declare class LineFormatter {
    format(content: string): string;
    formatLine(content: string): string;
}
declare class TabFormatter {
    format(content: string): string;
}
