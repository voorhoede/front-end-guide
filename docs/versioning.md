# Versioning

Semantic versioning is used to keep track of changes in the project, in accordance with
[Semantic Versioning 2.0.0](http://semver.org/). You find the current version of the project in
`package.json` in the property ***version***.

A task to increase the version number is included for your convenience: `./lib/release.js`. This
task will also create a tagged commit and push to origin if you choose to do so.

You can run this task like so:

	$ node ./lib/release.js [increment]

***increment*** can be either patch, minor or major.

- If you don't enter an increment argument, the task will prompt you for the type of increment.
- After specifying the increment, you'll have the opportunity to write a commit message. The default
value is the new version number, which you can include by typing `%s` in the message body.
- After confirming the commit message, you'll be asked if you want to push the newly created tag to
the repository's remote. By default, nothing will be pushed.

If you decide go for the push option, the tag will be pushed to repository's remote. The command
that is executed to accomplish this, is `git push --tags`. Meaning that only the tag(s) will be pushed.
Other (regular) commits will still have to be pushed "manually".

*Release* is also available as npm task. You execute it like this: `npm run release[:increment]`.
Again, calling this task without an argument, will start a prompt asking you for the intended
version increment.

> Notice: the release task will only be able to do its thing when your working directory is clean.
> If it's not, the task will fail with an error.