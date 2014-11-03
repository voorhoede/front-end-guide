define(['expandible'], function(Expandible){
	'use strict';
	var menu = document.querySelector('[data-search-menu]');
	//console.log('menu', menu);
	return new Expandible(menu);
});