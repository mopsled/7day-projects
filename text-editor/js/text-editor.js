/// <reference path="jquery/jquery.d.ts" />
$(document).ready(function () {
    var textEditor = new TextEditor('#text-editor');
    textEditor.setContent("int main() {\n\tprintf(\"Hello, world!\\n\");\n}");
});
var TextEditor = (function () {
    function TextEditor(selector) {
        this.element = $(selector);
        // this.loadSavedContent();
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
    TextEditor.prototype.setContent = function (content) {
        var formatter = new MultiFormatter(new LineFormatter, new TabFormatter);
        this.element.html(formatter.format(content));
    };
    TextEditor.localStorageKey = 'text-editor-content';
    return TextEditor;
})();
var MultiFormatter = (function () {
    function MultiFormatter() {
        var formatters = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            formatters[_i - 0] = arguments[_i];
        }
        this.formatters = formatters;
    }
    MultiFormatter.prototype.format = function (content) {
        for (var i in this.formatters) {
            content = this.formatters[i].format(content);
        }
        return content;
    };
    return MultiFormatter;
})();
var LineFormatter = (function () {
    function LineFormatter() {
    }
    LineFormatter.prototype.format = function (content) {
        var lines = content.split(/\r?\n/);
        var formatted = "";
        for (var i in lines) {
            formatted += this.formatLine(lines[i]);
        }
        return formatted;
    };
    LineFormatter.prototype.formatLine = function (content) {
        return "<div class=\"line\">" + content + "</div>";
    };
    return LineFormatter;
})();
var TabFormatter = (function () {
    function TabFormatter() {
    }
    TabFormatter.prototype.format = function (content) {
        content = content.replace(/\t/g, '&nbsp;&nbsp;');
        return content;
    };
    return TabFormatter;
})();
//# sourceMappingURL=text-editor.js.map