/// <reference path="jquery/jquery.d.ts" />
$(document).ready(function () {
    var textEditor = new TextEditor('#text-editor');
});
var TextEditor = (function () {
    function TextEditor(selector) {
        this.element = $(selector);
        this.loadSavedContent();
        this.setUpAutoSave();
    }
    TextEditor.prototype.loadSavedContent = function () {
        var savedContent = localStorage.getItem(TextEditor.localStorageKey);
        if (savedContent) {
            this.element.html(savedContent);
        }
    };
    TextEditor.prototype.setUpAutoSave = function () {
        var that = this;
        (function () {
            localStorage.setItem(TextEditor.localStorageKey, that.element.html());
            setTimeout(arguments.callee, 1000);
        })();
    };
    TextEditor.localStorageKey = 'text-editor-content';
    return TextEditor;
})();
//# sourceMappingURL=text-editor.js.map