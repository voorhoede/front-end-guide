# fixed-ratio component

The fixed-ratio component prevents unneeded page reflows on responsive images (and other media) by applying fixed ratio styles. 

Responsive images typically cause page reflows when the images are loaded. These page reflows are both [disorienting for the user](http://vimeo.com/68968681) and negatively impact page performance.

In the case of responsive images we can't remedy this issue by setting fixed dimensions as those change depending on viewport size.
We can however set a fixed ratio. The fixed-ratio component wraps content into and sets the ratio on the content as a `padding-bottom` value.

To apply this component the wrapping element must have a `fixed-ratio` class and the content itself a `.fixed-ratio-content`.
The ratio can be set per wrapping element using inline style `[style="padding-bottom:39.13%"]` or use a prefixed ratio like `.fixed-ratio-16x9`.

This component is inspired by [Responsive images performance problem case study](http://www.smashingmagazine.com/2013/09/16/responsive-images-performance-problem-case-study/).