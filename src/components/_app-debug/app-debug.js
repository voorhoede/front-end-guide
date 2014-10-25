(function(doc){
	'use strict';

	var isCapableBrowser = ('classList' in doc.documentElement);
	if(!isCapableBrowser){ return; }

	var components = doc.querySelectorAll('[data-component]');

	annotateComponents();

	if(window.location.href.indexOf('debug') > 0){ toggleDebug(); }
	window.debug = toggleDebug;
	//toggleDebug();

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

	function toggleDebug() {
		[].forEach.call(components, function(component){
			component.classList.toggle('debug-component');
		});
	}
}(document));