(function () {
    'use strict';

    window.poof = window.poof || {};

    var passages = [];

    var dataChunk = $('tw-storydata');

    // get the passage data
    dataChunk.children('tw-passagedata').each( function () {
        // grab each passage's data and ad it to the array
        var $self = $(this);
        if ($self.attr('tags').toLowerCase().includes(poof.config.ignoreTag)) {
            return; // ignore passage
        }
        passages.push({
            name : $self.attr('name'),
            id : Number($self.attr('pid')),
            tags : $self.attr('tags'),
            pos : $self.attr('position'),
            size : $self.attr('size'),
            // $self.text() may be better, but we can always get the unescaped source later
            source : $self.html(),
            links : { to : [], from : [] }
        });
    });

    var tags = {}; // for tag colors for story metadata

    dataChunk.children('tw-tag').each( function () {
        var $self = $(this);
        tags[$self.attr('name')] = $self.attr('color');
    });

    passages = passages.sort(function (a, b) {
        // sort the passage array by pid, which is sometimes the order of creation
        return a.id - b.id;
    });

    var passageNames = Fast.map(passages, function (psg) {
        return psg.name;
    });

    var story = {
        // pull story data from the data chunk
        name : dataChunk.attr('name'),
        compiler : dataChunk.attr('creator'),
        compilerVersion : dataChunk.attr('creator-version'),
        ifid : dataChunk.attr('ifid') || 'NO IFID. Consider fixing this!',
        start : Number(dataChunk.attr('starnode')),
        zoom : Number(dataChunk.attr('zoom'))
    };

    function storyMetadata () {
        var ret;
        try {
            ret = JSON.stringify({
                ifid : story.ifid || '',
                format : poof.config.format.name || dataChunk.attr('format'),
                'format-version' : poof.config.format.version || dataChunk.attr('format-version'),
                start : poof.utils.getStartingPassage().name || passages[0].name,
                'tag-colors' : tags,
                zoom : Number.isNaN(story.zoom) ? 1 : story.zoom
            }, null, 4);
        } catch (err) {
            ret = '{}';
            console.error('Error parsing story metadata.');
        } finally {
            return ret;
        }
    }

    // here we make sure to grab the user scripts and styles
    var userScripts = Fast.map(dataChunk.children('*[type="text/twine-javascript"]').toArray(), function (el) {
        return $(el).html();
    });

    userScripts = (userScripts && userScripts.length) ? userScripts.join('\n\n').trim() : '';

    var userStyles = Fast.map(dataChunk.children('*[type="text/twine-css"]').toArray(), function (el) {
        return $(el).html();
    });

    userStyles = (userStyles && userStyles.length) ? userStyles.join('\n\n').trim() : '';

    function dataToHtml (story) {
        // this creates the DOM structure for the story header
        return poof.el('div', { id : 'story-data' })
            .append( poof.el('h1', { id : 'title' }, 'Story: ' + story.name))
            .append( poof.el('p', { id : 'format' }, poof.format.sexy + ' v' + poof.format.version))
            .append( poof.el('p', { id : 'ifid' }, 'IFID: ' + story.ifid))
            .append( poof.el('p', { id : 'compile' }, 'Made with: ' + story.compiler + ' ' + story.compilerVersion));
    }

    function passageToHtml (passage) {
        // this creates the DOM structure for each "passage card"
        var tags = passage.tags.replace(/\s+/g, ' ').trim();
        var tagsClass = !!passage.tags.trim() ? '' : 'hide';
        var references = poof.utils.referenceLinks(passage);
        var $el = poof.el('div', { 'data-id' : passage.id, classes : 'passage-card' })
            .append( poof.el('div', { // pencil button
                classes : 'edit', 
                role : 'button',
                title : "Create a comment using this passage's text."
            }, '&#9998;').on('click', function () {
                $(document).trigger({
                    type : ':comment-from-passage-text',
                    passage : passage
                });
            }))
            // passage title
            .append( poof.el('h2', { classes : 'passage-title' }, passage.name))
            // the tag block
            .append( poof.el('p', { classes : 'passage-tags' }, poof.el('span', { classes : 'tag-title' }, 'Tags: '))
                    .append( Fast.map(tags.split(' '), function (tag) {
                        var isFiltered = false;
                        $(document).on(':filter-complete', function () {
                            isFiltered = false;
                        });
                        return poof.el('span', { classes : 'tag-listing', title : 'Filter...' }, tag)
                            .css({
                                'display' : 'inline-block',
                                'border-width' : '0 1.1em',
                                'border-left-style' : 'solid',
                                'border-color' : poof.utils.getTagColor(tag),
                                'padding' : '0 0.1rem',
                                'margin-right' : '0.5rem'
                            })
                            .on('click', function () {
                                var doIt = confirm('Would you like to filter the passage view using this tag?');
                                if (!doIt) {
                                    return;
                                }
                                if (poof && poof.filter && poof.filter.run && typeof poof.filter.run === 'function') {
                                    $(document).trigger(':filter-start');
                                    isFiltered = true;
                                    poof.filter.run('tags', tag);
                                    $(document).trigger(':filter-complete');
                                }
                            });
                    }))
                .addClass(tagsClass) )
            // passage references block
            .append( (references) ? poof.el('div', { classes : 'passage-references' }, [poof.el('h3', {
                classes : 'passage-references-title'
            }, 'References to Other Passages: '), references]) : poof.utils.voidEl() )
            // passage source code
            .append( poof.el('div', { classes : 'passage-source', tabindex : "0" },
                poof.el('pre', {}, passage.source.trim())) )
            // footer (comments)
            .append( poof.el('div', { classes : 'passage-footer closed' }, [poof.el('button', { 
                classes : 'comment-open pure-button pure-button-primary',
                title : "View this passage's comments."
            }, '&#128172;').on('click', function () {
                var $self = $(this).toggleClass('pure-button-primary');
                $self.parent('.passage-footer').toggleClass('closed');
                $(document).trigger({
                    type : ':comment-open',
                    passage : passage
                });
            }), poof.el('div', { classes : 'comment-wrapper' })]))
            .attr({
                name : passage.name,
                'data-pid' : passage.id,
                'data-lt' : passage.source.length
            });
        // give the passage an element property and return
        passage.$el = $el;
        return $el;
    }

    function dataToTwee (story) {
        // this creates the twee-notation story data passages
        var data = '', 
            config = '';
        switch (poof.config.twee) {
            case 2:
                // twee2
                data = ":: StorySettings [twee2]\n" + "Twee2::build_config.story_ifid = '" + story.ifid + "'\n\n";
                break;
            case 3:
                // twee3
                data = ':: StoryData\n' + storyMetadata() + '\n\n';
                break;
            default:
                // twee1 (Tweego style); poof only supports Twine 2, so there should always be an ifid
                data = ":: StorySettings\n" + "ifid:" + story.ifid + "\n\n";
        }
        // re add the `poof.config` passage (if possible), so stories survive a round trip through poof
        if (poof.configPassage && poof.utils.stringNotEmpty(poof.configPassage.text())) {
            config = ':: poof.config';
            if (poof.utils.stringNotEmpty(poof.configPassage.attr('tags'))) {
                config = config + '[' + poof.configPassage.attr('tags') + ']';
            } 
            config = config + '\n' + poof.configPassage.text().trim() + '\n\n';
        }

        if (poof.utils.stringNotEmpty(config)) {
            data = data + config;
        }

        return data + ":: StoryTitle\n" + story.name + "\n\n";
    }

    function userScriptsToTwee () {
        /*
            most generation 2 Twine compilers that accept Twee notation accept script- and 
            stylesheet-tagged passages as an alternative to the Story JavaScript area and
            Story Stylesheet. this code creates a twee-notation passage for the user scripts        
        */
        if (!!userScripts.trim()) {
            return ":: Twine_UserScript [script]\n" + userScripts + "\n\n";
        }
        return "";
    }

    function userScriptsToHtml () {
        // mostly like a passage card, but with some minor style changes
        var scriptPre = !!userScripts.trim() ? 
            poof.el('pre', { classes : 'story-code javascript', 'data-language' : 'javascript' }, userScripts ) :
            poof.utils.voidEl();
        return poof.el('div', { id : 'story-javascript', classes : 'passage-card' })
            // title
            .append( poof.el('h2', { classes : 'passage-title' }, 'Story JavaScript'))
            // script scource code
            .append( poof.el('div', { classes : 'passage-source' })
                .append( scriptPre ))
            .append( poof.el('div', { classes : 'lint-btn-wrapper' }, 
                // LINTING
                poof.el('button', { classes : 'lint-btn pure-button pure-button-disabled', id : 'lint' }, 'Lint')
                    .attr('title', 'Requires an Internet connection...')
                    .on('click', function () {
                        if (JSHINT) { // check for the library
                            var opts = (poof.lint) ? poof.lint.options || {} : {};
                            var globals = (poof.lint) ? poof.lint.globals || {} : {};
                            JSHINT(userScripts, opts, globals);
                            var $output;
                            if (JSHINT.errors && Array.isArray(JSHINT.errors) && JSHINT.errors.length) {
                                $output = poof.el('div', { classes : 'errors js-errors' }, Fast.map(JSHINT.errors, function (err) {
                                    return poof.el('p', { classes : 'error-p' })
                                        .append( poof.el('span', { classes : 'error-line' }, err.line),
                                            poof.el('span', { classes : 'error-msg' }, err.reason));
                                }));
                            } else {
                                $output = poof.el('div', { classes : 'errors js-errors no-errors' }, 'No errors found');
                            }
                            poof.modal.write('Linting Report', $output, poof.el('button', { classes : 'pure-button' }, 'Close')
                                .on('click', poof.modal.close));
                        }
                    }))
                );
    }

    function userStylesToTwee () {
        // as above, we make a stylesheet-tagged passage for the twee representation
        if (!!userStyles.trim()) {
            return ":: Twine_UserStylesheet [stylesheet]\n" + userStyles + "\n\n";
        }
        return "";
    }

    function userStylesToHtml () {
        // refreshingly simple, compared to the scripts
        var stylePre = !!userStyles.trim() ? 
            poof.el('pre', { classes : 'story-code css', 'data-language' : 'css' }, userStyles ) :
            poof.utils.voidEl();
        return poof.el('div', { id : 'story-stylesheet', classes : 'passage-card' })
            // title
            .append( poof.el('h2', { classes : 'passage-title' }, 'Story StyleSheet'))
            // source
            .append( poof.el('div', { classes : 'passage-source' })
                .append( stylePre ));
    }

    function passageToTwee (passage) { // TODO: clean this mess up
        // create each passage's twee notation
        if (!passage) {
            return '';
        }
        var position = passage.pos || '',
            sizing = passage.size || '',
            meta = '', tags = '', name;
        // clean up metadata
        if (typeof position === 'string') {
            position = position.trim();
        } else {
            position = '';
        }
        if (typeof sizing === 'string') {
            sizing = sizing.trim();
        } else {
            sizing = '';
        }
        // encode metadata
        if (poof.config.twee === 1 || (poof.config.twee === 2 && !position) || (poof.config.twee === 3 && !position && !sizing)) {
            meta = '';
        } else if (poof.config.twee === 2) {
            meta = '<' + position + '>';
        } else {
            var obj = {};
            if (position) {
                obj.position = position;
            }
            if (sizing) {
                obj.sizing = sizing;
            }
            try {
                meta = JSON.stringify(obj);
            } catch (err) {
                console.error('Passage metadata could not be encoded for passage "' + passage.name + '".');
                // ignore if it throws, in accordance with the spec
                meta = '';
            }
        }
        // encode tags
        if (passage.tags && passage.tags.trim()) {
            // clean up for encoding
            tags = poof.utils.tweeEscape(passage.tags.trim());
        }
        // clean up name for encoding
        name = poof.utils.tweeEscape(passage.name);
        // return encoded passage
        return ":: " + name + (!!tags ? " [" + tags + "]" : "") + (!!meta ? ' ' + meta + '\n' : '\n') + passage.source;
    }

    function createTweeSource () {
        // combine all the twee-notation elements into one string
        var tweePassages = Fast.map(passages, function (psg) {
            return passageToTwee(psg);
        }).join('\n\n');
        var twee = dataToTwee(story) + userStylesToTwee() + userScriptsToTwee() + tweePassages;
        // the doc fragment and text() method get us a poor man's unescape (may no longer be necessary)
        return $(document.createDocumentFragment()).append(twee).text();
    }

    function createHtmlOutput () {
        // create our overall DOM structure for output to the page
        var htmlPassages = Fast.map(passages, function (psg) {
            return passageToHtml(psg);
        });
        // this is the primary passage view
        return poof.el('div', { id : 'main', classes : 'collapse' }, dataToHtml(story)).append(htmlPassages);
    }

    // this data will all be exported to the global scope
    var output = {
        html : createHtmlOutput,
        p2tw : passageToTwee,
        data2tw : function () {
            return dataToTwee(story) + userStylesToTwee() + userScriptsToTwee();
        },
        tagColors : tags,
        metadata : storyMetadata,
        twee : createTweeSource,
        data : story,
        passages : passages,
        passageNames : passageNames,
        scripts : userScripts,
        styles : userStyles,
        $scripts : userScriptsToHtml(),
        $styles : userStylesToHtml(),
        sortState : 'pid' // 'name', 'length', '-pid', '-name', '-length'
    };
    function proofingInit () {
        // attach the DOM structure, and the overlay and view-switching elements, to the #content element
        $('#content').append(output.html());
        // re-rendering everything is too slow, just show/hide the three types of source code via css
        $('#overlay').append(output.$scripts.addClass('hide'), output.$styles.addClass('hide'));
    }

    // export all our vital data to the global `poof` variable
    Object.assign(poof, output);

    window.poof.init = { proofing : proofingInit };

}());