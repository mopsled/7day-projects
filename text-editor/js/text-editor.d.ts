/// <reference path="jquery/jquery.d.ts" />
declare class TextEditor {
    static localStorageKey: string;
    element: JQuery;
    constructor(selector: string);
    loadSavedContent(): void;
    setUpAutoSave(): void;
}
