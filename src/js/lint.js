(function () {
    'use strict';

    window.poof = window.poof || {};

    function getFormat () {
        var format = ($('tw-storydata').attr('format'))
            .toLowerCase()
            .trim();
        var version = ($('tw-storydata').attr('format-version'))
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
        'hasVisited',
        'lastVisited',
        'importScripts',
        'importStyles',
        'passage',
        'previous',
        'random',
        'randomFloat',
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
    var smGlobals = [
        // vendor
        '$',
        'jQuery',
        '_',
        // APIs
        'story',
        'passage'
    ];

    // TODO: chapbook, after it stabilizes

    var format = getFormat();

    function objectify (arr) {
        var ret = {};
        arr.forEach( function (el) {
            ret[el] = false; // global is not read only
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
            return objectify(smGlobals);
        }
        if (format.name === 'harlowe') {
            return objectify(hlGlobals);
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