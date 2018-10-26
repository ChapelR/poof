(function () {
    'use strict';

    var passages = [];

    var dataChunk = $('tw-storydata');

    // parse config passage

    var configPassageName = 'poof.config';

    var $configPassage = dataChunk.find('tw-passagedata[name="' + configPassageName + '"]');

    var config = (function () {
        var settings = {
            ignoreTag : 'poof.ignore',
            simplified : false,
            codeHeightLimit : true,
            nightMode : false,
            fonts : {
                main : '',
                code : ''
            }
        };
        var data = $configPassage.text() || '{ "noConfig" : true }';
        try {
            data = JSON.parse(data);
            Object.assign(settings, data);
        } catch (err) {
            console.warn('Config passage was not parsed:', err);
            alert("Poof couldn't parse your config passage, check the console for more information.");
        } finally {
            console.log('Poof Settings Loaded', settings);
            return settings;
        }
    }());

    // remove the config passage
    $configPassage.remove();

    // get the passage data
    dataChunk.children('tw-passagedata').each( function () {
        // grab each passage's data and ad it to the array
        var $self = $(this);
        if ($self.attr('tags').toLowerCase().includes(config.ignoreTag)) {
            return; // ignore passage
        }
        passages.push({
            name : $self.attr('name'),
            id : Number($self.attr('pid')),
            tags : $self.attr('tags'),
            // $self.text() may be better, but we can always get the unescaped source later
            source : $self.html()
        });
    });

    passages = passages.sort(function (a, b) {
        // sort the passage array by pid, which is roughly the order of creation
        return a.id - b.id;
    });

    var story = {
        // pull story data from the data chunk
        name : dataChunk.attr('name'),
        compiler : dataChunk.attr('creator'),
        compilerVersion : dataChunk.attr('creator-version'),
        ifid : dataChunk.attr('ifid')
    };

    function html (type, opts, content) {
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

    // here we make sure to grab the user scripts and styles
    var userScripts = dataChunk.children('*[type="text/twine-javascript"]').toArray().map( function (el) {
        return $(el).html();
    }).join('\n\n').trim();

    var userStyles = dataChunk.children('*[type="text/twine-css"]').toArray().map( function (el) {
        return $(el).html();
    }).join('\n\n').trim();

    function dataToHtml (story) {
        // this creates the DOM structure for the story header
        return html('div', { id : 'story-data' })
            .append( html('h1', { id : 'title' }, 'Story: ' + story.name))
            .append( html('p', { id : 'ifid' }, 'IFID: ' + story.ifid))
            .append( html('p', { id : 'compile' }, 'Made with: ' + story.compiler + ' ' + story.compilerVersion));
    }

    function passageToHtml (passage) {
        // this creates the DOM structure for each "passage card"
        var tagsClass = !!passage.tags.trim() ? '' : 'hide';
        var $el = html('div', { 'data-id' : passage.id, classes : 'passage-card' })
            .append( html('div', { 
                classes : 'edit', 
                role : 'button',
                title : "Create a comment using this passage's text."
            }, '&#9998;').on('click', function () {
                $(document).trigger({
                    type : ':comment-from-passage-text',
                    passage : passage
                });
            }))
            .append( html('h2', { classes : 'passage-title' }, passage.name))
            .append( html('p', { classes : 'passage-tags' }, 'Tags: ' + passage.tags)
                .addClass(tagsClass) )
            .append( html('div', { classes : 'passage-source' },
                html('pre', {}, passage.source.trim())) )
            .append( html('div', { classes : 'passage-footer closed' }, [html('button', { 
                classes : 'comment-open pure-button pure-button-primary',
                title : "View this passage's comments."
            }, '&#128172;').on('click', function () {
                var $self = $(this).toggleClass('pure-button-primary');
                $self.parent('.passage-footer').toggleClass('closed');
                $(document).trigger({
                    type : ':comment-open',
                    passage : passage
                });
            }), html('div', { classes : 'comment-wrapper' })]))
            .attr({
                name : passage.name,
                'data-pid' : passage.id,
                'data-lt' : passage.source.length
            });
        passage.$el = $el;
        return $el;
    }

    function dataToTwee (story) {
        // this creates the twee-notation story data passages
        return ":: StorySettings\n" +
            "ifid:" + story.ifid + "\n\n" +
            ":: StoryTitle\n" + story.name + "\n\n";
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
        return html('div', { id : 'story-javascript', classes : 'passage-card' })
            .append( html ('h2', { classes : 'passage-title' }, 'Story JavaScript'))
            .append( html('div', { classes : 'passage-source' })
                .append( html('pre', { classes : 'story-code javascript', 'data-language' : 'javascript' }, userScripts )));
    }

    function userStylesToTwee () {
        // as above, we make a stylesheet-tagged passage for the twee representation
        if (!!userStyles.trim()) {
            return ":: Twine_UserStylesheet [stylesheet]\n" + userStyles + "\n\n";
        }
        return "";
    }

    function userStylesToHtml () {
        // as with the user scripts
        return html('div', { id : 'story-stylesheet', classes : 'passage-card' })
            .append( html ('h2', { classes : 'passage-title' }, 'Story StyleSheet'))
            .append( html('div', { classes : 'passage-source' })
                .append( html('pre', { 'data-language' : 'css', classes : 'story-code css' }, userStyles )));
    }

    function passageToTwee (passage) {
        // create each passage's twee notation
        return ":: " + passage.name + (!!passage.tags.trim() ? " [" + passage.tags + "]\n" : "\n") + passage.source;
        // some compilers accept coordinates from the Twine 2 app, but others trip on them, so leave them off
    }

    function createTweeSource () {
        // combine all the twee-notation elements into one passage
        var tweePassages = passages.map( function (psg) {
            return passageToTwee(psg);
        }).join('\n\n');
        var twee = dataToTwee(story) + userStylesToTwee() + userScriptsToTwee() + tweePassages;
        // the doc fragment and text() method get us a poor man's unescape
        return $(document.createDocumentFragment()).append(twee).text();
    }

    function createHtmlOutput () {
        // create our overall DOM structure for output to the page
        var htmlPassages = passages.map( function (psg) {
            return passageToHtml(psg);
        });
        return html('div', { id : 'main', classes : 'collapse' }, dataToHtml(story)).append(htmlPassages);
    }

    // this data will all be exported to the global scope
    var output = {
        el : html,
        html : createHtmlOutput,
        twee : createTweeSource,
        data : story,
        passages : passages,
        scripts : userScripts,
        styles : userStyles,
        $scripts : userScriptsToHtml(),
        $styles : userStylesToHtml(),
        sortState : 'pid', // 'name', 'length', '-pid', '-name', '-length'
        config : config
    };
    $(document).ready( function () {
        // attach the DOM structure, and the overlay and view-switching elements, to the #content element
        $('#content').append(output.html());
        $('#overlay').append(output.$scripts.addClass('hide'), output.$styles.addClass('hide'));

        // configs
        if (config.simplified) {
            $('#content').addClass('simple');
        }
        if (!config.codeHeightLimit) {
            $('#main').removeClass('collapse');
        }
        if (config.nightMode) {
            $(document.documentElement).addClass('night');
        }
        if (config.fonts && typeof config.fonts === 'object') {
            // custom fonts
            if (config.fonts.main && typeof config.fonts.main === 'string') {
                var $body = $(document.body);
                $body.css('font-family', config.fonts.main);
            }
            if (config.fonts.code && typeof config.fonts.code === 'string') {
                var $pre = $('div.passage-source pre');
                $pre.css('font-family', config.fonts.code);
            }
        }

        // dismiss loading screen
        $(document).trigger(':load-close');
        $('pre.story-code').each(function(i, block) {
            hljs.highlightBlock(block);
        });
    });

    // export all our vital data to the global `poof` variable
    window.poof = output;

}());