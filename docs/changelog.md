# Changelog

In `CHANGELOG.md` you'll find an overview of features and bug fixes. Every time you intend to 
release a new version (tag), you should update the changelog to include what has been done between 
the last time a version was released and the current HEAD commit. 

> If the package version for the is not different from the first tag heading found in the changelog, 
> the log will not be written.

Commit messages must adhere to the format described in [this](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/)
document to be parsed in the changelog. The npm task `npm run changelog` appends the relevant 
commits to the file CHANGELOG.md (only feat and fix are included), creating the file if it does not 
yet exist. This script's location is `lib/changelog.js`. 

After generating the changelog, you have the opportunity to modify it as you see fit. Do 
however refrain from editing the heading that displays the version. Example:
> \#\# 0.0.1 (2014-11-05)

This heading is used as a reference point to check if an update of the log needs to take place. If you
mess with it, expect to see duplicate entries in the changelog.

When you're done editing, you can commit the changes to the log and do `npm run release` to create 
and optionally push a tagged commit.