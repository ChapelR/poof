(function () {
    'use strict';

    window.poof = window.poof || {};
    
    function textbox (id, label, placeholder, note) {
        return poof.el('div', { classes : 'pure-control-group' }, [
                poof.el('label', { for : id }, label),
                poof.el('input', { 
                    id : id, 
                    type : 'text', 
                    placeholder : placeholder || '' 
                }),
                poof.el('span', { classes : 'pure-form-message-inline' }, note || '')
            ]);
    }

    function checkbox (id, label) {
        return poof.el('div', { class : 'pure-controls' }, 
                poof.el('label', { for : id }, [ 
                    poof.el('input', { id : id, type : 'checkbox'}),
                    label
                ])
            );
    }

    function dropdown (id, label, opts) {
        if (!opts || !Array.isArray(opts) || !opts.length) {
            return;
        }
        return poof.el('div', { class : 'pure-controls' }, [
            poof.el('label', { for : id }, label),
            poof.el('select', { id : id }, Fast.map(opts, function (opt) {
                return poof.el('option', {}, opt);
            }))
        ]);
    }

    function textlist (id, label, placeholder, opts) {
        var listID = id + '-list';
        return poof.el('form', { classes : 'pure-form' }, 
            poof.el('fieldset', {}, [
                poof.el('label', {}, [ label, 
                    poof.el('input', { 'list': listID, id : id, placeholder : placeholder })]),
                poof.el('datalist', { id : listID }, Fast.map(opts, function (opt) {
                    return poof.el('option', { value : opt });
                }))
        ]));
    }

    function form (elements) {
        return poof.el('form', { classes : 'pure-form pure-form-aligned left-align' }, 
            poof.el('fieldset', {}, elements) );
    }

    function confirm (text, fn) {
        return poof.btn.primary(text, fn).addClass('confirm-btn');
    }

    function cancel (text, fn) {
        return poof.btn.normal(text, fn).addClass('cancel-btn');
    }

    window.poof.forms = {
        form : form,
        text : textbox,
        textlist : textlist,
        check : checkbox,
        select : dropdown,
        confirm : confirm,
        cancel : cancel
    };

}());