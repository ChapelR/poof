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

}());