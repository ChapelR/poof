(function () {
    'use strict';

    window.poof.viewModes = {
        dark : function (self) {
            var el = $(document.documentElement).toggleClass('night');
            if (el.hasClass('night')) {
                poof.config.nightMode = true;
                self.addClass('on');
            } else {
                poof.config.nightMode = false;
                self.removeClass('on');
            }
        },
        simple : function (self) {
            var el = $('#content').toggleClass('simple');
            if (el.hasClass('simple')) {
                poof.config.simplified = true;
                self.addClass('on');
            } else {
                poof.config.simplified = false;
                self.removeClass('on');
            }
        },
        lineNo : function (self) {
            var el = $('td.hljs-ln-numbers').toggleClass('hide');
            if (el.hasClass('hide')) {
                poof.config.lineNumbers = false;
                self.removeClass('on');
            } else {
                poof.config.lineNumbers = true;
                self.addClass('on');
            }
        },
        textHt : function (self) {
            var el = $('#main').toggleClass('collapse');
            if (el.hasClass('collapse')) {
                poof.config.codeHeightLimit = true;
                self.addClass('on');
            } else {
                poof.config.codeHeightLimit = false;
                self.removeClass('on');
            }
        }
    };
}());