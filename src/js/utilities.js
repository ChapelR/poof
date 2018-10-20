(function () {
    'use strict';

    function createPDF (name) {
        // uses html2pdf to create a pdf doc from our DOM output

        // we need to un-collapse all the source code to prevent cutoffs
        var collapsedState = $('#main').hasClass('collapse');
        var $target = $('#main').removeClass('collapse');
        html2pdf($target[0], { filename : name, margin : 2 }).then( function () {
            if (collapsedState) {
                // if the source was collapsed, make it so again
                $target.addClass('collapse');
            }
        });
    }

    function createDownload (fileExt) {
        // creates downloads for user exports
        if (!window.poof) {
            // if we can't access poof, something went horribly wrong
            console.error('Cannot find generated content output!');
            return;
        }
        var fileName = poof.data.name + '.' + fileExt;

        if (fileExt === 'txt') {
            // download the plain text twee format
            download(poof.twee(), fileName, 'text/plain;charset=utf-8');
        } else if (fileExt === 'html') {
            // download this single page web app
            download($(document.documentElement)[0].outerHTML, fileName, 'text/html;charset=utf-8');
        } else {
            // download a pdf for printing and sharing
            createPDF(fileName);
        }
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

    $(document).ready(function () {
        /*
            here we'll handle all of our menu options
            the about menu is already handled via hrefs
        */

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

        // view menu
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

        // modal controls
        $('#modal-overlay').on('click', function () {
            poof.modal.dismiss();
        });
    });

}());