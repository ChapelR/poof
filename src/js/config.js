(function () {
    'use strict';

    window.poof = window.poof || {};

    // parse config passage

    var configPassageName = 'poof.config';

    var $configPassage = $('tw-storydata').find('tw-passagedata[name="' + configPassageName + '"]');

    var validFontSizes = ['very small', 'small', 'normal', 'large', 'very large'];
    var validFonts = ['serif', 'sans-serif', 'monospace'];
    var validTweeSpec = [1, 2, 3];

    function enforceBool (bool) {
        return !!bool;
    }

    function handleStrings (str, lowerCase) {
        if (typeof str !== 'string') {
            str = String(str);
        }
        if (lowerCase) {
            str = str.toLowerCase();
        }
        return str.trim();
    }

    function handleNums (num) {
        if (typeof num !== 'number') {
            num = Number(num);
        }
        if (Number.isNaN(num)) {
            num = 0;
        }
        return num;
    }

    function handleArrays (arr) {
        if (!arr || !Array.isArray(arr)) {
            arr = [];
        }
        return arr;
    }

    /*
        Twee Spec:
            - default: add coordinate data in accordance with the upcoming spec.
            - classic: no coordinate data is included.
            - twee2: add coordinate data in the twee2 manner.
    */

    var config = (function () {
        var settings = {
            // meta options
            ignoreTag : 'poof.ignore',
            format : {
                name : '',
                version : ''
            },
            // appearance and view options
            simplified : false,
            lineNumbers : true,
            codeHeightLimit : true,
            nightMode : false,
            fonts : {
                main : '',
                code : ''
            },
            // linter options
            globals : [],
            pdf : {
                font : 'sans',
                fontSize : 'normal',
                lineHeight : 1.15
            },
            json : {
                pretty : 0,
                verbose : false
            },
            twee : 3,
            parse : true // whether to parse for passage references
        };
        var data = $configPassage.text() || '{ "noConfig" : true }';
        try {
            data = JSON.parse(data);
            Object.assign(settings, data);

            // enforce boolean properties
            settings.simplified = enforceBool(settings.simplified);
            settings.lineNumbers = enforceBool(settings.lineNumbers);
            settings.codeHeightLimit = enforceBool(settings.codeHeightLimit);
            settings.nightMode = enforceBool(settings.nightMode);
            settings.parse = enforceBool(settings.parse);
            settings.json.verbose = enforceBool(settings.json.verbose);

            // handle strings
            settings.ignoreTag = handleStrings(settings.ignoreTag);
            settings.format.name = handleStrings(settings.format.name);
            settings.format.version = handleStrings(settings.format.version);
            settings.fonts.main = handleStrings(settings.fonts.main);
            settings.fonts.code = handleStrings(settings.fonts.code);
            settings.pdf.font = handleStrings(settings.pdf.font, true);
            settings.pdf.fontSize = handleStrings(settings.pdf.fontSize, true);

            // handle numbers
            settings.pdf.lineHeight = handleNums(settings.pdf.lineHeight);
            settings.twee = Math.trunc(handleNums(settings.twee));
            settings.json.pretty = Math.trunc(handleNums(settings.json.pretty));

            // check for valid options
            if (!validFonts.includes(settings.pdf.font)) {
                settings.pdf.font = 'sans';
            }
            if (!validFontSizes.includes(settings.pdf.fontSize)) {
                settings.pdf.fontSize = 'normal';
            }
            if (!validTweeSpec.includes(settings.twee)) {
                settings.twee = 'default';
            }

            // enforce sensible limits
            if (settings.pdf.lineHeight < 1) {
                settings.pdf.lineHeight = 1;
            }
            if (settings.pdf.lineHeight > 2) {
                settings.pdf.lineHeight = 2;
            }
            if (settings.json.pretty > 8) {
                settings.json.pretty = 8;
            }
            if (settings.json.pretty < 0) {
                settings.json.pretty = 0;
            }

            // check globals
            settings.globals = handleArrays(settings.globals);
            settings.globals = Fast.map(Fast.filter(settings.globals, function (gl) {
                // make sure globals are valid identifiers
                return typeof gl === 'string' && (/[A-Za-z_$]/).test(gl[0]);
            }), function (gl) {
                // trim each global
                return handleStrings(gl);
            });

            // no twee spec yet, so enforce classic encoding mode
            if (!validTweeSpec.includes(settings.twee)) {
                return 1;
            }
        } catch (err) {
            console.warn('Config passage was not parsed:', err);
            alert("Poof couldn't parse your config passage, check the console for more information.");
        } finally {
            console.log('Poof Settings Loaded', settings);
            return settings;
        }
    }());

    function removeMe (obj, prop, val) {
        if (val === undefined) {
            if (!obj[prop]) {
                delete obj[prop];
            }
        } else {
            if (obj[prop] === val) {
                delete obj[prop];
            }
        }
    }

    function removeSubObj (obj, subObj) {
        var props = Object.keys(obj[subObj]);
        if (props.length) {
            if (props.every( function (p) {
                return p === undefined;
            })) {
                delete obj[subObj];
            }
        } else {
            delete obj[subObj];
        }
    }

    function configExport (cfg) {
        cfg = JSON.parse(JSON.stringify(cfg || config));
        
        removeMe(cfg.fonts, 'main', '');
        removeMe(cfg.fonts, 'code', '');
        removeSubObj(cfg, 'fonts');

        removeMe(cfg.format, 'name', '');
        removeMe(cfg.format, 'version', '');
        removeSubObj(cfg, 'format');

        if (!cfg.globals.length) {
            delete cfg.globals;
        }
        removeMe(cfg, 'twee', 3);
        removeMe(cfg, 'ingoreTag', 'poof.ignore');
        removeMe(cfg, 'parse', true);

        removeMe(cfg.pdf, 'font', 'sans');
        removeMe(cfg.pdf, 'fontSize', 'normal');
        removeMe(cfg.pdf, 'lineHeight', 1.15);
        removeSubObj(cfg, 'pdf');

        removeMe(cfg.json, 'pretty', 0);
        removeMe(cfg.json, 'verbose', false);
        removeSubObj(cfg, 'json');

        return JSON.stringify(cfg, null, 2);
    }

    // remove the config passage
    window.poof.configPassage = $configPassage.remove(); // save a reference for later

    // export the config settings
    window.poof.config = config;

    // config exporter
    window.poof.configExport = configExport;

}());