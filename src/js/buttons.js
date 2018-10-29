(function () {
    'use strict';

    window.poof = window.poof || {};

    function btn (text, click, opts) {
        // default settings
        var settings = {
            disabled : false,
            primary : false,
            // attr object for jQuery
            attr : {},
            classes : []
        };

        if (opts && typeof opts === 'object') {

            if (opts.classes && typeof opts.classes === 'string') {
                // we want classes to be an array
                opts.classes = [opts.classes];
            }

        } else {
            // make sure opts is at least an empty object
            opts = {};
        }

        // this overwrites out defaults with specifics from the call options
        Object.assign(settings, opts);

        // we'll check classes to make sure they aren't somehow nulled out or undefined
        var classes = settings.classes || [];

        if (settings.disabled) {
            // make the button appear disabled
            classes.push('pure-button-disabled');
        }
        if (settings.primary) {
            // colors in the button
            classes.push('pure-button-primary');
        }
        // root pure.css class
        classes.push('pure-button');

        // poof.el() is equivalent to html() in the proofing.js file
        return poof.el('button', settings.attr)
            .append(text)
            .addClass(classes)
            .on('click', function () {
                // there's a wasted call here I could write around, but I'm not too concerned for now
                if (click && typeof click === 'function') {
                    click();
                }
            });
    }

    function primaryBtn (text, fn) {
        // create a pretty colored button (i.e. confirm/submit)
        return btn(text, fn, { primary : true });
    }
    function disabledBtn (text) {
        // create a by-default disabled button
        return btn(text, null, { disabled : true });
    }
    function normalBtn (text, fn) {
        // create an ordinary button (i.e. close/back)
        return btn(text, fn, {});
    }
    function disableButton (btn, bool) {
        // this script accepts a jQuery element, selector, or node and tries to disable it
        var $btn;
        if (btn instanceof jQuery) {
            $btn = btn;
        } else if (typeof btn === 'string' || typeof btn === 'object') {
            // wrap the button in jQuery
            $btn = $(btn);
        }
        if (!$btn.hasClass('pure-button')) {
            // this isn't a pure button and can't be disbaled...whoops!
            return;
        }
        // based on bool-- true: disable, false: enable, null/undefined/omitted: toggle
        if (bool) {
            // boolean true
            $btn.addClass('pure-button-disabled');
        } else {
            if (bool == null) {
                // undefined, omitted, or null
                $btn.toggleClass('pure-button-disabled');
            } else {
                // boolean false
                $btn.removeClass('pure-button-disabled');
            }
        }
        // return the button so we can keep track of it
        return button;
    }

    function btnIsDisabled (btn) {
        // is this button disabled?
        var $btn;
        if (btn instanceof jQuery) {
            $btn = btn;
        } else if (typeof btn === 'string' || typeof btn === 'object') {
            $btn = $(btn);
        }
        if (!$btn.hasClass('pure-button')) {
            // technically it's not, but return undefined.
            return;
        }
        return $btn.hasClass('pure-button-disabled');
    }

    window.poof.btn = {
        create : btn,
        normal : normalBtn,
        primary : primaryBtn,
        grayed : disabledBtn,
        disable : disableButton,
        isDisabled : btnIsDisabled
    };

}());