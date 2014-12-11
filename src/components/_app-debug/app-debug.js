(function(doc){
	'use strict';

	var moduleId = doc.querySelector('[data-module]').getAttribute('data-module');
	var components = doc.querySelectorAll('[data-component]');

	annotateComponents();

	if(window.location.href.indexOf('annotate') > 0){ toggleAnnotations(true); }
	window.toggleAnnotations = toggleAnnotations;
	//toggleAnnotations();

	// setup two-way communication with parent frame
	if(window.top) {
		
		if (window.addEventListener) {

			window.addEventListener('load', function (event) {
				var path = window.location.pathname;
				window.top.postMessage({
					moduleId: moduleId
				}, '*');
			}, false);

			window.addEventListener('message', function(event){
				var message = event.data;
				if(message.fromViewer && message.showAnnotations !== undefined){
					toggleAnnotations(message.showAnnotations);
				}
			}, false);
		} else if (window.attachEvent)  {

			window.attachEvent('onload', function(event){
				var path = window.location.pathname;
				window.top.postMessage({
					moduleId: moduleId
				}, '*');
			});

			window.attachEvent('onmessage', function(event){
				toggleAnnotations();
			});
		}
	}


	function annotateComponents() {

		for(var index = 0, length = components.length; index < length; index++){
			var name = components[index].getAttribute('data-component');
			var label = doc.createElement('a');
			label.innerHTML = name;
			label.href = '{{ paths.root }}components/' + name + '/' + name + '-preview.html';
			addClass(label, 'debug-label' );
			components[index].appendChild(label);
		}

	}

	function toggleAnnotations(show) {


		for(var index = 0, length = components.length; index < length; index++){
			toggleClass(components[index], 'debug-component');
		}
	}

	/**
		IE8 DOM Helpers
		<cite>God, forgive me 'cause I've sin</cite>
	**/

	/**
	 * containsClass
	 * Borrowed from: http://hacks.mozilla.org/2010/01/classlist-in-firefox-3-6/
	 * @param {HTMLElement} element
	 * @param {String} className
	 */
	function containsClass (element, className) {
		if (document.documentElement.classList) {
			return element.classList.contains(className);
		} else {
			var re = new RegExp('(^|\\s)' + className + '(\\s|$)');
			return element.className.match(re);
		}
	}

	/**
	 * Borrowed from: http://hacks.mozilla.org/2010/01/classlist-in-firefox-3-6/
	 * @param {HtmlElement} element
	 * @param {String} className
	 */
	function addClass (element, className) {
		if (document.documentElement.classList) {
			element.classList.add(className);
		} else {
			if (!containsClass(element, className)) {
				element.className += (element.className ? ' ' : '') + className;
			}
		}
	}

	/**
	 * Borrowed from: http://hacks.mozilla.org/2010/01/classlist-in-firefox-3-6/
	 * @param {HtmlElement} element
	 * @param {String} className
	 */
	function removeClass (element, className) {
		if (document.documentElement.classList) {
			element.classList.remove(className);
		} else {
			var regexp = new RegExp('(^|\\s)' + className + '(\\s|$)', 'g');
			element.className = element.className.replace(regexp, '$2');
		}
	}

	/**
	 * Borrowed from: http://hacks.mozilla.org/2010/01/classlist-in-firefox-3-6/
	 * @param {HtmlElement} element
	 * @param {String} className
	 */
	function toggleClass (element, className){
		if (document.documentElement.classList) {
			return element.classList.toggle(className);
		} else {
			if (containsClass(element, className))
			{
				removeClass(element, className);
				return false;
			} else {
				addClass(element, className);
				return true;
			}
		}
	}
}(document));