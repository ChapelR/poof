(function () {
    'use strict';

    window.poof = window.poof || {};

    function handleNotLoadedScript (name) {
        // do something here
        console.error('Script: "' + name + '" is not loaded...');
        return false;
    }

    function hasScript (gl) {
        if (!window[gl]) {
            // an external script is missing or not loaded
            return handleNotLoadedScript(gl);
        }
        return true;
    }

    function twArchive () {
        return $(document.createDocumentFragment())
            .append(document.createTextNode($('tw-storydata')[0].outerHTML)).text();
    }

    function createPDF (name) {
        var loaded = hasScript('html2pdf');
        if (loaded) {
            // uses html2pdf to create a pdf doc from our DOM output
            // we need to un-collapse all the source code to prevent cutoffs
            var $html = $(document.documentElement);
            var collapsedState = $('#main').hasClass('collapse');
            var nightState = $html.hasClass('night');
            var $target = $('#main').removeClass('collapse');
            $('.passage-footer').addClass('hide');
            $(document.documentElement).removeClass('night');
            // show filtered out passages
            var toRevert = poof.filter.clear();
            // do the thing
            html2pdf($target[0], { filename : name, margin : 2 }).then( function () {
                if (collapsedState) {
                    // if the source was collapsed, make it so again
                    $target.addClass('collapse');
                }
                if (nightState) {
                    // re-add night mode state
                    $html.addClass('night');
                }
                // revert filtering display if necessary
                if (toRevert && Array.isArray(toRevert) && toRevert.length) {
                    poof.filter.revert(toRevert);
                }
                $('.passage-footer').removeClass('hide');
            });
        }
    }

    function safeName (str) {
        return str.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .trim();
    }

    function createDownload (fileExt) {
        var loaded = hasScript('download');
        if (loaded) {
            // creates downloads for user exports
            if (!window.poof) {
                // if we can't access poof, something went horribly wrong
                console.error('Cannot find generated content output!');
                return;
            }
            var fileName = safeName(poof.data.name) + '.' + fileExt;

            if (fileExt === 'txt') {
                // download the plain text twee format
                download(poof.twee(), fileName, 'text/plain;charset=utf-8');
            } else if (fileExt === 'html') {
                // download this single page web app
                download(document.documentElement.outerHTML, fileName, 'text/html;charset=utf-8');
            } else if (fileExt === 'pdf') {
                // download a pdf for printing and sharing
                createPDF(fileName);
            } else { // 'archive'
                fileName = fileName + '.html';
                download(twArchive(), fileName, 'text/html;charset=utf-8');
            }
        }
    }

    window.poof.hasScript = hasScript;

    window.poof.export = {
        archive : twArchive,
        PDF : createPDF
    };

    window.poof.createDownload = createDownload;

}());