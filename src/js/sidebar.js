(function () {
    'use strict';

    var $container = $('#sidebar ul');
    var $sidebar = $('#sidebar');
    var $sidebarLink = $('#sidebar-link');

    function changeIcon (open) {
        $sidebarLink.empty().append(open ? '&#10060;' : '&#9776;')
    }

    function toggle () {
        $sidebar.toggleClass('closed');
        if ($sidebar.hasClass('closed')) {
            changeIcon(false);
        } else {
            changeIcon(true);
        }
    }

    function open () {
        $sidebar.removeClass('closed');
        changeIcon(true);
    }

    function close () {
        $sidebar.addClass('closed');
        changeIcon(false);
    }

    function clear () {
        return $container.empty();
    }

    function establish () {
        return Fast.map($('.passage-card').not('.hide').map( function () {
            return $(this).attr('name');
        }), function (name) {
            return $(document.createElement('li'))
                .append(poof.utils.jumpLink(name)
                    .addClass('sidebar-jump')
                    .on('click', function () {
                        close();
                    }));
        });
    }

    function populate () {
        clear().append(establish());
    }

    function init () {
        $sidebarLink.on('click', function () {
            toggle();
        });
        populate();
    }

    $(document).on(':filter-complete :sort-complete', function () {
        populate();
    });

    poof.sidebar = {
        clear : clear,
        populate : populate,
        $el : $sidebar,
        $content : $container,
        toggle : toggle,
        open : open,
        close : close
    };

    poof.init.sidebar = init;

}());