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

    $(document).ready(function () {
        $('#twee-export').on('click', function () {
            createDownload('txt');
        });
        $('#html-export').on('click', function () {
            createDownload('html');
        });
        $('#pdf-export').on('click', function () {
            createDownload('pdf');
        });

        $('#simple').on('click', function () {
            $('#content').toggleClass('simple');
        });
        $('#collapse').on('click', function () {
            $('#main').toggleClass('collapse');
        });
        $('#passages').on('click', function () {
            $('#overlay').addClass('hide');
            $('#story-stylesheet').addClass('hide');
            $('#story-javascript').addClass('hide');
        });
        $('#javascript').on('click', function () {
            $('#overlay').removeClass('hide');
            $('#story-stylesheet').addClass('hide');
            $('#story-javascript').removeClass('hide');
        });
        $('#stylesheet').on('click', function () {
            $('#overlay').removeClass('hide');
            $('#story-stylesheet').removeClass('hide');
            $('#story-javascript').addClass('hide');
        });
    });


}());