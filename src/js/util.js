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

    var linkParsers = {

        generic : [
            {
                name : 'generic-pipe',
                regex : /\[\[(.*)\|(.*)]]/g,
                group : 2
            },
            {
                name : 'generic-passage',
                regex : /\[\[(.*)]]/g,
                group : 1
            },
            {
                name : 'generic-pFirst',
                regex : /\[\[(.*)<-(.*)]]/g,
                group : 1
            },
            {
                name : 'generic-pLast',
                regex : /\[\[(.*)->(.*)]]/g,
                group : 2
            }
        ],
        sugarcube : [
            {
                name : 'linkMacro',
                regex : /<<(link|button)\s*["'](.*)["']\s*['"](.*)['"]>>/g,
                group : 3
            },
            {
                name : 'gotoMacro',
                regex : /<<goto\s*["'](.*)["']>>/g,
                group : 1
            },
            {
                name : 'includeMacro',
                regex : /<<(include|display)\s*["'](.*)["']\s*?.*?>>/g,
                group : 1
            }
        ],
        harlowe : [
            {
                name : 'linkMacro',
                regex : /\((link|click)-?go-?to:\s*?["'](.*?)['"],\s*?['"](.*?)['"]\s*?\)/g,
                group : 3
            },
            {
                name : 'gotoMacro',
                regex : /\(go-?to:\s*?["'](.*?)['"]\s*?\)/g,
                group : 1
            },
            {
                name : 'includeMacro',
                regex : /\(display:\s*?["'](.*?)['"]\s*?\)/g,
                group : 1
            }
        ]
    };

    function setUpParsers (format) {
        if (linkParsers[format] && format !== 'generic') {
            return linkParsers.generic.concat(linkParsers[format]);
        } else {
            return linkParsers.generic;
        }
    }

    function parse (passageText, parsers) {
        if (typeof passageText === 'object' && passageText.source && typeof passageText.source === 'string') {
            passageText = passageText.source;
        }
        if (typeof passageText !== 'string') {
            console.warn('linkParser -> passage text could not be found.');
            return;
        }
        var passages = [];
        parsers.forEach( function (parser) {
            var ret = [];
            var matches = passageText.match(parser.regex);
            if (matches) {
                matches.forEach( function (match) {
                    var parsed = parser.regex.exec(match);
                    if (parsed) {
                        var psg = parsed[parser.group];
                        if (!ret.includes(psg)) {
                            ret.push(psg);
                        }
                    }
                });
            }
            if (ret.length) {
                passages = passages.concat(ret);
            }
        });
        return passages;
    }

    function isValidPassage (passageName) {
        if (typeof passageName === 'object' && passageName.name && typeof passageName.name === 'string') {
            passageName = passageName.name;
        }
        if (poof.passageNames && Array.isArray(poof.passageNames) && typeof passageName === 'string') {
            return poof.passageNames.includes(passageName);
        }
        return false;
    }

    function filterForPassages (list) {
        if (!list || !Array.isArray(list) || !list.length) {
            return [];
        }
        var x = list.filter( function (psg) {
            return isValidPassage(psg);
        });
        return x;
    }

    function getStartPassage () {
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

    function scrollToPassage (passageName, onStart, callback) {
        if (typeof passageName === 'object' && passageName.name && typeof passageName.name === 'string') {
            passageName = passageName.name;
        }
        if (typeof passageName !== 'string') {
            return false;
        }
        var $card = $('.passage-card[name="' + passageName + '"]');
        if ($card[0]) {
            if (typeof onStart === 'function') {
                onStart.call(null, passageName, $card);
            }
            // make sure the passage is visible if filtered
            $card.removeClass('hide');
            // smooth scroll to the passage card
            poof.modal.close();
            $('html,body').animate({
               scrollTop : $card.offset().top - 37 // arrived at by 16px font * 2 (margin) * 1.15 (line-height)
            }, function () {
                if (typeof callback === 'function') {
                    callback.call(null, passageName, $card);
                }
            });
            return true;
        }
        return false;
    }

    function createJumpLink (passageName) {
        return el('a', {
            classes : 'jumpto',
            href : 'javascript:void(0)'
        }, passageName)
            .on('click', function () {
                scrollToPassage(passageName);
            });
    }

    function linksToFrom (passage) {
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
        el('span', { classes : 'void' });
    }

    function stringNotEmpty (string) {
        return string && typeof string === 'string' && string.trim();
    }

    poof.utils = {
        getParsers : setUpParsers,
        parse : parse,
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