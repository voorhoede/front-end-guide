/*
 Fonts are loaded through @font-face rules in the CSS whenever an element references them.
 FontFaceObserver creates a referencing element to trigger the font request, and listen for font load events.
 When all fonts are loaded, we enable them by adding a class to the html element
 */
(function( w ){
	'use strict';

	// if the class is already set, we're good.
	if( w.document.documentElement.className.indexOf( "fonts-loaded " ) > -1 ){
		return;
	}

	var sourceSansProRegularFont = new w.FontFaceObserver( "source_sans_pro", {
			weight: 400
		}),
		sourceSansProSemiBoldFont = new w.FontFaceObserver( "source_sans_pro", {
			weight: 700
		});

	w.Promise
		.all([
			sourceSansProRegularFont.check(),
			sourceSansProSemiBoldFont.check()
		])
		.then(
			function(){
				w.document.documentElement.className += " fonts-loaded";
				setCookie('fonts-loaded', true, 4);
			},
			function () {
				console.log('err while observing font');
			}
		);

	function setCookie(name, value, days) {
		if (typeof useCookie === 'undefined') {
			// if value is a false boolean, we'll treat that as a delete
			if (value === false) {
				days = -1;
			}
			var expires;
			if (days) {
				var date = new Date();
				date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
				expires = "; expires=" + date.toGMTString();
			}
			else {
				expires = "";
			}
			window.document.cookie = name + "=" + value + expires + "; path=/";
		}
	}

}( window ));