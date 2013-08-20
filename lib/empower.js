/**
 * empower.js - Empower your assertions
 *
 * https://github.com/twada/empower
 *
 * Copyright (c) 2013 Takuto Wada
 * Licensed under the MIT license.
 *   https://raw.github.com/twada/empower/master/MIT-LICENSE.txt
 *
 * A part of extend function is:
 *   Copyright 2012 jQuery Foundation and other contributors
 *   Released under the MIT license.
 *   http://jquery.org/license
 */
(function (root, factory) {
    'use strict';

    // using returnExports UMD pattern
    if (typeof define === 'function' && define.amd) {
        define(['./power-assert-formatter'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('./power-assert-formatter'));
    } else {
        root.empower = factory(root.powerAssertFormatter);
    }
}(this, function (defaultFormatter) {
    'use strict';

    var config = {
        formatter: defaultFormatter
    };


    // borrowed from qunit.js
    function extend (a, b) {
        var prop;
        for (prop in b) {
            if (b.hasOwnProperty(prop)) {
                if (typeof b[prop] === 'undefined') {
                    delete a[prop];
                } else {
                    a[prop] = b[prop];
                }
            }
        }
        return a;
    }


    function enhance (baseAssert, formatter, callback) {
        var events = [];

        function PowerAssertContext (arg) {
            this.context = arg;
        }

        function capture (value, kind, location) {
            events.push({value: value, kind: kind, location: location});
            return value;
        }

        function expr (result, location, content) {
            var captured = events;
            events = [];
            return new PowerAssertContext({result: result, location: location, content: content, events: captured});
        }

        var powerOk = function (value, message) {
            if (value instanceof PowerAssertContext) {
                var context = value.context,
                    powerAssertText;
                if (!context.result) {
                    if (typeof callback === 'function') {
                        callback(context, message);
                    } else {
                        powerAssertText = formatter.format(context).join('\n');
                        baseAssert.ok(context.result, message ? message + ' ' + powerAssertText : powerAssertText);
                    }
                } else {
                    baseAssert.ok(context.result, message);
                }
            } else {
                baseAssert.ok(value, message);
            }
        };

        return {
            ok: powerOk,
            capture: capture,
            expr: expr
        };
    }


    function empowerAssertObject (assertObject, options) {
        extend(config, (options || {}));
        var origAssertObject = extend({}, assertObject);
        var coreApi = enhance(origAssertObject, config.formatter);
        extend(assertObject, coreApi);
        return assertObject;
    }


    function empowerAssertFunction (baseAssert, options) {
        extend(config, (options || {}));
        var coreApi = enhance(baseAssert, config.formatter);

        var powerAssert = function powerAssert (context, message) {
            coreApi.ok(context, message);
        };
        powerAssert.config = config;

        [
            'ok',
            'capture',
            'expr'
        ].forEach(function (name) {
            if (typeof coreApi[name] === 'function') {
                powerAssert[name] = coreApi[name];
            }
        });

        [
            'fail',
            // 'ok',   // use empowered ok function
            'equal',
            'notEqual',
            'deepEqual',
            'notDeepEqual',
            'strictEqual',
            'notStrictEqual',
            'throws',
            'doesNotThrow',
            'ifError'
        ].forEach(function (name) {
            if (typeof baseAssert[name] === 'function') {
                powerAssert[name] = baseAssert[name];
            }
        });

        return powerAssert;
    }


    function empower (assert, options) {
        switch (typeof assert) {
        case 'function':
            return empowerAssertFunction(assert, options);
        case 'object':
            return empowerAssertObject(assert, options);
        default:
            throw new Error('Cannot be here');
        }
    }

    empower.enhance = enhance;

    return empower;
}));
