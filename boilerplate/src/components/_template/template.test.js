// Unit test for MODULE_NAME component
// Mocha and Chai are always included
'use strict';

var MODULE_NAME_PASCAL = require('./MODULE_NAME');

var instance;
var fixture = document.createElement('ANY');

describe('MODULE_NAME component', function() {

    beforeEach('create instance', function() {
        instance = new MODULE_NAME_PASCAL(fixture);
    });

    it('should cover each custom method', function() {
        (typeof instance.customMethod).should.equal('function');
        //instance.customMethod(/* stub input */).should.equal(/* expected output */);
    });
});
