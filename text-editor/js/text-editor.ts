/// <reference path="jquery/jquery.d.ts" />

$(document).ready(function() {
	var textEditor = new TextEditor('#text-editor');
	textEditor.setContent("int main() {\n\tprintf(\"Hello, world!\\n\");\n}");
});

class TextEditor {
	static localStorageKey = 'text-editor-content';
	element: JQuery;

	constructor(selector: string) {
		this.element = $(selector);

		// this.loadSavedContent();
		this.setUpAutoSave();
	}

	loadSavedContent() {
		var savedContent = localStorage.getItem(TextEditor.localStorageKey);
		if (savedContent) {
			this.element.html(savedContent);
		}
	}

	setUpAutoSave() {
		var that = this;
		(function(){
		    localStorage.setItem(TextEditor.localStorageKey, that.element.html());
		    setTimeout(arguments.callee, 1000);
		})();
	}

	setContent(content: string) {
		var formatter = new MultiFormatter(new LineFormatter, new TabFormatter);
		this.element.html(formatter.format(content));
	}
}

interface Formatter {
	format(content: string): string;
}

class MultiFormatter {
	formatters: Formatter[]
	constructor(...formatters: Formatter[]) {
	    this.formatters = formatters;
	}

	format(content: string) {
		for (var i in this.formatters) {
			content = this.formatters[i].format(content);
		}
		return content;
	}
}

class LineFormatter {
	format(content: string) {
		var lines = content.split(/\r?\n/);

		var formatted = "";
		for (var i in lines) {
			formatted += this.formatLine(lines[i]);
		}

		return formatted;
	}

	formatLine(content: string) {
		return "<div class=\"line\">" + content + "</div>";
	}
}

class TabFormatter {
	format(content: string) {
		content = content.replace(/\t/g, '&nbsp;&nbsp;')
		return content;
	}
}