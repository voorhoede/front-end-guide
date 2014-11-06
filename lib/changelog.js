var changelog = require('conventional-changelog');
var paths = require('../config').paths;
var pkg = require('../package.json');
var fs = require('fs');

/**
 * Fires the conventional changelog command, creating a new changelog with features added and bugs
 * fixed since the last version increment.
 *
 * @param {String} location - location of changelog file to write to
 */
function createChangelog(location) {

	var logContent,
		logLocation;

	logLocation = location ? location : paths.changelog;

	changelog({
		version:pkg.version,
		repository: pkg.repository.url
	},function changelogCallback(err, log) {
		if(err){
			throw err;
		}
		if(fs.existsSync(logLocation)){
			fs.readFile(logLocation, function readLogCallback(err,res) {
				if(err){
					throw err;
				}
				var newLogHeading = log.substr(0, log.indexOf('\n') - 1);
				var previousLogHeading = res.toString().substr(0, log.indexOf('\n') - 1);
				if(previousLogHeading === newLogHeading){
					console.log('version has not changed since last changelog creation');
					return;
				}
				logContent = [log, res].join('\n');
				fs.writeFile(paths.changelog, logContent, function writeChangelogCallback(err) {
					if(err){
						throw err;
					}
					console.log('wrote to changelog');
				});
			});
		}else{
			console.warn('unable to locate changelog!');
		}
	});
}
module.exports = createChangelog;