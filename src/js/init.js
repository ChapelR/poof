(function () {
    'use strict';

    // run the app
    $(document).ready(function () {
        if (!window.poof || !window.poof.init) {
            // this is why modules are nice, i reckon
            console.error('BUILD ERROR');
            return;
        }

        poof.init.proofing(); // start the rendering process
        poof.init.comments(); // start the commenting subsystem
        poof.init.menu(); // attach the menu event handlers
        poof.init.sidebar(); // sidebar listings and event handlers

        // set a few last-minute configs
        if (poof.config.simplified) {
            poof.viewModes.simple($('#simple'));
        }
        if (!poof.config.codeHeightLimit) {
            poof.viewModes.textHt($('#collapse'));
        }
        if (!poof.config.lineNumbers) {
            poof.viewModes.lineNo($('#line-no'));
        }
        if (poof.config.nightMode) {
            poof.viewModes.dark($('#night'));
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

        // add syntax highlighting
        $('pre.story-code').each(function(i, block) {
            hljs.highlightBlock(block);
        });
        // add line numbers 
        $('pre').each(function(i, block) {
            hljs.lineNumbersBlock(block);
        });

        // dismiss loading screen
        $(document).trigger(':load-close');
    });
}());