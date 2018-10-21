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

    function textbox (id, label, placeholder, note) {
        return poof.el('div', { classes : 'pure-control-group' }, [
                poof.el('label', { for : id }, label),
                poof.el('input', { 
                    id : id, 
                    type : 'text', 
                    placeholder : placeholder || '' 
                }),
                poof.el('span', { classes : 'pure-form-message-inline' }, note || '')
            ]);
    }

    function checkbox (id, label) {
        return poof.el('div', { class : 'pure-controls' }, 
                poof.el('label', { for : id }, [ 
                    poof.el('input', { id : id, type : 'checkbox'}),
                    label
                ])
            );
    }

    function dropdown (id, label, opts) {
        if (!opts || !Array.isArray(opts) || !opts.length) {
            return;
        }
        return poof.el('div', { class : 'pure-controls' }, [
            poof.el('label', { for : id }, label),
            poof.el('select', { id : id }, opts.map( function (opt) {
                return poof.el('option', {}, opt);
            }))
        ]);
    }

    function form (elements) {
        return poof.el('form', { classes : 'pure-form pure-form-aligned left-align' }, 
            poof.el('fieldset', {}, elements) );
    }

    function confirm (text, fn) {
        return primaryBtn(text, fn).addClass('confirm-btn');
    }

    function cancel (text, fn) {
        return normalBtn(text, fn).addClass('cancel-btn');
    }

    window.poof.forms = {
        form : form,
        text : textbox,
        check : checkbox,
        select : dropdown,
        confirm : confirm,
        cancel : cancel
    };

}());

/***
        FILTERS
***/

