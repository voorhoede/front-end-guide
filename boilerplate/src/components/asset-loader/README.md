# asset-loader component
In the asset loader component we define some Apache conditionals, filepaths later used in `components/initial/initial.js`, a `useCookie` variable used on Node web servers and include `components/initial/initial.js`.

## Apache conditionals
We define some apache conditionals. During integration we need to replace this with server side conditionals. We read out cookies and based on the outcome we render certain stylesheets.

## Filepaths
We define some filepaths for the assets we want to load asynchronously. These are used in `components/initial/initial.js`.

## Usecookie variable
When running the front-end guide locally on a Node wes server we define a `useCookie` variable, so that in `components/initial/initial.js` cookies will never get set. On an Apache web server these will get left out and cookies are set. During integration leave this inline script out as well so cookies are set.

## Including initial.js
We include `components/initial/initial.js` as an inline script, which will load assets async and enhances capable browsers with javascript.