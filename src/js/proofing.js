(function () {
    'use strict';

    var passages = [];

    var dataChunk = $('tw-storydata');

    dataChunk.children('tw-passagedata').each( function () {
        var $self = $(this);
        passages.push({
            name : $self.attr('name'),
            id : Number($self.attr('pid')),
            tags : $self.attr('tags'),
            source : $self.html()
        });
    });

    passages = passages.sort(function (a, b) {
        return a.id - b.id;
    });

    var story = {
        name : dataChunk.attr('name'),
        compiler : dataChunk.attr('creator'),
        compilerVersion : dataChunk.attr('creator-version'),
        ifid : dataChunk.attr('ifid')
    };

    function html (type, opts, content) {
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

    var userScripts = dataChunk.children('*[type="text/twine-javascript"]').toArray().map( function (el) {
        return $(el).html();
    }).join('\n\n').trim();

    var userStyles = dataChunk.children('*[type="text/twine-css"]').toArray().map( function (el) {
        return $(el).html();
    }).join('\n\n').trim();

    function dataToHtml (story) {
        return html('div', { id : 'story-data' })
            .append( html('h1', { id : 'title' }, 'Story: ' + story.name))
            .append( html('p', { id : 'ifid' }, 'IFID: ' + story.ifid))
            .append( html('p', { id : 'compile' }, 'Made with: ' + story.compiler + ' ' + story.compilerVersion));
    }

    function passageToHtml (passage) {
        var tagsClass = !!passage.tags.trim() ? '' : 'hide';
        return html('div', { 'data-id' : passage.id, classes : 'passage-card' })
            .append( html('h2', { classes : 'passage-title' }, passage.name))
            .append( html('p', { classes : 'passage-tags' }, 'Tags: ' + passage.tags)
                .addClass(tagsClass) )
            .append( html('p', { classes : 'passage-source' })
                .append( html('pre', {}, passage.source.trim())) );
    }

    function dataToTwee (story) {
        return ":: StorySettings\n" +
            "ifid:" + story.ifid + "\n\n" +
            ":: StoryTitle\n" + story.name + "\n\n";
    }

    function userScriptsToTwee () {
        if (!!userScripts.trim()) {
            return ":: Twine_UserScript [script]\n" + userScripts + "\n\n";
        }
        return "";
    }

    function userScriptsToHtml () {
        return html('div', { id : 'story-javascript', classes : 'passage-card' })
            .append( html ('h2', {classes : 'passage-title' }, 'Story JavaScript'))
            .append( html('p', {classes : 'passage-source' })
                .append( html('pre', { classes : 'story-code' }, userScripts )));
    }

    function userStylesToTwee () {
        if (!!userStyles.trim()) {
            return ":: Twine_UserStylesheet [stylesheet]\n" + userStyles + "\n\n";
        }
        return "";
    }

    function userStylesToHtml () {
        return html('div', { id : 'story-stylesheet', classes : 'passage-card' })
            .append( html ('h2', {classes : 'passage-title' }, 'Story StyleSheet'))
            .append( html('p', {classes : 'passage-source' })
                .append( html('pre', { classes : 'story-code' }, userStyles )));
    }

    function passageToTwee (passage) {
        return ":: " + passage.name + (!!passage.tags.trim() ? " [" + passage.tags + "]\n" : "\n") + passage.source;
    }

    function createTweeSource () {
        var tweePassages = passages.map( function (psg) {
            return passageToTwee(psg);
        }).join('\n\n');
        return dataToTwee(story) + userStylesToTwee() + userScriptsToTwee() + tweePassages;
    }

    function createHtmlOutput () {
        var htmlPassages = passages.map( function (psg) {
            return passageToHtml(psg);
        });
        return html('div', { id : 'main', classes : 'collapse' }, dataToHtml(story)).append(htmlPassages);
    }

    var output = {
        html : createHtmlOutput,
        twee : createTweeSource,
        data : story,
        scripts : userScripts,
        styles : userStyles,
        $scripts : userScriptsToHtml(),
        $styles : userStylesToHtml()
    };

    $(document).ready( function () {
        $('#content').empty().append(output.html)
            .append( html('div', { id : 'overlay' }, [output.$scripts.addClass('hide'), output.$styles.addClass('hide')] )
                .addClass('hide'));
    });

    window.poof = output;

}());