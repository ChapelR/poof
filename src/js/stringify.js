(function () {

    // convert a passage's metadata and source code into a serializable object

    function createPassageObject (passage, noMeta) {
        var ret = {};
        // core data 
        Object.assign(ret, {
            name : passage.name,
            pid : passage.id,
            tags : passage.tags.split(' ').filter( function (tag) { return !!tag; }),
            source : passage.source
        });
        // metadata
        if (!noMeta) {
            Object.assign(ret, {
                referTo : passage.links.to,
                referFrom : passage.links.from,
                position : passage.pos,
                size : passage.size,
                rawTags : passage.tags
            });
        }
        return ret;
    }

    function createObjectFromAllPassages (noMeta) {
        var ret = [];
        Fast.forEach(poof.passages, function (psg) {
            ret.push(createPassageObject(psg, noMeta));
        });
        return ret;
    } 

    function stringifyPassages (options) {
        var opts = Object.assign({
            spaces : 0,
            meta : true
        }, options);
        opts.spaces = Math.trunc(opts.spaces);
        if (typeof opts.spaces !== 'number' || opts.spaces < 0) {
            opts.spaces = 0;
        } else if (opts.spaces > 8) {
            opts.spaces = 8;
        }
        opts.meta = !!opts.meta;
        try {
            return JSON.stringify(createObjectFromAllPassages(!opts.meta), null, opts.spaces || undefined);
        } catch (err) {
            console.error('Export failed -> ', err.message, err);
            alert('Export failed--see console for more information.');
        }
    }

    function getJSON (fileName) {

        var pretty = poof.config.json.pretty,
            meta = !!poof.config.json.verbose;

        download(stringifyPassages({
            spaces : pretty ? 4 : 0,
            meta : meta
        }), fileName, 'application/json;charset=utf-8');

        $(document).trigger(':json-export-end');

    }

    poof.stringify = stringifyPassages;
    poof.getJSON = getJSON;

}());