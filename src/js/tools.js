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

    function filter (arr, prop, test, shouldInvert) {
        var ret;
        return arr.filter( function (member) {
            // because we're filtering out the passages we *don't* want to hide, 
            // this filter function needs to return the opposite of what you may expect
            if (prop === 'tags') {
                if (!member.tags || !member.tags.trim()) {
                    return shouldInvert ? true : false;
                }
                var tags, needle;
                // handle tag tests (most complicated)
                needle = breakTags(test);
                tags = handleStrings(member.tags);
                ret = needle.every( function (testTag) {
                    // every tag must be assigned to the passage
                    return tags.includes(testTag);
                });
                return shouldInvert ? !ret : ret;
            } else if (prop === 'comments') {
                ret = (poof.state && poof.state.comments &&
                    poof.state.comments[member.name] &&
                    Array.isArray(poof.state.comments[member.name]) &&
                    poof.state.comments[member.name].length);

                return shouldInvert ? !ret : ret;
            } else {
                // does the normalized content contain the normalized text string?
                ret = handleStrings(member[prop]).includes(handleStrings(test));
                return shouldInvert ? !ret : ret;
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

    function filterPassages (prop, test, invert, dontClear) {
        if (!dontClear) {
            // by default, undo previous filters before making new ones
            resetFilters();
            // additive filters will likely not ever be useful, but we'll leave the option in
        }
        var toHide = filter(poof.passages, prop, test, !invert);
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

    var passageNames = poof.passages.map( function (p) {
        return p.name;
    });

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
            $source  = poof.forms.text('source-filter', 'Passage Text: ', 'source...'),
            $comments = poof.forms.check('comment-filter', 'Passage has comments.')
                .attr('title', 'Show only passages with poof comments.'),
            $invert = poof.forms.check('invert-filter', 'Invert.')
                .attr('title', 'Check to instead hide the passages that meet these criteria.');

        var $form = poof.forms.form([$title, $tags, $source, $comments, $invert]);

        var $explanation = poof.el('p', { classes : 'form-expanation'}, 'Show only the passages that meet the following criteria.');

        var $confirm = poof.forms.confirm('Filter', function () {

            poof.modal.close();

            $(document).trigger(':filter-start');

            poof.filter.clear();

            var title = $('#title-filter').val(),
                tags = $('#tags-filter').val(),
                source = $('#source-filter').val(),
                comments = $('#comment-filter').prop('checked'),
                invert = $('#invert-filter').prop('checked');
            if (valueExists(title)) {
                poof.filter.run('name', title, invert);
            }
            if (valueExists(tags)) {
                poof.filter.run('tags', tags, invert);
            }
            if (valueExists(source)) {
                poof.filter.run('source', source, invert);
            }
            if (comments) {
                poof.filter.run('comments', null, invert);
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
        var $check = poof.forms.check('sort-reverse', 'Reverse.')
            .attr('title', 'Reverse the sorting order.');

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

    function find () {
        var $finder = poof.forms.textlist('find-passage', 'Enter a passage title to look for: ', 'passage...', passageNames);
        var $error = poof.el('div', { id : 'find-error' });
        var $confirm = poof.forms.confirm('Find', function () {
            var value = $('#find-passage').val();
            var worked = poof.utils.scrollTo(value, function () {
                $(document).trigger(':find-start');
            }, function () {
                $(document).trigger(':find-complete');
            });
            if (!worked) {
                // no such passage
                $error.empty().append('<br/><br/>Cannot find a passage titled "' + value + '".');
            }
        });
        var $cancel = poof.forms.cancel('Cancel', function () {
            // nothing complex, for once, just close me out
            poof.modal.close();
        });

        poof.modal.write('Find Passages', [$finder, $error], [$confirm, $cancel]);
    }

    window.poof.tools = {
        filter : filter,
        sort : sort,
        find : find
    };

}());