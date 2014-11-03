require([
	'fastclick',
	'views/_base-view/base-view'
], function(Fastclick){

	// enable fastclick app-wide (removing 300ms delay on tap on mobile)
	FastClick(document.body);
});