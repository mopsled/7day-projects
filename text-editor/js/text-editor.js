$(document).ready(function() {
	var editable = $('#editable');

	editable.blur(function() {
		localStorage.setItem('contenteditable', this.innerHTML);
	});

	var savedContent = localStorage.getItem('contenteditable');
	if (savedContent) {
		editable.html(savedContent);
	}
});