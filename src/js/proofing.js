(function () {

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

    function dataToHtml (story) {
        return html('div', { id : 'story-data' })
            .append( html('h1', { id : 'title' }, story.name))
            .append( html('p', { id : 'ifid' }, 'IFID: ' + story.ifid))
            .append( html('p', { id : 'compile' }, story.compiler + ' ' + story.compilerVersion));
    }

    function passageToHtml (passage) {
        return html('div', { data-id : passage.id, classes : 'passage-card' })
            .append( html('h2', { classes : 'passage-title' }, passage.name))
            .append( html('p', { classes : 'passage-tags' }, 'Tags: ' + passage.tags))
            .append( html('p', { classes : 'passage-source' }, passage.source));
    }

    function dataToTwee (story) {
        return ":: StorySettings\n" +
            "ifid:" + story.ifid + "\n\n" +
            ":: StoryTitle\n" + story.name + "\n\n";
    }

    function passageToTwee (passage) {
        return ":: " + passage.name + "[" + passage.tags + "]\n" + passage.source;
    }

    function createTweeSource () {
        var tweePassages = passages.map( function (psg) {
            return passageToTwee(psg);
        }).join('\n\n');
        return dataToTwee(story) + tweePassages();
    }

    function createHtmlOutput () {
        var htmlPassages = passages.map( function (psg) {
            return passageToHtml(psg)
        });
        return html('div', { id : 'main'}, dataToHtml(story)).append(htmlPassages);
    }

    var output = {
        html : createHtmlOutput,
        twee : createTweeSource
    };

    $(document).ready( function () {
        $('#content').empty().append(output.html);
    });

    window.poof = output;

}());