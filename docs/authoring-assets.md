# Authoring assets

To encourage module based development the front-end guide allows you to place assets on the app, view and component level. All assets will be bundled into `dist/assets/` during the build process. All you need to do is place them in a directory called `assets/`: 

	src/assets/*						 	>> dist/assets/
	src/components/my-component/assets/*	>> dist/assets/components/my-component/
	src/components/my-view/assets/*			>> dist/assets/views/my-view/

## Optimising assets

Assets which should be optimised before copied to the distribution directory, should be placed in the `raw-assets/` directory rather than the `assets/` directory. These assets will be optimised and placed into `assets/` by running:

	$ npm run build-assets

This task is not triggered automatically by the regular build/watch tasks since they only need to run when raw assets are added. The optimised assets are under version control and will therefore be directly available to others.

### Images

Images which should be optimised should be placed in a `raw-assets/images/` directory, either on an app, view or component level. Images in these directories will be processed using [imagemin](https://github.com/imagemin/imagemin#imagemin--) and placed into a relative `assets/images/` directory:

	src/assets-raw/images/img.png                           >> src/assets/images/img.png
	src/components/my-component/assets-raw/images/img.png   >> src/components/my-component/assets/images/img.png
	src/views/my-view/assets-raw/images/img.png             >> src/views/my-view/assets/images/img.png
	
### Icons

Original icons in SVG format should be placed in a `assets-raw/icons/` directory, either on an app, view or component level. Icons in these directories will be processed into sprites and data-uri's using [iconizr](https://github.com/jkphl/iconizr). An SVG and PNG sprite will be placed into a relative `assets/icons/` directory. The data-uri's for both SVG and PNG will be wrapped in LESS variables and placed into a relative `assets/styles/` directory. These can be used as follows:

	```css
	// src/components/app-icons/app-icons/less""
	@import (reference) "styles/icons-svg-data";

	.icon-battery {
    	display: block;
    	width: 50px;
    	content: @svg-ic_battery_30_18px;
	}
	```

## Using assets

Since the path to the asset in the distribution files is different from the source, the front-end guide comes with a few helpers. For this we'll use an example asset `demo-logo.svg` which is part of the app-logo component and therefore placed in `src/components/app-logo/assets/demo-logo.svg`. The asset will eventually be copied to `dist/assets/components/app-logo/demo-logo.svg`.

### Asset in template

To use the asset in a template use the [**`paths.assets`** variable](authoring-templates.md#template-variables) which resolves to the relative web path (the `dist/assets/` directory). Example:

	```html
	
		<img src="{{ paths.assets }}components/app-logo/demo-logo.svg" alt="demo">
	```

### Asset in stylesheet

Tu use the asset in a stylesheet use the **`@{pathToAssets}`** [global variable](http://lesscss.org/usage/#using-less-in-the-browser-globalvars) inside the string of the relative asset path. Example:

	```css
	
		// src/components/app-logo/app-logo.less
		.app-logo {
			background-image: "@{pathToAssets}components/app-logo/demo-logo.svg";
		} 
		
	```
	
## Watch assets

All source files in the `assets/` directories are watched by the watch task and automatically copied to the distribution directory when changed. You can use this feature by running:

	$ npm run watch


