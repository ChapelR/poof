(function () {
    'use strict';

    window.poof.viewModes = {
        dark : function (self) {
            var el = $(document.documentElement).toggleClass('night');
            if (el.hasClass('night')) {
                self.addClass('on');
            } else {
                self.removeClass('on');
            }
        },
        simple : function (self) {
            var el = $('#content').toggleClass('simple');
            if (el.hasClass('simple')) {
                self.addClass('on');
            } else {
                self.removeClass('on');
            }
        },
        lineNo : function (self) {
            var el = $('td.hljs-ln-numbers').toggleClass('hide');
            if (el.hasClass('hide')) {
                self.removeClass('on');
            } else {
                self.addClass('on');
            }
        },
        textHt : function (self) {
            var el = $('#main').toggleClass('collapse');
            if (el.hasClass('collapse')) {
                self.addClass('on');
            } else {
                self.removeClass('on');
            }
        }
    };
}());