# app-logo component

The app logo using descriptive & accessible markup with vector image and bitmap fallback:

* Uses vector image (SVG), so the logo is always crisp, including on high pixel density screens.
* Uses alternative text (`[alt="Demo"]`) so logo is accessible by search engines and assistive technologies.
* Sets image dimensions to optimize browser rendering (prevents re-render on image load).
* Uses lightweight bitmap image (PNG) as fallback for older browsers.
* Uses explicit inline fallback notation as it's descriptive, easy to change and has no dependencies.