(function () {
    'use strict';

    window.poof = window.poof || {};

    /*** MODAL ***/

    $(document).ready( function () {
        // any clickable with the `.closemodale` class will dismiss the modal
        $('.closemodale').click(function (e) {
            e.preventDefault();
            $('.modale').removeClass('opened');
        });
    });

    // basic methods
    function openModal () {
        $('.modale')
            .addClass('opened')
            .attr('aria-hidden', 'false')
            .find('a[tabindex="-1"]')
                .attr({
                    "tabindex": "0",
                    "aria-hidden": "false"
                });
    }
    function closeModal () {
        $('.modale')
            .removeClass('opened')
            .attr('aria-hidden', 'true')
            .find('a[tabindex="0"]')
                .attr({
                    "tabindex": "-1",
                    "aria-hidden": "true"
                });
    }

    function modalBody (content, keep) {
        // append to content area of modal
        var $contentEl = $('#modal-body');
        // optionally clear the modal first
        if (!keep) {
            $contentEl.empty();
        }
        // write content to the modal
        $contentEl.append(content);
    }

    function modalFooter (content, keep) {
        var $contentEl = $('#modal-footer');
        if (!keep) {
            $contentEl.empty();
        }
        $contentEl.append(content);
    }

    function modalTitle (content) {
        // write the title box
        $('#modal-title').empty().append(content);
    }

    function modalWrite (title, body, footer) {
        // write to all three elements and open
        modalTitle(title);
        modalBody(body);
        modalFooter(footer);
        openModal();
    }

    var modal = {
        // exports
        open : openModal,
        close : closeModal,
        write : modalWrite,
        title : modalTitle,
        body : modalBody,
        footer: modalFooter
    };

    window.poof.modal = modal;

}());