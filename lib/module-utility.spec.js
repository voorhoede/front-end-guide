var mu = require('./module-utility');

describe('module utility', function () {

	var skip = mu.skipQuestions,
		rep = mu.replaceAnswers,
		questions = [
			{name:'one', value:1},
			{name:'two', value:2},
			{name:'three', value:3}
		];

	describe('skipQuestions()', function () {
			var answer1 = 'one',
			answer3 = 'three',
			answers = ['one','two','three'];

		it('returns an array', function () {
			expect(Array.isArray(skip(questions))).toBe(true);
		});
		it('removes question objects from array', function () {
			expect(skip(questions, answer1).length).toBe(2);
			expect(skip(questions, answer1, answer3).length).toBe(1);
			expect(skip(questions, answers).length).toBe(0);
		});
	});

	describe('replaceAnswers', function () {
		var answers = {
				one: 1,
				two: 2,
				three: 3
			},
			answer1 = {name:'one',value: 99},
			answer2 = {name:'two',value:'horseRadish'},
			answer3 = {name:'three', value:/^REGEXisForMONKEYS$/};

		it('returns an object', function () {
			expect(typeof rep(answers)).toBe('object');
		});

		it('replaces answers with given replacements', function () {
			expect(rep(answers, answer1).one).toBe(99);
			expect(rep(answers, answer1, answer2).two).toBe('horseRadish');
			expect(rep(answers).three).toBe(3);
		});

		it('throws an exceptions when a bad value is provided', function () {
			expect(function () {
				rep(['foo']);
			}).toThrow();
		});

		it('returns the same number of answers that went in', function () {
			expect(Object.keys(rep(answers,answer1,answer2,answer3)).length).toBe(3);
			expect(Object.keys(rep(answers,answer1,answer2)).length).toBe(3);
			expect(Object.keys(rep(answers)).length).toBe(3);
		});
	});
	xdescribe('checkFilesExist',function () {
		var create = mu.checkFilesExist;
		var files = ['html','less','js','md'];
		it('accepts an Array as first argument', function () {
			expect(function () {
				create(files);
			}).not.toThrow();
		})
		it('returns a promise', function () {
			expect(typeof create(files)).toBe('object');
		});
	});
	describe('listDirectories', function () {
		beforeEach(function () {
			var done = false;
		})
		var list = mu.listDirectories,
			path1 = 'src/components/',
			path2 = 'src/views/';

		it('asynchronously returns something', function () {
			//well, not really
		});
	});
	describe('getMissingFileTypes', function () {
		var miss = mu.getMissingFileTypes,
		filterFiles = miss(['html','less','js','md'], {
			files:[
				'app-header.html',
				'app-header.js',
				'app-header.less',
				'app-header.test.js'
			]
		});
		it('returns an array', function () {
			expect(Array.isArray(filterFiles)).toBe(true);
		});

	});
});