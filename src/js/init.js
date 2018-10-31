(function () {
    'use strict';

    // initialize everything
    $(document).ready(function () {
        if (!window.poof || !window.poof.init) {
            console.error('BUILD ERROR');
            return;
        }
        poof.init.proofing();
        poof.init.comments();
        poof.init.menu();

        // configs
        if (poof.config.simplified) {
            $('#content').addClass('simple');
        }
        if (!poof.config.codeHeightLimit) {
            $('#main').removeClass('collapse');
        }
        if (!poof.config.lineNumbers) {
            $('td.hljs-ln-numbers').addClass('hide');
        }
        if (poof.config.nightMode) {
            $(document.documentElement).addClass('night');
        }
        if (poof.config.fonts && typeof poof.config.fonts === 'object') {
            // custom fonts
            if (poof.config.fonts.main && typeof poof.config.fonts.main === 'string') {
                var $body = $(document.body);
                $body.css('font-family', poof.config.fonts.main);
            }
            if (poof.config.fonts.code && typeof poof.config.fonts.code === 'string') {
                var $pre = $('div.passage-source pre');
                $pre.css('font-family', poof.config.fonts.code);
            }
        }
        if (poof.config.globals && Array.isArray(poof.config.globals) && poof.config.globals.length) {
            Object.assign(poof.lint.globals, poof.lint.objectify(poof.config.globals));
        }

        // syntax highlighting
        $('pre.story-code').each(function(i, block) {
            hljs.highlightBlock(block);
        });
        // line numbers 
        $('pre').each(function(i, block) {
            hljs.lineNumbersBlock(block);
        });

        // dismiss loading screen
        $(document).trigger(':load-close');
    });
}());