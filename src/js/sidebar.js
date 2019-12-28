(function () {
    'use strict';

    var $container = $('#sidebar ul');

    function clear () {
        return $container.empty();
    }

    function establish () {
        return Fast.map($('.passage-card').map( function () {
            return $(this).attr('name');
        }), function (name) {
            return $(document.createElement('li'))
                .append(poof.utils.jumpLink(name).addClass('sidebar-jump'));
        });
    }

    function populate () {
        clear().append(establish());
    }

    poof.sidebar = {
        clear : clear,
        populate : populate,
        $el : $container
    };

}());