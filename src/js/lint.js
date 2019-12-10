(function () {
    'use strict';

    window.poof = window.poof || {};

    var configFormat = '';
    var configFormatVersion = '';

    // handle config format settings, which will override the internal data pull
    if (poof.config.format && typeof poof.config.format === 'object') {
        if (poof.config.format.name && typeof poof.config.format.name === 'string') {
            configFormat = poof.config.format.name
                .toLowerCase()
                .trim();
            if (configFormat === 'harlow') {
                // in my experience, people often forget the 'e'
                configFormat = 'harlowe';
            }
        }
        if (poof.config.format.version && typeof poof.config.format.version === 'string') {
            configFormatVersion = poof.config.format.version
                .toLowerCase()
                .trim();
        } else if (configFormat) {
            // got a format override but no version, so default to something
            if (configFormat === 'sugarcube' || configFormat === 'harlowe') {
                // default to major version 2:
                configFormatVersion = '2.x';
            } else {
                // default to major version 1:
                configFormatVersion = '1.x';
            }
        }
    }

    // get format data
    function getFormat () {
        var format = configFormat || ($('tw-storydata').attr('format'))
            .toLowerCase()
            .trim();
        var version = configFormatVersion || ($('tw-storydata').attr('format-version'))
            .toLowerCase()
            .trim();
        var major = version.split('.')[0];

        return {
            name : format,
            version : version,
            major : major,
            sexy : (function () {
                if (format === 'sugarcube') {
                    // camel case SC
                    return 'SugarCube';
                }
                // uppercase it otherwise
                return format.charAt(0).toUpperCase() + format.slice(1);
            }())
        };
    }

    // linting options and setup
    var options = {
        // to my knowledge, all formats use strict mode for user scripts
        strict  : 'implied',
        // report use of undefined vars
        undef   : true,
        // environment set up (browser + allow alert and console)
        browser : true,
        devel   : true
    };

    // SugarCube 1 JavaScript globals
    var sc1Globals = [
        // vendor
        '$',
        'jQuery',
        // APIs
        'macros',
        'state',
        'tale',
        'SaveSystem',
        'UISystem',
        // globals
        'strings',
        'config',
        'prehistory',
        'predisplay',
        'prerender',
        'postrender',
        'postdisplay',
        'options',
        'setup',
        // functions
        'either',
        'lastVisited',
        'passage',
        'previous',
        'random',
        'randomFloat',
        'tags',
        'turns',
        'visited',
        'visitedTags'
    ];

    // SugarCube 2 JavaScript globals
    var sc2Globals = [
        // vendor
        '$',
        'jQuery',
        // APIs
        'State',
        'Macro',
        'Config',
        'Engine',
        'LoadScreen',
        'Passage',
        'Setting',
        'Save',
        'Story',
        'UI',
        'UIBar',
        'Dialog',
        'Template',
        'SimpleAudio',
        // globals
        'l10nStrings',
        'setup',
        'settings',
        'postdisplay',
        'postrender',
        'predisplay',
        'prerender',
        'prehistory',
        // functions
        'clone',
        'either',
        'forget',
        'hasVisited',
        'lastVisited',
        'importScripts',
        'importStyles',
        'memorize',
        'passage',
        'previous',
        'random',
        'randomFloat',
        'recall',
        'setPageElement',
        'tags',
        'temporary',
        'time',
        'turns',
        'variables',
        'visited',
        'visitedTags'
    ];

    // Harlowe 1 & 2 JavaScript globals
    var hlGlobals = [
        // vendor
        '$',
        'jQuery'
    ];

    // Snowman JavaScript globals
    var sm1Globals = [
        // vendor
        '$',
        'jQuery',
        '_',
        // APIs
        'story',
        'passage'
    ];

    var sm2Globals = [
        // vendor
        '$',
        'jQuery',
        '_',
        // APIs
        'story',
        'passage',
        // functions
        'either',
        'hasVisited',
        'visited',
        'renderToSelector',
        'getStyles'
    ];

    var cbGlobals = [
        'browser',
        'config',
        'engine',
        'now',
        'passage',
        'random',
        'sound',
        'story',
        // advanced
        'history',
        'state',
        'process',
        'output'
    ];

    var format = getFormat();

    function objectify (arr) { // lol
        var ret = {};
        Fast.forEach(arr, function (el) {
            ret[el] = false;
        });
        return ret;
    }

    function getGlobals () {
        if (format.name === 'sugarcube') {
            if (format.major === '1') {
                return objectify(sc1Globals);
            } else {
                return objectify(sc2Globals);
            }
        }
        if (format.name === 'snowman') {
            if (format.major === '1') {
                return objectify(sm1Globals);
            } else {
                return objectify(sm2Globals);
            }
        }
        if (format.name === 'harlowe') {
            return objectify(hlGlobals);
        }
        if (format.name === 'chapbook') {
            return objectify(cbGlobals);
        }
        return {}; // no globals
    }

    window.poof.format = format;
    window.poof.lint = {
        objectify : objectify,
        options : options,
        globals : getGlobals()
    }; 

}());