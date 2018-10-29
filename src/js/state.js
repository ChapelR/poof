(function () {
    'use strict';

    window.poof = window.poof || {};

    var key = '%%poof-' + poof.data.name + poof.data.ifid;

    function store () {
        if (!window.localStorage) {
            console.warn('Cannot access storage.');
            return {
                save : function () {},
                load : function () {},
                del : function () {}
            };
        }
        return {
            save : function (data) {
                localStorage.setItem(key, JSON.stringify(data));
            },
            load : function () {
                try {
                    return JSON.parse(localStorage.getItem(key) || '{ "hasData" : "hasData" }');
                } catch (err) {
                    console.warn(err);
                    return false;
                }
            },
            del : function () {
                localStorage.removeItem(key);
            }
        };
    }

    window.poof.store = store(); // storage methods, if possible

}());