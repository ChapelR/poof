(function () {
    'use strict';

    window.poof = window.poof || {};

    // parse config passage

    var configPassageName = 'poof.config';

    var $configPassage = $('tw-storydata').find('tw-passagedata[name="' + configPassageName + '"]');

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
            globals : []
        };
        var data = $configPassage.text() || '{ "noConfig" : true }';
        try {
            data = JSON.parse(data);
            Object.assign(settings, data);
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