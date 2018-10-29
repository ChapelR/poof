(function () {
    'use strict';

    window.poof = window.poof || {};
    window.poof.comments = window.poof.comments || {};

    function createImporter (id) {
        return poof.el('label', { for : id }, [

            poof.el('a', {
                classes : 'pure-button pure-button-primary'
            }, 'Import a File'),

            poof.el('input', { id : id, type : 'file' }).on('change', function (ev) {
                $(document).trigger(':load-open');
                poof.modal.close();
                var file = ev.target.files[0];
                var reader = new FileReader();

                $(reader).on('load', function (ev) {
                    var target = ev.currentTarget;

                    if (!target.result) {
                        return;
                    }

                    try {
                        poof.comments.import(target.result);
                    } catch (err) {
                        console.warn(err);
                        alert('Something went wrong. Error code: "raven". Please report this bug at: https://github.com/ChapelR/poof/issues/new');
                        return;
                    } finally {
                        $(document).trigger(':load-close');
                    }
                });

                reader.readAsText(file);
            })
        ]);
    }

    function importComments () {
        poof.modal.write('Import Comments', createImporter('comment-file-importer'), 
            poof.btn.normal('Cancel', poof.modal.close));
    }

    window.poof.comments.importer = importComments;

}());