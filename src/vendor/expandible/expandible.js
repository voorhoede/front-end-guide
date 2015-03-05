//noinspection ThisExpressionReferencesGlobalObjectJS
/**
 * Turns `element` into an expandible component and gives it the `enhancedClass`.
 * The nested element with the `handleSelector` property controls the component.
 * The handle is triggered by click or enter key of focus and toggles the state
 * of the component. When state is expanded the `expandedClass` is added.
 * The component has support for keyboard and assistive technologies using ARIA properties.
 */
(function (root, factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) {
		define([
			'airhooks/forEach',
			'airhooks/containsClass',
			'airhooks/addClass',
			'airhooks/removeClass',
			'airhooks/addEventListener',
			'airhooks/removeEventListener'
		], factory);
	} else {
		root.Expandible = factory(
			airhooks.forEach,
			airhooks.containsClass,
			airhooks.addClass,
			airhooks.removeClass,
			airhooks.addEventListener,
			airhooks.removeEventListener
		);
	}
}(this, function (forEach, containsClass, addClass, removeClass, addEventListener, removeEventListener) {
	'use strict';
	var doc = document;
	var KEY_CODES = {
		ENTER: 13,
		SPACE: 32
	};

	/**
	 * @constructor
	 * @param {HTMLElement} [element] - If no element is provided all elements with `[data-expandible]` are used.
	 * @param {Object} [options]
	 * @param {String} [options.handleSelector=[data-expandible-handle]]
	 * @param {String} [options.expandedClass=is-expanded]
	 * @param {Boolean} [options.openOnFocus] - When true component expands on focus. Defaults to data-expandible-open-on-focus attribute value.
	 * @param {Boolean} [options.closeOnBlur] - When true component collapses on blur. Defaults to data-expandible-close-on-blur attribute value.
	 * @returns {Expandible|Expandible[]}
	 */
	function Expandible (element, options) {
		// only enhance if modern element selectors are supported
		if(!('querySelectorAll' in doc)){ return element; }
		if(element) {
			this.init(element, options);
		} else {
			var elements = doc.querySelectorAll('[data-expandible]');
			forEach(elements, function(element){
				new Expandible(element, options);
			});
			return Expandible.instances;
		}
	}

	Expandible.instances = [];

	/**
	 * Construct component by extending HTML elements and binding event listeners.
	 * @param {HTMLElement} [element] - (See constructor)
	 * @param {Object} [options] - (See constructor)
	 */
	Expandible.prototype.init = function(element, options) {
		// define component properties
		this.element = element;
		this.settings = extend(this.getDefaults(element), options);
		this.handles = element.querySelectorAll(this.settings.handleSelector);
		this.handle = this.handles[0]; // primary handle
		this.content = element.querySelector(this.settings.contentSelector);
		this.isExpanded = containsClass(element, this.settings.expandedClass);

		// register instance,link elements & bind events
		this.register();
		this.link();
		this.bind();

		// mark element as enhanced
		this.element.isExpandible = true;
		this.element.expandible = this;
		addClass(element, this.settings.enhancedClass);

		return this;
	};

	/**
	 * Removes all dom changes and event listeners added by this component.
	 * @returns {HTMLElement|*}
	 */
	Expandible.prototype.destroy = function () {
		this.unregister();
		this.unlink();
		this.unbind();

		// remove enhanced states
		this.element.removeAttribute('isExpandible');
		this.element.removeAttribute('expandible');
		removeClass(this.element, this.settings.enhancedClass);

		return this.element;
	};

	Expandible.prototype.getDefaults = function(element) {
		return  {
			contentSelector: '[data-expandible-content]',
			handleSelector: '[data-expandible-handle]',
			actionAttribute: 'data-expandible-handle',
			enhancedClass: 'is-expandible',
			expandedClass: 'is-expanded',
			openOnFocus: element.getAttribute('data-expandible-open-on-focus'),
			closeOnBlur: element.getAttribute('data-expandible-close-on-blur')
		};
	};

	Expandible.prototype.register = function() {
		Expandible.instances.push(this);
	};

	Expandible.prototype.unregister = function() {
		var index = indexOf(Expandible.instances, this);
		if(index >= 0) {
			Expandible.instances.splice(index, 1);
		}
	};

	/**
	 * Link content and handles using ARIA roles and set initial states (hidden & expanded).
	 * If elements have no IDs, we create unique ones first.
	 * @returns {Expandible}
	 */
	Expandible.prototype.link = function() {
		var component = this;
		// assign IDs
		this.id = this.content.id = this.content.id || 'expandible-' + Expandible.instances.length;
		this.handle.id = this.handle.id || this.id + '-handle';
		// link content elements
		this.content.setAttribute('role', 'region');
		this.content.setAttribute('aria-labelledby', component.handle.id);
		this.content.setAttribute('aria-hidden', !component.isExpanded);
		// link handles
		forEach(this.handles, function(handle){
			handle.setAttribute('role', 'button');
			handle.setAttribute('aria-controls', component.content.id);
			handle.setAttribute('aria-expanded', component.isExpanded);
		});
		return this;
	};

	/**
	 * Remove all (ARIA) attributes added to link the component's content & handles.
	 * @returns {Expandible}
	 */
	Expandible.prototype.unlink = function() {
		this.content.removeAttribute('role');
		this.content.removeAttribute('aria-labelledby');
		this.content.removeAttribute('aria-hidden');
		// link handles
		forEach(this.handles, function(handle){
			handle.removeAttribute('role');
			handle.removeAttribute('aria-controls');
			handle.removeAttribute('aria-expanded');
		});
		return this;
	};

	/**
	 * @returns {Expandible} - Returns this instance for chainability.
	 */
	Expandible.prototype.bind = function() {
		var component = this;
		// link content elements
		forEach(this.handles, function(handle){
			// make handle focusable
			handle.setAttribute('tabindex', 0);

			// prevent navigating away by default link behavior
			addEventListener(handle, 'click', function(event) {
				event.preventDefault();
			});

			// toggle on mousedown, enter and space key
			addEventListener(handle, 'mousedown', function(event){
				event.preventDefault();
				var action = handle.getAttribute(component.settings.actionAttribute);
				component[action].call(component);
			});
			addEventListener(handle, 'keydown', function(event) {
				if (event.keyCode === KEY_CODES.ENTER || event.keyCode === KEY_CODES.SPACE) {
					event.preventDefault();
					component.toggle.call(component);
				}
			});
			// open on focus?
			if(component.settings.openOnFocus) {
				addEventListener(handle, 'focus', function(/*event*/){
					component.open.call(component);
				});
				if(handle.hasFocus){ component.open(); }
			}
		});
		// link handles
		return this;
	};

	Expandible.prototype.unbind = function() {
		forEach(this.handles, function(handle) {
			handle.removeAttribute('tabindex');
		});
		// @todo remove event listeners
	};

	/**
	 * @param {Boolean} [isExpanded] - Element expands when true. Defaults to inverse state.
	 * @returns {Boolean} isExpanded - Returns true when element is expanded.
	 */
	Expandible.prototype.toggle = function(isExpanded) {
		var component = this, element = this.element, settings = this.settings;
		isExpanded = (isExpanded !== undefined) ? isExpanded : !component.isExpanded;
		if(isExpanded){ addClass(element, settings.expandedClass); } else { removeClass(element, settings.expandedClass); }
		forEach(this.handles, function(handle){
			handle.setAttribute('aria-expanded', isExpanded);
		});
		this.content.setAttribute('aria-hidden', !isExpanded);
		component.isExpanded = isExpanded;
		var allNodes = doc.querySelectorAll('*');

		function closeIfOutside(event){
			var target = event.target;
			var isInsideElement = (target === element || childOf(target, element));
			// @todo we now have multiple handles, check if it's none of them.
			var isHandle = (target === component.handle || childOf(target, component.handle));
			if(!isInsideElement && !isHandle) {
				component.close(component);
				removeEventListener(this, 'mousedown', closeIfOutside);
				forEach(allNodes, function(node){
					removeEventListener(node, 'focus', closeIfOutside);
				});
			}
		}
		if(isExpanded && settings.closeOnBlur) {
			addEventListener(doc.body, 'mousedown', closeIfOutside);
			forEach(allNodes, function(node){
				// @todo: check if doing this on 'all nodes' has performance impact.
				addEventListener(node, 'focus', closeIfOutside);
			});
		}

		return isExpanded;
	};

	/**
	 * Convenience method to expand element using `toggle` method.
	 * @returns {Boolean} isExpanded - Returns true when element is expanded.
	 */
	Expandible.prototype.open = function () {
		return this.toggle(true);
	};

	/**
	 * Convenience method to collapse element using `toggle` method.
	 * @returns {Boolean} isExpanded - Returns true when element is expanded.
	 */
	Expandible.prototype.close = function () {
		return this.toggle(false);
	};

	/**
	 * Helper method for Array.prototype.indexOf
	 * [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
	 * @param {Array} array
	 * @param {*} item
	 * @param {Number} [fromIndex]
	 * @returns {Number}
	 */
	function indexOf(array, item, fromIndex) {
		fromIndex = fromIndex || 0;
		var nativeIndexOf = Array.prototype.indexOf;
		if(nativeIndexOf && array.indexOf === nativeIndexOf) {
			return array.indexOf(item, fromIndex);
		} else {
			for(var index = fromIndex, length = array.length; index < length; index++){
				if(array[index] === item){ return index; }
			}
			return -1;
		}
	}

	/**
	 * Shallow extend first object with properties of a second object.
	 * @param {Object} obj1
	 * @param {Object} obj2
	 */
	function extend(obj1, obj2) {
		for (var prop in obj2) {
			if (obj2.hasOwnProperty(prop)) {
				obj1[prop] = obj2[prop];
			}
		}
		return obj1;
	}

	/**
	 * Returns true if child is a descendant of parent.
	 * Borrowed from: http://stackoverflow.com/a/18162093
	 * @param {HTMLElement} child
	 * @param {HTMLElement} parent
	 * @return {Boolean}
	 */
	function childOf(child, parent){
		//noinspection StatementWithEmptyBodyJS
		while((child=child.parentNode) && child !== parent);
		return !!child;
	}

	return Expandible;
}));