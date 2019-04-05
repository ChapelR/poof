(function (){
    'use strict';

    window.poof = window.poof || {};
    window.poof.init = window.poof.init || {};

    function showOverlay () {
        // show the overlay and shrink the output element
        $('#overlay').removeClass('hide');
        $('#main').addClass('smallify');
    }

    function hideOverlay () {
        $('#overlay').addClass('hide');
        $('#main').removeClass('smallify');
    }

    function creditLink (text, site, license) {
        return poof.el('li', { classes : 'credit-link' }, [
            poof.el('a', { href : site, target : '_blank' }, text),
            ' (' + license + ') '
        ]);
    }

    function generateCredits () {
        var a = creditLink;
        return poof.el('ul', { id : 'credits' }, [
            a('twinejs', 'http://twinery.org/', 'GPL-3.0'),
            a('pdfmake', 'http://pdfmake.org/', 'MIT'),
            a('download.js', 'http://danml.com/download.html', 'CC-BY-4.0'),
            a('jshint', 'https://jshint.com/', 'MIT'),
            a('highlight.js', 'https://highlightjs.org/', 
                "<a href='https://github.com/highlightjs/highlight.js/blob/master/LICENSE' target='_blank'>License</a>"),
            a('highlightjs-line-numbers.js', 'https://wcoder.github.io/highlightjs-line-numbers.js/', 'MIT'),
            a('jQuery', 'https://jquery.com/', 'MIT'),
            a('normalize.css', 'https://necolas.github.io/normalize.css/', 'MIT'),
            a('pure.css', 'https://purecss.io/', 'BSD')
        ]);
    }

        /*** LOADER ***/

    $(document).on(':load-open', function () {
        showOverlay();
        $('.pure-menu').addClass('hide');
        $('#story-stylesheet #story-javascript').addClass('hide');
        $('#overlay').find('.loader').removeClass('hide');
    });

    $(document).on(':load-close', function () {
        hideOverlay();
        $('.pure-menu').removeClass('hide');
        $('#overlay').find('.loader').addClass('hide');
    });

    $(document).on(':sort-start :filter-start :pdf-export-start', function () {
        $(document).trigger(':load-open');
    });
    $(document).on(':sort-complete :filter-complete :pdf-export-complete', function () {
        $(document).trigger(':load-close');
    });

        /*** MENUS ***/

    function menuInit () {
        /*
            here we'll handle all of our menu options
        */

        // about 
        $('#about').on('click', function () {
            var $byline = poof.el('p', {}, $('body').attr('data-byline') + '.');
            var $version = poof.el('p', {}, 'Version: ' + $('body').attr('data-version'));
            var $creditsP = poof.el('p', {}, 'Open Source Software Credits: ');
            var $credits = generateCredits();
            var $cancel = poof.btn.normal('Dismiss', function () {
                poof.modal.close();
            });
            poof.modal.write('About poof', [$byline, $version, $creditsP, $credits], $cancel);
        }).attr('title', 'About this story format.');

        // export menu
        $('#twee-export').on('click', function () {
            poof.createDownload('txt');
        }).attr('title', 'Export to plain text in Twee notation.');
        $('#html-export').on('click', function () {
            poof.createDownload('html');
        }).attr('title', 'Save this HTML view for sharing and later use.');
        $('#pdf-export').on('click', function () {
            poof.createDownload('pdf');
        }).attr('title', 'Export to PDF format for printing or sharing.');
        $('#archive-export').on('click', function () {
            poof.createDownload('archive');
        }).attr('title', 'Export to a Twine 2 archive HTML file.');

        // view menu
        $('#night').on('click', function () {
            // toggle night mode (light text on dark)
            $(document.documentElement).toggleClass('night');
        }).attr('title', 'Toggle night mode.');
        $('#simple').on('click', function () {
            // toggle the simplified view (default is a more material-inspired view)
            $('#content').toggleClass('simple');
        }).attr('title', 'Toggle a simpler view mode.');
        $('#line-no').on('click', function () {
            // toggle line numbers
            $('td.hljs-ln-numbers').toggleClass('hide');
        }).attr('title', 'Toggle whether to show line numbers.');
        $('#collapse').on('click', function () {
            // controls whether long text nodes are given a max-height and scrollbars
            $('#main').toggleClass('collapse');
        }).attr('title', 'Toggle whether to use a scrollbar for lengthy text.');
        $('#passages').on('click', function () {
            // the main passage view
            hideOverlay();
            $('#story-stylesheet').addClass('hide');
            $('#story-javascript').addClass('hide');
        }).attr('title', 'View your passages.');
        $('#javascript').on('click', function () {
            // view the story javascript area code
            showOverlay();
            $('#story-stylesheet').addClass('hide');
            $('#story-javascript').removeClass('hide');
            if (JSHINT) {
                $('#lint')
                    .removeClass('pure-button-disabled')
                    .attr('title', 'Check your JavaScript code for errors.');
            }
        }).attr('title', 'View your JavaScript code.');
        $('#stylesheet').on('click', function () {
            // view the story stylesheet
            showOverlay();
            $('#story-stylesheet').removeClass('hide');
            $('#story-javascript').addClass('hide');
        }).attr('title', 'View your stylesheet.');

        // tools menu
        $('#tools-filter').on('click', function () {
            poof.tools.filter();
        }).attr('title', 'Filter the displayed passages.');
        $('#tools-sort').on('click', function () {
            poof.tools.sort();
        }).attr('title', 'Sort the displayed passages.');
        $('#tools-find').on('click', function () {
            poof.tools.find();
        }).attr('title', 'Find a specific passage by title.');

        // comments menu
        $('#comments-export').on('click', function () {
            poof.comments.export();
        }).attr('title', 'Export comments to file.');
        $('#comments-import').on('click', function () {
            poof.comments.importer();
        }).attr('title', 'Import comments from a file.');
        
    }

    window.poof.init.menu = menuInit;

}());