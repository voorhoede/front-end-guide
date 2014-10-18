# social-share component

Share on social media using regular anchor tags (no JavaScript) to post messages by encoding parameters for title, text & source in the url. 

Based on [Static Social Share Patterns](https://gist.github.com/jbmoelker/5622933#static-social-share-patterns)

## Use in development

The share on social media anchors can be created using the macros inside this component:

	{% import "components/social-share/social-share.html" as share %}
	
	{{ share.twitter("http://example.com/my-page", "Read all about posting to social media using just anchor tags.") }}

