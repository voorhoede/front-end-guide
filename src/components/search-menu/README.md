# search-menu component

As a minimal version this menu is a link to the search page.
In an enhanced version the link opens a search widget on the page, saving the user from a page refresh.

## Requirements menu as link

 * Use `[rel="search"]` to indicate link to search page.
 * Use human friendly url (like https://demo-project.com/**search**) to hep user understand where they are (going to).
 * Use assistive text for screen readers as they won't understand the icon.

## Requirements menu as widget

* Use native form elements (`<form>`,`<input>`,`<button>`, ...) so browsers & devices can show appropriate controls (eg. keyboard) and form will always be able to submit (regardless of JavaScript).
* Use `GET` method so user can read query and share results using the url.
* All form fields must have an associated label. Labels should only ever be visually hidden, but never entirely hidden from browser.
* Submit button must have an assistive text for screen readers as they won't understand the icon.

## Open Search

Using the [Open Search Protocol](http://www.opensearch.org) a website can make its own search engine accessible by other search engines like Google Search and Bing Search. This is just a matter of adding a file and a reference:

Add Open Search Description file (eg. `https://demo-project.com/open-search-desc.xml`):

	<?xml version="1.0" encoding="utf-8"?>
	<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/" 
			xmlns:moz="http://www.mozilla.org/2006/browser/search/">
		<ShortName>demo-project.com</ShortName>
		<Description>Search on demo-project.com</Description>
		<Language>en</Language>
		<SyndicationRight>open</SyndicationRight>
		<AdultContent>false</AdultContent>
		<InputEncoding>UTF-8</InputEncoding>
		<OutputEncoding>UTF-8</OutputEncoding>
		<Image height="32" width="32" type="image/x-icon">
			https://www.demo-project.com/img/favicon.png</Image>
		<Image height="57" width="57" type="image/png">
			https://www.demo-project.com/apple-touch-icon.png</Image>
		<Url type="text/html" method="get" 
			template="https://www.demo-project.com/zoeken?q={searchTerms}"/>
		<moz:SearchForm>https://www.demo-project.com/zoeken</moz:SearchForm>
		<Developer></Developer>
	</OpenSearchDescription>

Setup [search auto discovery](http://www.opensearch.org/Specifications/OpenSearch/1.1#Autodiscovery_in_HTML.2FXHTML):

    <link rel="search" type="application/opensearchdescription+xml" 
          href="open-search-desc.xml" title="Search on demo-project.com">
