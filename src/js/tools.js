/***
        UI CODE
***/

(function () {
    'use strict';

    if (!window.poof) {
        console.error('Cannot find global object.');
    }

        /*** MODAL ***/

    $(document).ready( function () {
        // any clickable with the `.closemodale` class will dismiss the modal
        $('.closemodale').click(function (e) {
            e.preventDefault();
            $('.modale').removeClass('opened');
        });
    });

    // basic methods
    function openModal () {
        $('.modale').addClass('opened');
    }
    function closeModal () {
        $('.modale').removeClass('opened');
    }

    function modalBody (content, keep) {
        // append to content area of modal
        var $contentEl = $('#modal-body');
        // optionally clear the modal first
        if (!keep) {
            $contentEl.empty();
        }
        // write content to the modal
        $contentEl.append(content);
    }

    function modalFooter (content, keep) {
        var $contentEl = $('#modal-footer');
        if (!keep) {
            $contentEl.empty();
        }
        $contentEl.append(content);
    }

    function modalTitle (content) {
        // write the title box
        $('#modal-title').empty().append(content);
    }

    function modalWrite (title, body, footer) {
        // write to all three elements and open
        modalTitle(title);
        modalBody(body);
        modalFooter(footer);
        openModal();
    }

    var modal = {
        // exports
        open : openModal,
        close : closeModal,
        write : modalWrite,
        title : modalTitle,
        body : modalBody,
        footer: modalFooter
    };

    window.poof.modal = modal;

        /*** BUTTONS ***/

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

        /*** INPUTS ***/

        // todo: will use purecss forms

}());

/***
        FILTERS
***/

(function () {
    'use strict';

    function handleStrings (str) {
        // normalize strings
        return str.trim().toLowerCase().replace(/\s+/g, ' ');
    }

    function breakTags (str) {
        // break multi-word strings into single words (for tags)
        str = handleStrings(str);
        return str.split(' ');
    }

    function filter (arr, prop, test) {
        return arr.filter( function (member) {
            if (prop === 'tags') {
                if (!member.tags || !member.tags.trim()) {
                    return true;
                }
                var tags, needle;
                // handle tag tests (most complicated)
                needle = breakTags(test);
                tags = handleStrings(member.tags);
                return needle.every( function (testTag) {
                    // every tag must be assigned to the passage
                    return !tags.includes(testTag);
                });
            } else {
                // does the normalized content contain the normalized text string?
                return !handleStrings(member[prop]).includes(handleStrings(test));
            }
        });
    }

    function hidePassage (passage) {
        passage.$el.addClass('hide');
    }

    function showPassage (passage) {
        passage.$el.removeClass('hide');
    }

    function resetFilters () {
        var toRevert = [];
        if (revert) {
            toRevert = $('.passage-card.hide').toArray();
        }
        $('.passage-card').removeClass('hide');
        return toRevert; // for pdf doc writing
    }

    function revert (arr) {
        $(arr).addClass('hide');
    }

    function getElements (arr) {
        return arr.map( function (i) {
            return i.$el;
        });
    }

    function filterPassages (prop, test, dontClear) {
        if (!dontClear) {
            // by default, undo previous filters before making new ones
            resetFilters();
        }
        var toHide = filter(poof.passages, prop, test);
        $(getElements(toHide)).each( function () {
            $(this).addClass('hide');
        });
        return toHide;
    }

    var filterMethods = {
        normalize : handleStrings,
        run : filterPassages,
        clear : resetFilters,
        revert : revert,
        passage : {
            show : showPassage,
            hide : hidePassage,
            to$ : getElements
        }
    };

    window.poof.filter = filterMethods;

}());

// todo: sorting methods (by name, pid, source length)
// will require completely rerendering #main