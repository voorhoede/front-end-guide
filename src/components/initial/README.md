# initial component
Within initial.js we define our async asset loading workflow.

## loadCSS
The [loadCSS](https://github.com/filamentgroup/loadCSS) function is used for async loading of css files.

## Modified Grunticon loader
The Grunticon loader is used to detect if a browser supports data uris and/or svg. Based on the outcome we load a svg data uri icon stylesheet or a png data uri icon stylesheet. The file paths are defined in `components/asset-loader/asset-loader.html`.

## Cutting the mustard
We define a feature test which defines if a browser is capable of executing the javascript. By default this is set to supporting `querySelector`. Adjust the `isCapableBrowser` variable according to your project requirements.

## loadJS
We use the [loadJS](https://github.com/filamentgroup/loadJS) function to asynchronously load in javascript files.

## Setting cookies
For the first page visit we asynchronously load in css files. After loading the css through javascript we set a cookie, which is read out server side for subsequent page visits. The name for the cookies are set in `components/asset-loader/asset-loader.html`. The cookie names are also used in the Apache conditional regular expressions. For the subsequent page visits we leverage browser caching and the css files are not loaded in through javascript, see `components/asset-loader/asset-loader.html`.