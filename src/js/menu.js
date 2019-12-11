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
        // utility for the credits links below
        return poof.el('li', { classes : 'credit-link' }, [
            poof.el('a', { href : site, target : '_blank' }, text),
            ' (' + license + ') '
        ]);
    }

    function generateCredits () {
        var a = creditLink;
        // nice and simple
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
        // show the loading screen; hide everything
        showOverlay();
        $('.pure-menu').addClass('hide');
        $('#story-stylesheet #story-javascript').addClass('hide');
        $('#overlay').find('.loader').removeClass('hide');
    });

    $(document).on(':load-close', function () {
        // an event to close the load screen
        hideOverlay();
        $('.pure-menu').removeClass('hide');
        $('#overlay').find('.loader').addClass('hide');
    });

    // some tools should show the loader while processing to prever user interaction
    $(document).on(':sort-start :filter-start :pdf-export-start', function () {
        $(document).trigger(':load-open');
    });
    $(document).on(':sort-complete :filter-complete :pdf-export-complete', function () {
        $(document).trigger(':load-close');
    });

        /*** MENUS ***/

    function menuInit () {
        var menu = poof.util.menu;
        /*
            here we'll handle all of our menu options
        */

        // about 
        menu('#about', 'About this story format.', function () {
            // generate the credits modal
            var $byline = poof.el('p', {}, $('body').attr('data-byline') + '.');
            var $version = poof.el('p', {}, 'Version: ' + $('body').attr('data-version'));
            var $creditsP = poof.el('p', {}, 'Open Source Software Credits: ');
            var $credits = generateCredits();
            var $cancel = poof.btn.normal('Dismiss', function () {
                poof.modal.close();
            });
            poof.modal.write('About poof', [$byline, $version, $creditsP, $credits], $cancel);
        });

        // export menu
        menu('#twee-export', 'Export to plain text in Twee notation.', function () {
            poof.createDownload('txt');
        });
        menu('#pdf-export', 'Export to PDF format for printing or sharing.', function () {
            poof.createDownload('pdf');
        });
        menu('#archive-export', 'Export to a Twine 2 archive HTML file.', function () {
            poof.createDownload('archive');
        });
        menu('#json-export', 'Export passage data to JSON. JavaScript, CSS, and story metadata are omitted.', function () {
            poof.createDownload('json');
        });

        // config menu
        $('#night').on('click', function () {
            // toggle night mode (light text on dark)
            poof.viewModes.dark($(this));
        }).attr('title', 'Toggle night mode.');
        $('#simple').on('click', function () {
            // toggle the simplified view (default is a more material-inspired view)
            poof.viewModes.simple($(this));
        }).attr('title', 'Toggle a simpler view mode.');
        $('#line-no').on('click', function () {
            // toggle line numbers
            poof.viewModes.lineNo($(this));
        }).attr('title', 'Toggle whether to show line numbers.');
        $('#collapse').on('click', function () {
            // controls whether long text nodes are given a max-height and scrollbars
            poof.viewModes.textHt($(this));
        }).attr('title', 'Toggle whether to use a scrollbar for lengthy text.');

        // view menu
        menu('#passages', 'View your passages.', function () {
            // the main passage view
            hideOverlay();
            $('#story-stylesheet').addClass('hide');
            $('#story-javascript').addClass('hide');
        });
        menu('#javascript', 'View your JavaScript code.', function () {
            // view the story javascript area code
            showOverlay();
            $('#story-stylesheet').addClass('hide');
            $('#story-javascript').removeClass('hide');
            if (JSHINT) {
                $('#lint')
                    .removeClass('pure-button-disabled')
                    .attr('title', 'Check your JavaScript code for errors.');
            }
        });
        menu('#stylesheet', 'View your stylesheet.', function () {
            // view the story stylesheet
            showOverlay();
            $('#story-stylesheet').removeClass('hide');
            $('#story-javascript').addClass('hide');
        });

        // tools menu
        menu('#tools-filter', 'Filter the displayed passages.', function () {
            poof.tools.filter(); // opens a modal
        });
        menu('#tools-sort', 'Sort the displayed passages.', function () {
            poof.tools.sort(); // opens a modal
        });
        menu('#tools-find', 'Find a specific passage by title.', function () {
            poof.tools.find(); // opens a modal
        });
        $('#tools-starting', 'Locate the starting passage.', function () {
            poof.tools.starting(); // scrolls the page
        });

        // comments menu
        menu('#comments-export', 'Export comments to file.', function () {
            poof.comments.export(); // opens a modal
        });
        $('#comments-import', 'Import comments from a file.', function () {
            poof.comments.importer(); // opens a modal
        });
        
        // filter clearing
        $(document.body).append(poof.el('button', { 
            id : 'clear-filters', 
            label : 'Clear all current filters.',
            classes : 'pure-button pure-button-primary'
        }, 'Clear Filters')
            .on('click', function () {
                $(document).trigger(':filter-start');
                poof.filter.clear();
                $(document).trigger(':filter-complete');
            })
            .hide());
    }

    $(document).on(':filter-start :filter-complete', function () {
        var $clear = $('button#clear-filters');
        if ($('.passage-card.hide').length) {
            $clear.show();
        } else {
            $clear.hide();
        }
    });

    window.poof.init.menu = menuInit;

}());