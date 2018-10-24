(function () {
    'use strict';

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

    function createImporter (id) {
        return poof.el('label', { for : id }, [

            poof.el('a', {
                classes : 'pure-button pure-button-primary'
            }, 'Import a File'),

            poof.el('input', { id : id, type : 'file' }).on('change', function (ev) {
                $(document).trigger(':load-open');
                poof.modal.close();
                var file = ev.target.files[0];
                var reader = new FileReader();

                $(reader).on('load', function (ev) {
                    var target = ev.currentTarget;

                    if (!target.result) {
                        return;
                    }

                    try {
                        poof.comments.import(target.result);
                    } catch (err) {
                        console.warn(err);
                        alert('Something went wrong. Error code: "raven". Please report this bug at: https://github.com/ChapelR/poof/issues/new');
                        return;
                    } finally {
                        $(document).trigger(':load-close');
                    }
                });

                reader.readAsText(file);
            })
        ]);
    }

    function importComments () {
        poof.modal.write('Import Comments', createImporter('comment-file-importer'), 
            poof.btn.normal('Cancel', poof.modal.close));
    }

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
            a('html2pdf', 'https://github.com/eKoopmans/html2pdf', 'MIT'),
            a('download.js', 'http://danml.com/download.html', 'CC-BY-4.0'),
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

    $(document).on(':find-start :sort-start :filter-start', function () {
        $(document).trigger(':load-open');
    });
    $(document).on(':find-complete :sort-complete :filter-complete', function () {
        $(document).trigger(':load-close');
    });

        /*** MENUS ***/

    $(document).ready(function () {
        /*
            here we'll handle all of our menu options
            the about menu is mostly already handled via hrefs
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
            createDownload('txt');
        }).attr('title', 'Export to plain text in Twee notation.');
        $('#html-export').on('click', function () {
            createDownload('html');
        }).attr('title', 'Save this HTML view for sharing and later use.');
        $('#pdf-export').on('click', function () {
            createDownload('pdf');
        }).attr('title', 'Export to PDF format for printing or sharing.');
        $('#archive-export').on('click', function () {
            createDownload('archive');
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
            importComments();
        }).attr('title', 'Import comments from a file.');
        
    });

}());