# Expandible

Turn plain markup into an interactive expandible component using just data-attributes or a JS API.

## Browser support

This project aims to support all browsers which support `querySelectorAll`. Since our Expandible component also requires a few methods which are not always natively supported, this component uses [Airhooks](https://github.com/voorhoede/airhooks) to help out with  (`Array.prototype.forEach`, `classList.add`, `classList.remove`, `EventTarget.addEventListener`, `EventTarget.removeEventListener`).


## Getting started

### Clone the repository

    $ git clone git@github.com:jbmoelker/tab-that.git
    
### Install dependencies

* [RequireJS](https://github.com/jrburke/requirejs-bower)
* [Airhooks](https://github.com/voorhoede/airhooks)

Install front-end dependencies using [Bower](https://github.com/bower/bower):

    $ bower install
    
Install dev dependencies using [Node NPM](http://nodejs.org/):

    $ npm install

## Usage

 ..

## To do

* Add 'hover intent'?
* Add docs generator (dgeni) ?
* Make items inside component non-focusable when collapsed or automatically expand.
* Add support for hasAttribute (DOM Level2 method), so we can simply write `data-expandible-open-on-focus` instead of `data-expandible-open-on-focus="true"`?
