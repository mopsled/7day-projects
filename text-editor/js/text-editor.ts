/// <reference path="jquery/jquery.d.ts" />

$(document).ready(function() {
	var textEditor = new TextEditor('#text-editor');
});

class TextEditor {
	static localStorageKey = 'text-editor-content';
	element: JQuery;
	
	constructor(selector: string) {
		this.element = $(selector);

		this.element.blur(function() {
			localStorage.setItem(localStorageKey, this.innerHTML);
		});

		this.loadSavedContent();
	}

	loadSavedContent() {
		var savedContent = localStorage.getItem(localStorageKey);
		if (savedContent) {
			this.element.html(savedContent);
		}
	}
}