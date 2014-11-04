angular.module('app', ['config', 'ngSanitize'])
/**
 * Viewer Controller
 * Controls dimensions (width & height) of the viewer so user can preview a component in
 * different viewport (frame) sizes. Also adds shortcuts for predefined breakpoints (XS, S, M, L)
 * and enables user to toggle additional info of the active (selected) component.
 */
	.controller('ViewerController', function($scope, $timeout, $window, ROOT_PATH, MODULES){
		'use strict';
		/* jshint validthis: true */
		var viewer = this;
		viewer.autoWidth = true;
		viewer.breakpoints = [
			{ name: 'XS', width: 320, icon: 'mobile' },
			{ name: 'S', width: 520, icon: 'tablet' },
			{ name: 'M', width: 620, icon: 'laptop' },
			{ name: 'L', width: 960, icon: 'desktop' }
		];
		viewer.showAnnotations = false;
		viewer.modules = {};
		viewer.frame = document.querySelector('[data-viewer-frame]');
		viewer.getModulePath = getModulePath;
		viewer.header = document.querySelector('[data-viewer-header]');
		viewer.height = setAutoHeight();
		viewer.setWidth = setWidth;
		viewer.showInfo = false;
		viewer.toggleAnnotations = toggleAnnotations;
		viewer.toggleAutoWidth = toggleAutoWidth;
		viewer.width = setAutoWidth();
		viewer.rootPath = ROOT_PATH;

		MODULES.forEach(function(module){
			viewer.modules[module.id] = module;
		});
		setDefaultModule();
		$timeout(function(){ setAutoHeight(); }, 0);
		angular.element($window).bind('resize', setDimensions);

		window.addEventListener('message', function(event){
			var message = event.data;
			if(viewer.modules.hasOwnProperty(message.moduleId)){
				viewer.module = viewer.modules[message.moduleId];
				$scope.$apply();
			}
		}, false);

		function getModulePath() {
			if(!viewer.module || !viewer.module.path){ return ''; }
			return ROOT_PATH + viewer.module.path;
		}

		/**
		 * Sets viewer's height to the full available height (window minus offset by header).
		 * @returns {Number} height of the viewer frame in pixels (but excluding unit)
		 */
		function setAutoHeight() {
			var frameOffset = viewer.frame.getBoundingClientRect().top;
			viewer.height = window.innerHeight - frameOffset;
			return viewer.height;
		}

		/**
		 * Sets viewer's width to the full available (window) width.
		 * @returns {Number} width of the viewer frame in pixels (but excluding unit)
		 */
		function setAutoWidth() {
			viewer.width = window.innerWidth;
			return viewer.width;
		}

		/**
		 * Sets viewer to component to the one named in the location hash
		 * or otherwise defaults to first one in list of components.
		 * @returns {Object} component
		 */
		function setDefaultModule() {
			var id = window.location.hash.substr(1);
			var activeModule;
			if(viewer.modules.hasOwnProperty(id)){
				activeModule = viewer.modules[id];
			} else {
				var firstKey = Object.keys(viewer.modules)[0];
				activeModule = viewer.modules[firstKey];
			}
			$timeout(function(){
				viewer.module = activeModule;
			}, 0);
			return viewer.module;
		}

		/**
		 * Set height & width of the viewer according to settings.
		 * @returns { {height: number, width: number} } dimensions in pixels (but excluding units)
		 */
		function setDimensions() {
			if(viewer.autoWidth){
				setAutoWidth();
			}
			setAutoHeight();
			$scope.$apply();
			return {
				height  : viewer.height,
				width   : viewer.width
			};
		}

		/**
		 * Set viewer to given width (in pixels).
		 * @param {Number} width    desired width in pixels.
		 * @returns {Number} width  in pixels (but excluding unit)
		 */
		function setWidth(width) {
			viewer.autoWidth = false;
			viewer.width = width;
			return width;
		}

		/**
		 * Send message to iframe content to toggle annotations.
		 */
		function toggleAnnotations() {
			viewer.showAnnotations = !viewer.showAnnotations;
			viewer.frame.contentWindow.postMessage({
				fromViewer: true,
				showAnnotations: viewer.showAnnotations
			}, '*');
		}

		/**
		 * Turns auto width property on/off. When turned on, width is also changed directly.
		 * @returns {Boolean} true if auto width is on
		 */
		function toggleAutoWidth() {
			viewer.autoWidth = !viewer.autoWidth;
			if(viewer.autoWidth){
				setAutoWidth();
			}
			return viewer.autoWidth;
		}

		$scope.$watch(function() {
			if(!viewer.module) { return false; }
			return viewer.module.id;
		}, function(id) {
			if(id) {
				window.location.hash = id;
				viewer.showAnnotations = false;
			}
		});
	});