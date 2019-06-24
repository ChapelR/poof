(function () {
    'use strict';
    // should probably be called 'storage.js'

    window.poof = window.poof || {};
    // create a local strorage key unique to this story
    // note: Twee2 doesn't require IFIDs; that's risky for this method
    var key = '%%poof-' + poof.data.name + poof.data.ifid;

    function store () {
        if (!window.localStorage) {
            console.warn('Cannot access storage.');
            // return no-ops to avoid throwing
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