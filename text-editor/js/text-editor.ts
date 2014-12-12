/// <reference path="jquery/jquery.d.ts" />

$(document).ready(function() {
	var textEditor = new TextEditor('#text-editor');
});

class TextEditor {
	static localStorageKey = 'text-editor-content';
	element: JQuery;

	constructor(selector: string) {
		this.element = $(selector);

		this.loadSavedContent();
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
}