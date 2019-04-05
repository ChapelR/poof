(function () {
    'use strict';

    window.poof = window.poof || {};

    // parse config passage

    var configPassageName = 'poof.config';

    var $configPassage = $('tw-storydata').find('tw-passagedata[name="' + configPassageName + '"]');

    var validFontSizes = ['very small', 'small', 'normal', 'large', 'very large'];
    var validFonts = ['serif', 'sans-serif', 'monospace'];

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
            }
        };
        var data = $configPassage.text() || '{ "noConfig" : true }';
        try {
            data = JSON.parse(data);
            Object.assign(settings, data);
            if (!validFonts.includes(settings.pdf.font)) {
                settings.pdf.font = 'sans';
            }
            if (!validFontSizes.includes(settings.pdf.fontSize)) {
                settings.pdf.fontSize = 'normal';
            }
            if (settings.pdf.lineHeight < 1) {
                settings.pdf.lineHeight = 1;
            }
            if (settings.pdf.lineHeight > 2) {
                settings.pdf.lineHeight = 2;
            }
        } catch (err) {
            console.warn('Config passage was not parsed:', err);
            alert("Poof couldn't parse your config passage, check the console for more information.");
        } finally {
            console.log('Poof Settings Loaded', settings);
            return settings;
        }
    }());

    // remove the config passage
    $configPassage.remove();

    // export the config settings
    window.poof.config = config;

}());