(function(doc){
	'use strict';

	var isCapableBrowser = ('classList' in doc.documentElement);
	if(!isCapableBrowser){ return; }

	var moduleId = doc.querySelector('[data-module]').getAttribute('data-module');
	var components = doc.querySelectorAll('[data-component]');

	annotateComponents();

	if(window.location.href.indexOf('annotate') > 0){ toggleAnnotations(true); }
	window.toggleAnnotations = toggleAnnotations;
	//toggleAnnotations();

	// setup two-way communication with parent frame
	if(window.top) {
		window.addEventListener('load', function (event) {
			var path = window.location.pathname;
			window.top.postMessage({
				moduleId: moduleId
			}, '*');
		}, false);

		window.addEventListener('message', function(event) {
			var message = event.data;
			if(message.fromViewer && message.showAnnotations !== undefined){
				toggleAnnotations(message.showAnnotations);
			}
		});
	}

	function annotateComponents() {
		[].forEach.call(components, function(component){
			var name = component.getAttribute('data-component');
			var label = doc.createElement('a');
			label.innerHTML = name;
			label.href = '{{ paths.root }}components/' + name + '/' + name + '-preview.html';
			label.classList.add('debug-label');
			component.appendChild(label);
		});
	}

	function toggleAnnotations(show) {
		[].forEach.call(components, function(component){
			component.classList.toggle('debug-component', show);
		});
	}
}(document));