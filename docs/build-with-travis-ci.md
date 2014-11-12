# Build with Travis CI

A (public) Github repository can easily be build automatically with [Travis CI](https://travis-ci.org):

1. [Enable your project in Travis CI](https://travis-ci.org/getting_started). 
2. [Configure Travis](http://docs.travis-ci.com/user/build-configuration/#.travis.yml-file%3A-what-it-is-and-how-it-is-used) using `.travis.yml` to automatically run our tests and create a build:

		# .travis.yml
		language: node_js
		node_js:
		- '0.10'
		before_install:
		- npm install -g bower
		- bower install
    	script: npm run test && npm run build

## Automatically deploy to Github Pages

We can use Travis to automatically publish our build to [Github Pages](https://pages.github.com/).
Whenever changes are pushed to a Github repository's gh-pages branch, Github automatically deploys these.

1. [Create a gh-pages branch](https://help.github.com/articles/creating-project-pages-manually/).
2. [Generate an access token](https://help.github.com/articles/creating-an-access-token-for-command-line-use/). Since we don't want to manually update this branch every time we make changes, we'll use Travis to automate this. We'll use the token to grant Travis permission to push to our project's repository. Tip: Store the token somewhere safe.
3. [Install Travis encrypter](http://docs.travis-ci.com/user/encryption-keys/) by running `gem install travis`. We need to encrypt our token to keep it safe.
4. **Encrypt the gh-token** and add it to your configure file by running:

		travis encrypt -r username/projectname GH_TOKEN=YoUrToKeN1VZHg5PRfEeRS4F8NbtmuTbTX8kQ3yG --add env.global
		
	Your `.travis.yml` should now contain an `env.global.secure` value.
		
5. **Trigger deploy to gh-pages**. The `lib/travis-to-gh-pages.sh` uses the encrypted token to push Travis build to the gh-pages branch. To trigger this script we add this to our Travis configuration:
	
		# .travis.yml
		# ...
    	script: npm run test && npm run build && ./lib/travis-to-gh-pages.sh
    	env:
    	  global:
    	    secure: eNcRyPtEdGhToKeNaSaVeRyLoNgStRiNg
    	    
    Note: The deploy script also generates a README with a link to the published project on username.github.io/projectname.
    
    Note: By default [Github Pages ignores all files and directories starting with an underscore](https://help.github.com/articles/files-that-start-with-an-underscore-are-missing/). To prevent this the deploy script adds a `.nojekyll` file to gh-pages.
