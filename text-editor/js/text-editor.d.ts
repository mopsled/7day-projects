/// <reference path="jquery/jquery.d.ts" />
declare class TextEditor {
    element: JQuery;
    constructor(selector: string);
    loadSavedContent(): void;
}
