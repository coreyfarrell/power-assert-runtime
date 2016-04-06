'use strict';

delete require.cache[require.resolve('..')];
var SuccinctRenderer = require('..');
var AssertionRenderer = require('power-assert-renderer-assertion');
var assert = require('../../../test_helper/empowered-assert');
var transpile = require('../../../test_helper/transpile');
var testRendering = require('../../../test_helper/test-rendering');

describe('SuccinctRenderer', function () {

    it('assert(foo === bar)', function () {
        var foo = 'foo';
        var bar = 'bar';
        testRendering(function () {
            eval(transpile('assert(foo === bar)'));
        }, [
            '',
            'assert(foo === bar)',
            '       |       |   ',
            '       "foo"   "bar"',
        ], [AssertionRenderer, SuccinctRenderer]);
    });

    it('StringLiteral: assert(foo === "bar")', function () {
        var foo = 'foo';
        testRendering(function () {
            eval(transpile('assert(foo === "bar")'));
        }, [
            '',
            'assert(foo === "bar")',
            '       |             ',
            '       "foo"         ',
        ], [AssertionRenderer, SuccinctRenderer]);
    });
});