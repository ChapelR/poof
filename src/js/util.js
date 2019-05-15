(function () {
    'use strict';

    window.poof = window.poof || {};

    function el (type, opts, content) {
        // a small utility function to create elements
        var classes = '';
        if (opts.classes) {
            if (Array.isArray(opts.classes)) {
                classes = opts.classes.join(' ');
            }
            if (typeof opts.classes === 'string') {
                classes = opts.classes;
            }
            delete opts.classes;
        }
        var $el = $(document.createElement(type))
            .attr(opts);

        if (classes) {
            $el.addClass(classes);
        }

        if (content) {
            $el.append(content);
        }

        return $el;
    }

    // export
    poof.el = el;

    function isValidPassage (passageName) {
        // check if the passage name (or object) passed is in our passage list
        if (typeof passageName === 'object' && passageName.name && typeof passageName.name === 'string') {
            passageName = passageName.name;
        }
        if (poof.passageNames && Array.isArray(poof.passageNames) && typeof passageName === 'string') {
            return poof.passageNames.includes(passageName);
        }
        return false;
    }

    function filterForPassages (list) {
        // take an array of strings and filter out any that aren't passages
        if (!list || !Array.isArray(list) || !list.length) {
            return [];
        }
        var x = list.filter( function (psg) {
            return isValidPassage(psg);
        });
        return x;
    }

    function getStartPassage () {
        // return the passage object represeting the startnode
        if (!poof.data) {
            return; // can't run yet
        }
        // get startnode passage
        var start = poof.passages.find( function (psg) {
            return psg === poof.data.start;
        });
        if (!start) {
            // return first passage
            return poof.passages[0];
        }
        return start;
    }

    function scrollToPassage (passageName, onStart, onEnd) {
        // scroll a passage into view via name
        if (typeof passageName === 'object' && passageName.name && typeof passageName.name === 'string') {
            passageName = passageName.name;
        }
        if (typeof passageName !== 'string') {
            return false;
        }
        // get the passage card
        var $card = $('.passage-card[name="' + passageName + '"]');
        if ($card[0]) { // make sure the card exists
            if (typeof onStart === 'function') {
                // run onStart cb
                onStart.call(null, passageName, $card);
            }
            // make sure the passage is visible if filtered
            $card.removeClass('hide');
            // smooth scroll to the passage card
            poof.modal.close();
            // smoothly animate the passage card into view
            $('html,body').animate({
               scrollTop : $card.offset().top - 37 // arrived at by 16px font * 2 (margin) * 1.15 (line-height)
            }, function () {
                if (typeof onEnd === 'function') {
                    // run onEnd cb
                    onEnd.call(null, passageName, $card);
                }
            });
            return true;
        }
        return false;
    }

    function createJumpLink (passageName) {
        // create a link with the name of a passage that, when clicked, scrolls that passage card into view
        return el('a', {
            classes : 'jumpto',
            href : 'javascript:void(0)'
        }, passageName)
            .on('click', function () {
                scrollToPassage(passageName);
            });
    }

    function linksToFrom (passage) {
        // construct passage reference linked lists
        var make = false;
        var $wrapper = el('div', { classes : 'passage-reference-wrapper' });
        var $toWrapper = el('div', { title : 'Links and other code in this passage that points to other passages.' }, 'Refers to: ');
        var $fromWrapper = el('div', { title : 'Links and other code in other passages that points to this passage.' }, 'Referred by: ');
        var to = passage.links.to.map( function (psg) {
            return createJumpLink(psg);
        });
        var from = passage.links.from.map( function (psg) {
            return createJumpLink(psg);
        });
        if (from.length) {
            make = true;
            $fromWrapper.append(from).appendTo($wrapper);
        }
        if (to.length) {
            make = true;
            $toWrapper.append(to).appendTo($wrapper);
        }
        if (make) {
            return $wrapper;
        }
        return false;
    }

    function voidElement () {
        // creat a void element, as a no-op for jQuery
        el('span', { classes : 'void' });
    }

    function stringNotEmpty (string) {
        // check that a value is a string and is not empty
        return string && typeof string === 'string' && string.trim();
    }

    poof.utils = {
        isPassage : isValidPassage,
        filterPassages : filterForPassages,
        getStartingPassage : getStartPassage,
        scrollTo : scrollToPassage,
        jumpLink : createJumpLink,
        referenceLinks : linksToFrom,
        voidEl : voidElement,
        stringNotEmpty : stringNotEmpty
    };

}());