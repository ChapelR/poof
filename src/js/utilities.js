(function () {
    'use strict';

    function createPDF (name) {
        var collapsedState = $('#main').hasClass('collapse');
        var $target = $('#main').removeClass('collapse');
        html2pdf($target[0], { filename : name, margin : 2 }).then( function () {
            if (collapsedState) {
                $target.addClass('collapse');
            }
        });
    }

    function createDownload (fileExt) {
        if (!window.poof) {
            console.error('Cannot find generated content output!');
            return;
        }
        var fileName = poof.data.name + '.' + fileExt;

        if (fileExt === 'txt') {
            download(poof.twee(), fileName, 'text/plain');
        } else if (fileExt === 'html') {
            download($(document.documentElement)[0].outerHTML, fileName, 'text/html');
        } else {
            createPDF(fileName);
        }
    }

    function showOverlay () {
        $('#overlay').removeClass('hide');
        $('#main').addClass('smallify');
    }

    function hideOverlay () {
        $('#overlay').addClass('hide');
        $('#main').removeClass('smallify');
    }

    $(document).ready(function () {
        $('#twee-export').on('click', function () {
            createDownload('txt');
        }).attr('title', 'Export to plain text in Twee notation.');
        $('#html-export').on('click', function () {
            createDownload('html');
        }).attr('title', 'Save this HTML view for sharing and later use.');
        $('#pdf-export').on('click', function () {
            createDownload('pdf');
        }).attr('title', 'Export to PDF format for printing or sharing.');

        $('#simple').on('click', function () {
            $('#content').toggleClass('simple');
        }).attr('title', 'Toggle a simpler view mode.');
        $('#collapse').on('click', function () {
            $('#main').toggleClass('collapse');
        }).attr('title', 'Toggle whether to use a scrollbar for lengthy text.');
        $('#passages').on('click', function () {
            hideOverlay();
            $('#story-stylesheet').addClass('hide');
            $('#story-javascript').addClass('hide');
        }).attr('title', 'View your passages.');
        $('#javascript').on('click', function () {
            showOverlay();
            $('#story-stylesheet').addClass('hide');
            $('#story-javascript').removeClass('hide');
        }).attr('title', 'View your JavaScript code.');
        $('#stylesheet').on('click', function () {
            showOverlay();
            $('#story-stylesheet').removeClass('hide');
            $('#story-javascript').addClass('hide');
        }).attr('title', 'View your stylesheet.');
    });


}());