(function () {
    'use strict';

    // out filterer just hides and shows passages with a class

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
            // because we're filtering out the passages we *don't* want to hide, 
            // this filter function needs to return the opposite of what you may expect
            if (prop === 'tags') {
                if (!member.tags || !member.tags.trim()) {
                    return true;
                }
                var tags, needle;
                // handle tag tests (most complicated)
                needle = breakTags(test);
                tags = handleStrings(member.tags);
                return !needle.every( function (testTag) {
                    // every tag must be assigned to the passage
                    return tags.includes(testTag);
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
        // un-hides all passages, effectively reseting the filters
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
            // additive filters will likely not ever be useful, but we'll leave the option in
        }
        var toHide = filter(poof.passages, prop, test);
        // this DOM operation could take a bit; may be worth it to use a loader here
        $(getElements(toHide)).each( function () {
            $(this).addClass('hide');
        });
        return toHide; // return the passages we filtered out
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

    // main calls: `poof.filter.run('tags', userString);` - `poof.filter.clear();`

}());

/***
        SORTING
***/

(function () {
    'use strict';

    // our sorter detaches, rearranges, and re-attaches the passage elements; no state is altered

    var thingMap = {
        // map possible sort properties to attribute values
        '-name' : 'name',
        'name' : 'name',
        '-pid' : 'data-pid',
        'pid' : 'data-pid',
        '-length' : 'data-lt',
        'length' : 'data-lt'
    };

    function detachPassages () {
        // remove and return all passages
        return $('#main').children('.passage-card').detach();
    }

    function reattach (passages) {
        // reattach a (probably sorted) array of passages 
        $('#main').append(passages);
    }

    function sortByThing (thing) {
        // main method
        if (!Object.keys(thingMap).includes(thing)) {
            // invalid sort call
            console.error('Invalid sorting property or attribute!');
            return;
        }

        if (window.poof.sortState === thing) {
            // if we're already sorted in the requested manner, bail
            return;
        }

        // loader? (sorting operations are slow, the data is complicated, and we're doing DOM manipulation)

        var passages = detachPassages();
        var reverse = false;
        var property = '';

        var compare = function (a, b, prop, r) {
            var aTest = poof.filter.normalize($(a).attr(prop)),
                bTest = poof.filter.normalize($(b).attr(prop));

            if (prop === 'name') {
                // name must be compared via codepoints
                var ret;

                if (aTest < bTest) {
                    ret = -1;
                } else if (bTest < aTest) {
                    ret = 1;
                } else {
                    ret = 0;
                }
                if (ret && r) {
                    ret *= -1;
                }
                return ret;
            }

            // make the pids/lengths numbers
            aTest = Number(aTest);
            bTest = Number(bTest);

            if (r) {
                return bTest - aTest ;
            } else {
                return aTest - bTest ;
            }
        };

        var sort = function (arr, prop, rev) {
            // simplify the call
            arr.sort( function (a, b) {
                return compare(a, b, prop, rev);
            });
        };

        if (thing.includes('-')) {
            // the '-' before a sort request arg indicates to reverse the normal order
            reverse = true;
        }
        property = thingMap[thing];

        if (property === 'data-lt') {
            // by default, long passages should sort higher
            reverse = !reverse;
        }

        sort(passages, property, reverse);
        reattach(passages);

        // set the sortState to prevent re-sorts using the same params
        window.poof.sortState = thing;

        // end loader?
    }

    window.poof.filter.sorting = {
        // export as a child of the filter methods
        run : sortByThing,
        detach : detachPassages,
        attach : reattach
    };

    // main call: `poof.filter.sorting.run('-name');`

}());

/***
        USER INTERFACE
***/

(function () {
    'use strict';

    var sortLookup = {
        'Passage Titles' : 'name',
        'Passage IDs' : 'pid',
        'Source Code Length' : 'length'
    };

    function valueExists (str) {
        return !!(str && typeof str === 'string' && str.trim());
    }

    function filter () {
        var $title = poof.forms.text('title-filter', 'Passage Title: ', 'title...'),
            $tags  = poof.forms.text('tags-filter', 'Passage Tags: ', 'tags...', 'Seperate tags with spaces.'),
            $source  = poof.forms.text('source-filter', 'Passage Text: ', 'source...');

        var $form = poof.forms.form([$title, $tags, $source]);

        var $explanation = poof.el('p', { classes : 'form-expanation'}, 'Show only the passages that meet the following criteria.');

        var $confirm = poof.forms.confirm('Filter', function () {

            poof.modal.close();

            $(document).trigger(':filter-start');

            poof.filter.clear();

            var title = $('#title-filter').val(),
                tags = $('#tags-filter').val(),
                source = $('#source-filter').val();
            if (valueExists(title)) {
                poof.filter.run('name', title);
            }
            if (valueExists(tags)) {
                poof.filter.run('tags', tags);
            }
            if (valueExists(source)) {
                poof.filter.run('source', source);
            }

            $(document).trigger(':filter-complete');

        });

        var $cancel = poof.forms.cancel('Clear', function () {

            poof.modal.close();

            $(document).trigger(':filter-start');

            poof.filter.clear();

            $(document).trigger(':filter-complete');
            
        });

        poof.modal.write('Filter Passages', [$explanation, $form], [$confirm, $cancel]);
    }

    function sort () {
        var $drop = poof.forms.select('sort-param', 'Select the property to sort by: ', ['Passage Titles', 'Passage IDs', 'Source Code Length']);
        var $check = poof.forms.check('sort-reverse', 'Descending order.');

        var $explanation = poof.el('p', { classes : 'form-expanation'}, 'Sort the passage list using one of the following criteria.');

        var $form = poof.el('form', { classes : 'pure-form' }, poof.el('fieldset', {}, [$drop, '<br />', $check]));

        var $confirm = poof.forms.confirm('Sort', function () {
            poof.modal.close();

            $(document).trigger(':sort-start');

            var checked = $('#sort-reverse').prop('checked');

            var param = sortLookup[$('#sort-param').val()];

            console.log(param);

            if (checked) {
                param = '-' + param;
            }

            poof.filter.sorting.run(param);

            $(document).trigger(':sort-complete');
        });

        var $cancel = poof.forms.cancel('Restore Default', function () {
            poof.modal.close();

            $(document).trigger(':sort-start');

            poof.filter.sorting.run('pid');

            $(document).trigger(':sort-complete');
        });

        poof.modal.write('Sort Passages', [$explanation, $form], [$confirm, $cancel]);
    }

    window.poof.tools = {
        filter : filter,
        sort : sort
    };

}());