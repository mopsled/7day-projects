/// <reference path="jquery/jquery.d.ts" />
$(document).ready(function () {
    var textEditor = new TextEditor('#text-editor');
});
var TextEditor = (function () {
    function TextEditor(selector) {
        this.element = $(selector);
        this.element.blur(function () {
            localStorage.setItem(localStorageKey, this.innerHTML);
        });
        this.loadSavedContent();
    }
    TextEditor.prototype.loadSavedContent = function () {
        var savedContent = localStorage.getItem(localStorageKey);
        if (savedContent) {
            this.element.html(savedContent);
        }
    };
    TextEditor.localStorageKey = 'text-editor-content';
    return TextEditor;
})();
//# sourceMappingURL=text-editor.js.map